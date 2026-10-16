import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import type { PlacedNode } from "@/lib/graph-layout";
import type { GraphLink } from "@/lib/knowledge";

/**
 * The whole map is three draw calls: every node in one THREE.Points, every edge in one
 * THREE.LineSegments, labels as plain HTML on top. Positions come pre-settled from the build,
 * a focus or search change only rewrites color buffers, and frames are drawn only while
 * something moves.
 */

export type Style = {
  dark: boolean;
  /** Whether a node is lit (selected neighborhood or search hit) */
  isLit: (id: string) => boolean;
  /** Whether an edge is lit */
  isLinkLit: (l: GraphLink) => boolean;
  /** Something is selected or searched, so unlit things recede */
  dimmed: boolean;
  /** Nodes that always carry a label */
  labelled: (n: PlacedNode) => boolean;
  /** Also label doc nodes near the camera */
  labelNearby: boolean;
};

type Callbacks = {
  onSelect: (n: PlacedNode) => void;
  onBackground: () => void;
  /** Zoom bar position, 0 = farthest, 1 = closest */
  onZoom: (z: number) => void;
};

// Zoom bar maps camera distance on a log scale
const MIN_DIST = 25;
const MAX_DIST = 4000;
const LOG_SPAN = Math.log(MAX_DIST) - Math.log(MIN_DIST);
const distToZoom = (d: number) => Math.min(1, Math.max(0, (Math.log(MAX_DIST) - Math.log(d)) / LOG_SPAN));
const zoomToDist = (z: number) => Math.exp(Math.log(MAX_DIST) - Math.min(1, Math.max(0, z)) * LOG_SPAN);

export const REFERENCE_COLOR = { dark: "#f5c26b", light: "#975a16" } as const; // light value doubles as label text, so ≥4.5:1
const BG = { dark: "#070a0e", light: "#f3f4f0" } as const;
const FONT = "IBM Plex Sans KR, Apple SD Gothic Neo, sans-serif";
const FOV = 50;
const TAN_HALF_FOV = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
// Doc labels show for notes this close to the camera, nearest first
const LABEL_NEAR = 220;
const MAX_NEAR_LABELS = 40;
const CURVE_SEGMENTS = 8;

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const POINT_VERTEX = /* glsl */ `
  attribute float size;
  attribute vec4 rgba;
  uniform float uScale;
  uniform float uSprite;
  uniform float uFogNear;
  uniform float uFogFar;
  varying vec4 vColor;
  varying float vFog;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vColor = rgba;
    vFog = smoothstep(uFogNear, uFogFar, -mv.z);
    // size is a world-space radius; the sprite is wider than the disc to leave room for the glow
    gl_PointSize = max(2.0, size * 2.0 * uSprite * uScale / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const POINT_FRAGMENT = /* glsl */ `
  uniform float uSprite;
  uniform float uGlow;
  uniform vec3 uFogColor;
  varying vec4 vColor;
  varying float vFog;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0 * uSprite; // 1.0 at the disc's edge
    float disc = 1.0 - smoothstep(0.86, 1.0, d);
    float glow = uGlow > 0.0 && d >= 1.0 ? uGlow * pow(max(0.0, 1.0 - (d - 1.0) / (uSprite - 1.0)), 2.0) : 0.0;
    float a = (disc + glow * 0.45) * vColor.a * (1.0 - vFog * 0.85);
    if (a < 0.01) discard;
    gl_FragColor = vec4(mix(vColor.rgb, uFogColor, vFog * 0.6), a);
    #include <colorspace_fragment>
  }
