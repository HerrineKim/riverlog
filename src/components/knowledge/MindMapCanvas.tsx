"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ForceGraph3D, { type ForceGraphMethods } from "react-force-graph-3d";
import * as THREE from "three";
import SpriteText from "three-spritetext";
import useTheme from "@/hooks/useTheme";
import type { GraphLink, GraphNode } from "@/lib/knowledge";

type Node = GraphNode & { x?: number; y?: number; z?: number };
type Link = GraphLink & { source: string | Node; target: string | Node };

// Zoom bar maps camera distance on a log scale: 0 = farthest, 1 = closest
const MIN_DIST = 25;
const MAX_DIST = 4000;
const LOG_SPAN = Math.log(MAX_DIST) - Math.log(MIN_DIST);
const distToZoom = (d: number) => Math.min(1, Math.max(0, (Math.log(MAX_DIST) - Math.log(d)) / LOG_SPAN));
const zoomToDist = (z: number) => Math.exp(Math.log(MAX_DIST) - z * LOG_SPAN);

type OrbitControls = THREE.EventDispatcher<{ change: object }> & {
  target: THREE.Vector3;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  enableDamping?: boolean;
  minDistance?: number;
  maxDistance?: number;
  update?: () => void;
};
type Category = { id: string; name: string; color: string; count: number };