`;

export class MindMapScene {
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  private scene = new THREE.Scene();
  private points: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>;
  private lines: THREE.LineSegments<THREE.BufferGeometry, THREE.LineBasicMaterial>;
  private labelLayer = document.createElement("div");
  private labels: HTMLSpanElement[] = [];
  private shown = new Set<number>();
  private nodePos: THREE.Vector3[];
  private linkVerts: number[] = []; // first vertex of each link in the line buffer
  private linkVertCount: number[] = [];
  private visibleLinks: GraphLink[];
  private byId: Map<string, number>;
  private style: Style | null = null;
  private frame = 0;
  private flight: { from: THREE.Vector3; to: THREE.Vector3; fromT: THREE.Vector3; toT: THREE.Vector3; t0: number; ms: number } | null = null;
  private lastZoom = -1;
  private down: { id: number; x: number; y: number } | null = null;
  private pointers = new Set<number>();
  private lastTick = 0;
  private fitted = false;
  private hovered = -1;
  private ro: ResizeObserver;
  private projected = new THREE.Vector3();

  constructor(
    private host: HTMLElement,
    private nodes: PlacedNode[],
    links: GraphLink[],
    private cb: Callbacks,
  ) {
    this.byId = new Map(nodes.map((n, i) => [n.id, i]));
    this.nodePos = nodes.map((n) => new THREE.Vector3(n.x, n.y, n.z));

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.domElement.style.display = "block";
    this.renderer.domElement.style.touchAction = "none";
    host.appendChild(this.renderer.domElement);

    Object.assign(this.labelLayer.style, { position: "absolute", inset: "0", pointerEvents: "none", overflow: "hidden" });
    host.appendChild(this.labelLayer);

    this.camera = new THREE.PerspectiveCamera(FOV, 1, 1, 20000);
    this.camera.position.set(0, 0, 1200);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.minDistance = MIN_DIST;
    this.controls.maxDistance = MAX_DIST;
    this.controls.autoRotate = !reducedMotion();
    this.controls.autoRotateSpeed = 0.35;
    this.controls.addEventListener("change", this.requestRender);
    this.controls.addEventListener("start", this.stopMotion);

    // Nodes
    const pg = new THREE.BufferGeometry();
    pg.setAttribute("position", new THREE.Float32BufferAttribute(nodes.flatMap((n) => [n.x, n.y, n.z]), 3));
    pg.setAttribute("size", new THREE.Float32BufferAttribute(nodes.map((n) => n.size), 1));
    pg.setAttribute("rgba", new THREE.Float32BufferAttribute(new Float32Array(nodes.length * 4), 4));
    this.points = new THREE.Points(
      pg,
      new THREE.ShaderMaterial({
        vertexShader: POINT_VERTEX,
        fragmentShader: POINT_FRAGMENT,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uScale: { value: 1 },
          uSprite: { value: 1 },
          uGlow: { value: 0 },
          uFogNear: { value: 0 },
          uFogFar: { value: 1 },
          uFogColor: { value: new THREE.Color() },
        },
      }),
    );
    this.points.frustumCulled = false;
    this.points.renderOrder = 1; // nodes always over edges, whatever the camera angle
    this.scene.add(this.points);

    // Edges; note-to-note links bow outward as curves, pre-tessellated into short segments
    this.visibleLinks = links.filter((l) => l.kind !== "hub" && this.byId.has(l.source) && this.byId.has(l.target));
    const pos: number[] = [];
    const a = new THREE.Vector3();
    const b = new THREE.Vector3();
    const c = new THREE.Vector3();
    const curve = new THREE.QuadraticBezierCurve3(a, c, b);
    for (const l of this.visibleLinks) {
      a.copy(this.nodePos[this.byId.get(l.source)!]);
      b.copy(this.nodePos[this.byId.get(l.target)!]);
      this.linkVerts.push(pos.length / 3);
      if (l.kind === "reference") {
        const mid = a.clone().add(b).multiplyScalar(0.5);
        const out = mid.lengthSq() > 1 ? mid.clone().normalize() : new THREE.Vector3(0, 1, 0);
        c.copy(mid).addScaledVector(out, a.distanceTo(b) * 0.18);
        const pts = curve.getPoints(CURVE_SEGMENTS);
        for (let i = 0; i < CURVE_SEGMENTS; i++) pos.push(...pts[i].toArray(), ...pts[i + 1].toArray());
        this.linkVertCount.push(CURVE_SEGMENTS * 2);
      } else {
        pos.push(...a.toArray(), ...b.toArray());
        this.linkVertCount.push(2);
      }
    }
    const lg = new THREE.BufferGeometry();
    lg.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    lg.setAttribute("color", new THREE.Float32BufferAttribute(new Float32Array((pos.length / 3) * 4), 4));
    this.lines = new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false }));
    this.lines.frustumCulled = false;
    this.scene.add(this.lines);

    // Labels: one span per node, only the visible ones get displayed and positioned
    for (const n of nodes) {
      const s = document.createElement("span");
      s.textContent = n.name;
      Object.assign(s.style, {
        position: "absolute",
        left: "0",
        top: "0",
        display: "none",
        whiteSpace: "nowrap",
        font: `${n.kind === "doc" ? 500 : 700} ${n.kind === "doc" ? 11 : 13}px ${FONT}`,
        padding: n.kind === "doc" ? "1px 4px" : "0",
        borderRadius: "3px",
        willChange: "transform",
      });
      this.labelLayer.appendChild(s);
      this.labels.push(s);
    }

    const el = this.renderer.domElement;
    el.addEventListener("pointerdown", this.onPointerDown);
    el.addEventListener("pointerup", this.onPointerUp);
    el.addEventListener("pointermove", this.onPointerMove);
    el.addEventListener("pointerleave", this.onPointerLeave);
    el.addEventListener("pointercancel", this.onPointerCancel);
    el.style.cursor = "grab";

    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(host);
    this.resize();
  }

  // ---- public API --------------------------------------------------------------------------

  setStyle(style: Style) {
    const themeChanged = this.style?.dark !== style.dark;
    this.style = style;
    const { dark } = style;
    const theme = dark ? "dark" : "light";
    if (themeChanged) {
      const bg = new THREE.Color(BG[theme]);
      this.renderer.setClearColor(bg);
      const u = this.points.material.uniforms;
      u.uFogColor.value.copy(bg);
      u.uGlow.value = dark ? 1 : 0;
      u.uSprite.value = dark ? 2.4 : 1;
      this.points.material.blending = dark ? THREE.AdditiveBlending : THREE.NormalBlending;
      this.points.material.needsUpdate = true;
    }

    // Node colors
    const rgba = this.points.geometry.getAttribute("rgba") as THREE.BufferAttribute;
    const col = new THREE.Color();
    this.nodes.forEach((n, i) => {
      col.set(n.color);
      const lit = style.isLit(n.id);
      rgba.setXYZW(i, col.r, col.g, col.b, lit ? (n.kind === "doc" ? 0.9 : 1) : dark ? 0.12 : 0.15);
    });
    rgba.needsUpdate = true;

    // Edge colors; quiet in the overview, full strength only on the selected note's own links
    const lc = this.lines.geometry.getAttribute("color") as THREE.BufferAttribute;
    const ref = new THREE.Color(REFERENCE_COLOR[theme]);
    const related = new THREE.Color(dark ? "#5b6b7d" : "#8c968c");
    const member = new THREE.Color(dark ? "#3a4a5a" : "#a9b1a4");
    this.visibleLinks.forEach((l, i) => {
      const lit = style.isLinkLit(l);
      let alpha: number;
      if (l.kind === "reference") {
        col.copy(ref);
        alpha = !style.dimmed ? 0.4 : lit ? 1 : 0.06;
      } else if (l.kind === "related") {
        col.copy(related);
        alpha = !style.dimmed ? 0.18 : lit ? 0.5 : 0.05;
      } else if (!style.dimmed) {
        col.copy(member);
        alpha = dark ? 0.35 : 0.5;
      } else {
        col.set(this.nodes[this.byId.get(l.target)!].color);
        alpha = lit ? 0.67 : 0.05;
      }
      const start = this.linkVerts[i];
      for (let v = 0; v < this.linkVertCount[i]; v++) lc.setXYZW(start + v, col.r, col.g, col.b, alpha);
    });
    lc.needsUpdate = true;

    // Label look
    this.nodes.forEach((n, i) => {
      const s = this.labels[i];
      const lit = style.isLit(n.id);
      if (n.kind === "doc") {
        s.style.background = dark ? "rgba(16,22,30,0.82)" : "rgba(255,255,255,0.88)";
        s.style.color = dark ? "#cbd5e1" : "#1f2933";
      } else {
        s.style.color = dark ? n.color : "#1f2933";
        s.style.textShadow = dark ? `0 0 10px ${n.color}66` : "0 0 4px #f3f4f0";
      }
      s.style.opacity = lit ? "1" : "0.25";
    });
    this.requestRender();
  }

  /** Fly to a node, close enough to read its neighborhood. */
  focusOn(n: PlacedNode) {
    const i = this.byId.get(n.id);
    if (i === undefined) return;
    this.stopMotion();
    const target = this.nodePos[i];
    const dir = this.viewDir();
    this.flyTo(target.clone().addScaledVector(dir, n.kind === "category" ? 300 : 110), target.clone(), 900);
  }

  /** Frame the given nodes, or the whole map. */
  fit(ids: Set<string> | null, ms = 800) {
    const pts = ids ? this.nodes.flatMap((n, i) => (ids.has(n.id) ? [this.nodePos[i]] : [])) : this.nodePos;
    if (!pts.length) return;
    const sphere = new THREE.Sphere().setFromPoints(pts);
    const fitAngle = Math.min(THREE.MathUtils.degToRad(FOV / 2), Math.atan(TAN_HALF_FOV * this.camera.aspect));
    const dist = THREE.MathUtils.clamp((Math.max(sphere.radius, 20) / Math.sin(fitAngle)) * 0.9, MIN_DIST, MAX_DIST);
    const dir = this.viewDir();
    this.flyTo(sphere.center.clone().addScaledVector(dir, dist), sphere.center.clone(), ms);
  }

  zoomTo(z: number) {
    this.stopMotion();
    const dir = this.viewDir();
    this.camera.position.copy(this.controls.target).addScaledVector(dir, zoomToDist(z));
    this.controls.update();
    this.requestRender();
  }

  /** Back to the slow idle spin, unless the viewer prefers less motion. */
  resumeSpin() {
    this.controls.autoRotate = !reducedMotion();
    this.requestRender();
  }

  dispose() {
    cancelAnimationFrame(this.frame);
    this.ro.disconnect();
    const el = this.renderer.domElement;
    el.removeEventListener("pointerdown", this.onPointerDown);
    el.removeEventListener("pointerup", this.onPointerUp);
    el.removeEventListener("pointermove", this.onPointerMove);
    el.removeEventListener("pointerleave", this.onPointerLeave);
    el.removeEventListener("pointercancel", this.onPointerCancel);
    this.controls.removeEventListener("change", this.requestRender);
    this.controls.removeEventListener("start", this.stopMotion);
    this.controls.dispose();
    this.points.geometry.dispose();
    this.points.material.dispose();
    this.lines.geometry.dispose();
    this.lines.material.dispose();
    this.renderer.forceContextLoss();
    this.renderer.dispose();
    el.remove();
    this.labelLayer.remove();
  }

  // ---- internals ---------------------------------------------------------------------------

  /** Unit vector from the orbit target to the camera. */
  private viewDir() {
    return this.camera.position.clone().sub(this.controls.target).normalize();
  }

  private stopMotion = () => {
    this.controls.autoRotate = false;
    this.flight = null;
  };

  private flyTo(position: THREE.Vector3, target: THREE.Vector3, ms: number) {
    if (ms <= 0 || reducedMotion()) {
      this.flight = null;
      this.camera.position.copy(position);
      this.controls.target.copy(target);
      this.controls.update();
    } else {
      this.flight = {
        from: this.camera.position.clone(),
        to: position,
        fromT: this.controls.target.clone(),
        toT: target,
        t0: performance.now(),
        ms,
      };
    }
    this.requestRender();
  }

  private resize() {
    const { clientWidth: w, clientHeight: h } = this.host;
    if (!w || !h) return;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    // Pixels per world unit at distance 1, so point sizes match the world radius
    this.points.material.uniforms.uScale.value =
      (h * this.renderer.getPixelRatio()) / (2 * TAN_HALF_FOV);
    // Frame the map once the real aspect is known
    if (!this.fitted) {
      this.fitted = true;
      this.fit(null, 0);
    }
    this.requestRender();
  }

  private requestRender = () => {
    if (!this.frame) this.frame = requestAnimationFrame(this.tick);
  };

  private tick = (now: number) => {
    this.frame = 0;
    // Spin by elapsed time, not per frame, so 120Hz screens don't spin twice as fast
    const dt = this.lastTick ? Math.min(0.1, (now - this.lastTick) / 1000) : 1 / 60;
    let moving = false;
    if (this.flight) {
      const f = this.flight;
      const t = Math.min(1, (performance.now() - f.t0) / f.ms);
      const e = t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
      this.camera.position.lerpVectors(f.from, f.to, e);
      this.controls.target.lerpVectors(f.fromT, f.toT, e);
      if (t >= 1) this.flight = null;
      moving = true;
    }
    // update() reports whether damping or auto-rotation moved the camera this frame
    if (this.controls.update(dt)) moving = true;
    this.render();
    const again = moving || this.controls.autoRotate;
    this.lastTick = again ? now : 0;
    if (again) this.requestRender();
  };

  private render() {
    const dist = this.camera.position.distanceTo(this.controls.target);
    const u = this.points.material.uniforms;
    // Fade what lies well behind the focus point, like depth fog
    u.uFogNear.value = dist * 0.9;
    u.uFogFar.value = dist * 2.4;
    this.renderer.render(this.scene, this.camera);
    this.placeLabels(dist);

    const z = Math.round(distToZoom(dist) * 1000) / 1000;
    if (z !== this.lastZoom) {
      this.lastZoom = z;
      this.cb.onZoom(z);
    }
  }

  private placeLabels(dist: number) {
    const style = this.style;
    if (!style) return;
    const w = this.host.clientWidth;
    const h = this.host.clientHeight;
    const next = new Set<number>();
    const near: { i: number; d: number }[] = [];
    const camPos = this.camera.position;
    const nearLimit = Math.min(LABEL_NEAR, dist * 1.4);

    this.nodes.forEach((n, i) => {
      if (style.labelled(n)) next.add(i);
      else if (style.labelNearby && n.kind === "doc") {
        const d = this.nodePos[i].distanceTo(camPos);
        if (d < nearLimit) near.push({ i, d });
      }
    });
    near.sort((x, y) => x.d - y.d);
    for (const { i } of near.slice(0, MAX_NEAR_LABELS)) next.add(i);

    for (const i of this.shown) if (!next.has(i)) this.labels[i].style.display = "none";
    for (const i of next) {
      const p = this.projected.copy(this.nodePos[i]).project(this.camera);
      const s = this.labels[i];
      if (p.z > 1 || p.x < -1.2 || p.x > 1.2 || p.y < -1.2 || p.y > 1.2) {
        s.style.display = "none";
        continue;
      }
      const x = ((p.x + 1) / 2) * w;
      const y = ((1 - p.y) / 2) * h;
      // Lift the label above the disc: the node's on-screen radius plus a small gap
      const r = (this.nodes[i].size * h) / (2 * TAN_HALF_FOV * this.nodePos[i].distanceTo(camPos));
      s.style.display = "block";
      s.style.transform = `translate(${x}px, ${y - r - 3}px) translate(-50%, -100%)`;
    }
    this.shown = next;
  }

  /** Nearest node under the pointer, in screen space: cheaper and steadier than ray-casting tiny points. */
  private pick(clientX: number, clientY: number): number {
    const rect = this.renderer.domElement.getBoundingClientRect();
    const mx = clientX - rect.left;
    const my = clientY - rect.top;
    const { width: w, height: h } = rect;
    const k = h / (2 * TAN_HALF_FOV);
    const camPos = this.camera.position;
    let best = -1;
    let bestDepth = Infinity;
    this.nodes.forEach((n, i) => {
      const p = this.projected.copy(this.nodePos[i]).project(this.camera);
      if (p.z > 1) return;
      const dx = ((p.x + 1) / 2) * w - mx;
      const dy = ((1 - p.y) / 2) * h - my;
      const depth = this.nodePos[i].distanceTo(camPos);
      const r = Math.max(6, (n.size * k) / depth + 3);
      if (dx * dx + dy * dy <= r * r && depth < bestDepth) {
        best = i;
        bestDepth = depth;
      }
    });
    return best;
  }

  private onPointerDown = (e: PointerEvent) => {
    this.pointers.add(e.pointerId);
    // Only a lone primary press can become a click; a second finger makes it a pinch
    this.down = e.button === 0 && this.pointers.size === 1 ? { id: e.pointerId, x: e.clientX, y: e.clientY } : null;
  };

  private onPointerUp = (e: PointerEvent) => {
    this.pointers.delete(e.pointerId);
    const d = this.down;
    if (d?.id !== e.pointerId) return;
    this.down = null;
    // A drag rotates the map; only a near-stationary press counts as a click
    if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > 5) return;
    const i = this.pick(e.clientX, e.clientY);
    if (i >= 0) this.cb.onSelect(this.nodes[i]);
    else this.cb.onBackground();
  };

  private onPointerMove = (e: PointerEvent) => {
    if (e.pointerType !== "mouse" || e.buttons) return;
    const i = this.pick(e.clientX, e.clientY);
    if (i !== this.hovered) {
      this.hovered = i;
      this.renderer.domElement.style.cursor = i >= 0 ? "pointer" : "grab";
    }
  };

  private onPointerLeave = () => {
    this.hovered = -1;
    this.renderer.domElement.style.cursor = "grab";
  };

  private onPointerCancel = (e: PointerEvent) => {
    this.pointers.delete(e.pointerId);
    this.down = null;
  };
}