function useSize(ref: React.RefObject<HTMLElement | null>) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize({ width: e.contentRect.width, height: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return size;
}

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const REFERENCE_COLOR = { dark: "#f5c26b", light: "#975a16" } as const; // light value doubles as label text, so ≥4.5:1

export default function MindMapCanvas({
  data,
  categories,
}: {
  data: { nodes: GraphNode[]; links: GraphLink[] };
  categories: Category[];
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<ForceGraphMethods<Node> | undefined>(undefined);
  const { width, height } = useSize(wrapRef);
  const theme = useTheme();
  const dark = theme === "dark";
  const [selected, setSelected] = useState<Node | null>(null);
  const [query, setQuery] = useState("");

  // react-force-graph mutates nodes/links; give it its own copy once.
  const graphData = useMemo(
    () => ({ nodes: data.nodes.map((n) => ({ ...n })) as Node[], links: data.links.map((l) => ({ ...l })) }),
    [data],
  );

  const neighbors = useMemo(() => {
    const m = new Map<string, Set<string>>();
    for (const l of data.links) {
      if (!m.has(l.source)) m.set(l.source, new Set());
      if (!m.has(l.target)) m.set(l.target, new Set());
      m.get(l.source)!.add(l.target);
      m.get(l.target)!.add(l.source);
    }
    return m;
  }, [data]);

  // Note-to-note connections for the info card: explicit links first, then shared tags
  const connectionsOf = useMemo(() => {
    const byId = new Map(graphData.nodes.map((n) => [n.id, n]));
    const m = new Map<string, { node: Node; kind: "reference" | "related" }[]>();
    const add = (a: string, b: string, kind: "reference" | "related") => {
      const node = byId.get(b);
      if (node) m.set(a, [...(m.get(a) ?? []), { node, kind }]);
    };
    for (const l of data.links)
      if (l.kind === "reference" || l.kind === "related") {
        add(l.source, l.target, l.kind);
        add(l.target, l.source, l.kind);
      }
    for (const list of m.values()) list.sort((x, y) => (x.kind === y.kind ? 0 : x.kind === "reference" ? -1 : 1));
    return m;
  }, [data, graphData]);

  const childrenOf = useMemo(() => {
    const byId = new Map(graphData.nodes.map((n) => [n.id, n]));
    const m = new Map<string, Node[]>();
    for (const l of data.links)
      if (l.kind === "member") m.set(l.source, [...(m.get(l.source) ?? []), byId.get(l.target)!]);
    return m;
  }, [data, graphData]);

  const focus = selected;
  const isLit = useCallback(
    (id: string) => !focus || focus.id === id || !!neighbors.get(focus.id)?.has(id),
    [focus, neighbors],
  );

  // Forces + camera controls
  useEffect(() => {
    const fg = fgRef.current;
    if (!fg || !width) return;
    const link = fg.d3Force("link") as unknown as { distance?: (fn: (l: { target: Node }) => number) => void } | undefined;
    link?.distance?.((l) => {
      const kind = (l as unknown as GraphLink).kind;
      return kind === "hub" ? 150 : kind === "related" ? 60 : kind === "reference" ? 50 : 38;
    });
    const charge = fg.d3Force("charge") as unknown as { strength?: (n: number) => void } | undefined;
    charge?.strength?.(-45);
    const controls = fg.controls() as OrbitControls;
    controls.autoRotate = !reducedMotion();
    controls.autoRotateSpeed = 0.45;
    controls.enableDamping = true;
    controls.minDistance = MIN_DIST;
    controls.maxDistance = MAX_DIST;
  }, [width]);

  // Keep the zoom bar in sync with wheel/pinch zoom and camera flights
  const [zoom, setZoom] = useState(0.5);
  useEffect(() => {
    const fg = fgRef.current;
    if (!fg || !width) return;
    const controls = fg.controls() as OrbitControls;
    let frame = 0;
    const sync = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const d = fg.camera().position.distanceTo(controls.target);
        setZoom(Math.round(distToZoom(d) * 1000) / 1000);
      });
    };
    controls.addEventListener("change", sync);
    sync();
    return () => {
      cancelAnimationFrame(frame);
      controls.removeEventListener("change", sync);
    };
  }, [width]);

  const zoomTo = useCallback((z: number) => {
    const fg = fgRef.current;
    if (!fg) return;
    const controls = fg.controls() as OrbitControls;
    controls.autoRotate = false;
    const camera = fg.camera();
    const dir = camera.position.clone().sub(controls.target);
    if (dir.lengthSq() === 0) dir.set(0, 0, 1);
    camera.position.copy(controls.target).add(dir.normalize().multiplyScalar(zoomToDist(Math.min(1, Math.max(0, z)))));
    controls.update?.();
    setZoom(z);
  }, []);

  // Depth fog: far nodes fade into the background instead of competing for attention
  useEffect(() => {
    const fg = fgRef.current;
    if (!fg || !width) return;
    const scene = fg.scene();
    scene.fog = new THREE.FogExp2(dark ? 0x070a0e : 0xf3f4f0, 0.00055);
    return () => {
      scene.fog = null;
    };
  }, [dark, width]);

  const flyTo = useCallback((node: Node, distance = 90) => {
    const fg = fgRef.current;
    if (!fg || node.x === undefined) return;
    const controls = fg.controls() as { autoRotate?: boolean };
    controls.autoRotate = false;
    const r = Math.hypot(node.x, node.y ?? 0, node.z ?? 0) || 1;
    const ratio = 1 + distance / r;
    fg.cameraPosition(
      { x: node.x * ratio, y: (node.y ?? 0) * ratio, z: (node.z ?? 0) * ratio },
      { x: node.x, y: node.y ?? 0, z: node.z ?? 0 },
      1200,
    );
  }, []);

  const select = useCallback(
    (node: Node) => {
      setSelected(node);
      flyTo(node, node.kind === "category" ? 300 : 110);
    },
    [flyTo],
  );

  const reset = () => {
    setSelected(null);
    const fg = fgRef.current;
    if (!fg) return;
    fg.zoomToFit(1000, 60);
    (fg.controls() as { autoRotate?: boolean }).autoRotate = !reducedMotion();
  };

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return graphData.nodes.filter((n) => n.name.toLowerCase().includes(q)).slice(0, 8);
  }, [query, graphData]);

  // Spheres are rebuilt on every focus change; share a handful of geometries/materials instead of one per node.
  // (three-forcegraph disposes them on rebuild, and three.js re-uploads them on the next draw.)
  const geometriesRef = useRef(new Map<number, THREE.SphereGeometry>());
  const materialsRef = useRef(new Map<string, THREE.MeshLambertMaterial>());
  useEffect(() => {
    const geometries = geometriesRef.current;
    const materials = materialsRef.current;
    return () => {
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
    };
  }, []);

  const nodeObject = useCallback(
    (n: Node) => {
      const lit = isLit(n.id);
      const group = new THREE.Group();
      const radius = n.size;
      const geometries = geometriesRef.current;
      const materials = materialsRef.current;
      let geometry = geometries.get(radius);
      if (!geometry) geometries.set(radius, (geometry = new THREE.SphereGeometry(radius, 20, 16)));
      const opacity = lit ? (n.kind === "doc" ? 0.85 : 0.95) : 0.12;
      const key = `${n.color}|${opacity}|${dark}`;
      let material = materials.get(key);
      if (!material)
        materials.set(
          key,
          (material = new THREE.MeshLambertMaterial({
            color: n.color,
            emissive: n.color,
            emissiveIntensity: dark ? 0.45 : 0.08,
            transparent: true,
            opacity,
          })),
        );
      group.add(new THREE.Mesh(geometry, material));
      const showLabel = n.kind === "category" || (focus && lit);
      if (showLabel) {
        const label = new SpriteText(n.name);
        label.fontFace = "IBM Plex Sans KR, Apple SD Gothic Neo, sans-serif";
        label.fontWeight = n.kind === "doc" ? "500" : "700";
        label.textHeight = n.kind === "category" ? 14 : 3.6;
        label.color = n.kind === "category" ? n.color : dark ? "#cbd5e1" : "#1f2933";
        if (n.kind === "doc") {
          label.backgroundColor = dark ? "rgba(16,22,30,0.82)" : "rgba(255,255,255,0.88)";
          label.padding = 1.2;
          label.borderRadius = 2;
        }
        label.material.opacity = lit ? 1 : 0.18;
        label.material.depthWrite = false;
        label.position.set(0, radius + label.textHeight * 0.85, 0);
        group.add(label);
      }
      return group;
    },
    [dark, focus, isLit],
  );

  // Escape clears the selection, like clicking the background
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !(e.target instanceof HTMLInputElement)) setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div ref={wrapRef} className="relative h-full w-full overflow-hidden">
      <p className="sr-only">
        3D 마인드맵은 마우스나 터치로 보는 시각화예요. 화면 낭독기나 키보드로는 아래 검색창과 분야 버튼으로 노드를 고르거나,{" "}
        <Link href="/knowledge/dictionary">계층형 사전</Link>에서 같은 노트를 목록으로 볼 수 있어요.
      </p>
      {width > 0 && (
        <ForceGraph3D<Node>
          ref={fgRef}
          width={width}
          height={height}
          graphData={graphData}
          controlType="orbit"
          backgroundColor={dark ? "#070a0e" : "#f3f4f0"}
          showNavInfo={false}
          nodeThreeObject={nodeObject}
          linkColor={(l) => {
            const link = l as unknown as Link;
            const t = link.target as Node;
            const s = link.source as Node;
            const lit = !focus || (isLit(t.id) && isLit(s.id) && (focus.id === t.id || focus.id === s.id || link.kind === "member"));
            if (link.kind === "reference") return lit ? REFERENCE_COLOR[theme] : dark ? "#2a2416" : "#ece3d2";
            if (link.kind === "related") return lit ? (dark ? "#5b6b7d" : "#9aa39a") : dark ? "#161d26" : "#e6e8e2";
            if (!focus) return dark ? "#3a4a5a" : "#b9c0b5";
            return lit ? t.color : dark ? "#1a222c" : "#e1e4dd";
          }}
          linkVisibility={(l) => (l as unknown as Link).kind !== "hub"}
          linkOpacity={dark ? 0.35 : 0.55}
          linkWidth={(l) => ((l as unknown as Link).kind === "reference" ? 1.6 : 0)}
          linkCurvature={(l) => ((l as unknown as Link).kind === "reference" ? 0.18 : 0)}
          onNodeHover={(n) => {
            if (wrapRef.current) wrapRef.current.style.cursor = n ? "pointer" : "grab";
          }}
          onNodeClick={(n) => select(n as Node)}
          onBackgroundClick={() => setSelected(null)}
          warmupTicks={60}
          cooldownTicks={200}
          onEngineStop={() => !selected && fgRef.current?.zoomToFit(800, 60)}
        />
      )}

      {/* Search + legend */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="pointer-events-auto w-full max-w-xs">
          <div className="relative">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setQuery("");
                if (e.key === "Enter" && results[0]) {
                  select(results[0]);
                  setQuery("");
                }
              }}
              placeholder="노드 찾기…"
              aria-label="마인드맵에서 노드 찾기"
              className="w-full rounded-full border border-line bg-bg-elev/85 px-4 py-2 text-sm text-fg-strong outline-none backdrop-blur placeholder:text-muted focus:border-accent"
            />
            <p className="sr-only" aria-live="polite">
              {query.trim() ? `검색 결과 ${results.length}개${results.length ? ", Enter로 첫 결과로 이동" : ""}` : ""}
            </p>
            {results.length > 0 && (
              <ul className="absolute mt-2 w-full overflow-hidden rounded-xl border border-line bg-bg-elev/95 text-sm shadow-xl backdrop-blur">
                {results.map((r) => (
                  <li key={r.id}>
                    <button
                      type="button"
                      onClick={() => {
                        select(r);
                        setQuery("");
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-accent-soft"
                    >
                      <span className="size-2 shrink-0 rounded-full" style={{ background: r.color }} />
                      <span className="truncate text-fg-strong">{r.name}</span>
                      <span className="ml-auto shrink-0 text-xs text-muted">{r.kind === "doc" ? "노트" : "분야"}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <ul className="pointer-events-auto flex flex-wrap gap-1.5 sm:max-w-md sm:justify-end">
          {categories.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => {
                  const n = graphData.nodes.find((x) => x.id === c.id);
                  if (n) select(n);
                }}
                className="flex items-center gap-1.5 rounded-full border border-line bg-bg-elev/80 px-2.5 py-1 text-xs text-fg backdrop-blur transition hover:border-accent"
              >
                <span className="size-2 rounded-full" style={{ background: c.color, boxShadow: `0 0 8px ${c.color}` }} />
                {c.name}
                <span className="text-muted tabular-nums">{c.count}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <p className="sr-only" aria-live="polite">
        {selected ? `${selected.name} 선택됨. ${selected.kind === "doc" ? "노트" : "분야"}, ${selected.path}` : ""}
      </p>

      {/* Selected node card */}
      {selected && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center p-4 sm:justify-start">
          <div
            role="region"
            aria-label="선택한 노드"
            className="pointer-events-auto w-full max-w-sm rounded-2xl border border-line bg-bg-elev/90 p-4 shadow-2xl backdrop-blur-md"
          >
            {(() => {
              const n = selected;
              return (
                <>
                  <p className="flex items-center gap-2 text-xs text-muted">
                    <span className="size-2 rounded-full" style={{ background: n.color }} />
                    {n.path}
                  </p>
                  <p className="mt-1.5 text-lg font-semibold text-fg-strong">{n.name}</p>
                  {n.excerpt && <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-muted">{n.excerpt}</p>}
                  {selected && (childrenOf.get(n.id)?.length ?? 0) > 0 && (
                    <ul className="mt-3 max-h-48 space-y-0.5 overflow-y-auto border-t border-line pt-2 text-sm">
                      {childrenOf.get(n.id)!.map((c) => (
                        <li key={c.id}>
                          <button
                            onClick={() => select(c)}
                            className="flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-fg hover:bg-accent-soft hover:text-accent"
                          >
                            <span className="size-1.5 shrink-0 rounded-full" style={{ background: c.color }} />
                            <span className="truncate">{c.name}</span>
                            {c.kind !== "doc" && (
                              <span aria-hidden className="ml-auto text-xs text-muted">
                                ›
                              </span>
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  {selected && n.kind === "doc" && (connectionsOf.get(n.id)?.length ?? 0) > 0 && (
                    <div className="mt-3 border-t border-line pt-2">
                      <p className="mb-1 text-xs font-semibold tracking-wide text-muted">연결된 노트</p>
                      <ul className="max-h-40 space-y-0.5 overflow-y-auto text-sm">
                        {connectionsOf.get(n.id)!.map(({ node: c, kind }) => (
                          <li key={c.id}>
                            <button
                              onClick={() => select(c)}
                              className="flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-fg hover:bg-accent-soft hover:text-accent"
                            >
                              <span className="size-1.5 shrink-0 rounded-full" style={{ background: c.color }} />
                              <span className="truncate">{c.name}</span>
                              <span
                                className="ml-auto shrink-0 text-[0.7rem]"
                                style={{ color: kind === "reference" ? REFERENCE_COLOR[theme] : undefined }}
                              >
                                {kind === "reference" ? "링크" : "같은 태그"}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="mt-3 flex gap-2">
                    {n.href && (
                      <Link href={n.href} className="rounded-full bg-accent px-3.5 py-1.5 text-sm font-medium text-accent-ink hover:opacity-90">
                        {n.kind === "doc" ? "노트 열기" : "사전에서 보기"} <span aria-hidden>→</span>
                      </Link>
                    )}
                    {selected && (
                      <button onClick={reset} className="rounded-full border border-line px-3.5 py-1.5 text-sm text-muted hover:text-fg-strong">
                        전체 보기
                      </button>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Zoom bar */}
      <div role="group" aria-label="확대·축소" className="absolute right-4 bottom-20 flex flex-col items-center gap-1 rounded-full border border-line bg-bg-elev/85 p-1.5 shadow-lg backdrop-blur sm:top-1/2 sm:bottom-auto sm:-translate-y-1/2">
        <button
          onClick={() => zoomTo(zoom + 0.08)}
          aria-label="확대"
          className="grid size-8 place-items-center rounded-full text-lg leading-none text-fg-strong hover:bg-accent-soft hover:text-accent"
        >
          +
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.005}
          value={zoom}
          onChange={(e) => zoomTo(Number(e.target.value))}
          aria-label="확대·축소"
          aria-orientation="vertical"
          className="h-32 w-6 cursor-grab accent-[var(--accent)] active:cursor-grabbing sm:h-40"
          style={{ writingMode: "vertical-lr", direction: "rtl" }}
        />
        <button
          onClick={() => zoomTo(zoom - 0.08)}
          aria-label="축소"
          className="grid size-8 place-items-center rounded-full text-lg leading-none text-fg-strong hover:bg-accent-soft hover:text-accent"
        >
          −
        </button>
      </div>

      {!selected && (
        <p className="pointer-events-none absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-bg-elev/70 px-3 py-1 text-xs whitespace-nowrap text-muted backdrop-blur">
          <span className="hidden sm:inline">드래그해서 회전 · 스크롤이나 오른쪽 바로 확대 · 노드를 클릭해 이동 ·</span>
          <span className="inline-block h-0.5 w-4 rounded" style={{ background: REFERENCE_COLOR[theme] }} />
          노트 간 링크
          <span className="inline-block h-px w-4 bg-muted" />
          같은 태그
        </p>
      )}
    </div>
  );
}
