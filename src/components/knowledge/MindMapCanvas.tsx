"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ForceGraph3D, { type ForceGraphMethods } from "react-force-graph-3d";
import * as THREE from "three";
import SpriteText from "three-spritetext";
import type { GraphLink, GraphNode } from "@/lib/knowledge";

type Node = GraphNode & { x?: number; y?: number; z?: number };
type Category = { id: string; name: string; color: string; count: number };

function useTheme() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  useEffect(() => {
    const root = document.documentElement;
    const read = () => setTheme(root.getAttribute("data-theme") === "light" ? "light" : "dark");
    read();
    const mo = new MutationObserver(read);
    mo.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, []);
  return theme;
}

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
  const [hovered, setHovered] = useState<Node | null>(null);
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

  const childrenOf = useMemo(() => {
    const byId = new Map(graphData.nodes.map((n) => [n.id, n]));
    const m = new Map<string, Node[]>();
    for (const l of data.links)
      if (l.kind === "member") m.set(l.source, [...(m.get(l.source) ?? []), byId.get(l.target)!]);
    return m;
  }, [data, graphData]);

  const focus = selected ?? hovered;
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
      return kind === "hub" ? 150 : kind === "related" ? 60 : 38;
    });
    const charge = fg.d3Force("charge") as unknown as { strength?: (n: number) => void } | undefined;
    charge?.strength?.(-45);
    const controls = fg.controls() as { autoRotate?: boolean; autoRotateSpeed?: number; enableDamping?: boolean };
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.45;
    controls.enableDamping = true;
  }, [width]);

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
    (fg.controls() as { autoRotate?: boolean }).autoRotate = true;
  };

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return graphData.nodes.filter((n) => n.name.toLowerCase().includes(q)).slice(0, 8);
  }, [query, graphData]);

  const nodeObject = useCallback(
    (n: Node) => {
      const lit = isLit(n.id);
      const group = new THREE.Group();
      const radius = n.size;
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(radius, 24, 24),
        new THREE.MeshLambertMaterial({
          color: n.color,
          emissive: n.color,
          emissiveIntensity: dark ? 0.45 : 0.08,
          transparent: true,
          opacity: lit ? (n.kind === "doc" ? 0.85 : 0.95) : 0.12,
        }),
      );
      group.add(sphere);
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

  return (
    <div ref={wrapRef} className="relative h-full w-full overflow-hidden">
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
            const t = l.target as Node;
            const s = l.source as Node;
            if ((l as unknown as GraphLink).kind === "related") return dark ? "#5b6b7d" : "#9aa39a";
            if (!focus) return dark ? "#3a4a5a" : "#b9c0b5";
            return isLit(t.id) && isLit(s.id) ? t.color : dark ? "#1a222c" : "#e1e4dd";
          }}
          linkVisibility={(l) => (l as unknown as GraphLink).kind !== "hub"}
          linkOpacity={dark ? 0.28 : 0.5}
          linkWidth={0}
          onNodeHover={(n) => {
            setHovered((n as Node) ?? null);
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
              placeholder="노드 찾기…"
              aria-label="마인드맵에서 노드 찾기"
              className="w-full rounded-full border border-line bg-bg-elev/85 px-4 py-2 text-sm text-fg-strong outline-none backdrop-blur placeholder:text-muted focus:border-accent"
            />
            {results.length > 0 && (
              <ul className="absolute mt-2 w-full overflow-hidden rounded-xl border border-line bg-bg-elev/95 text-sm shadow-xl backdrop-blur">
                {results.map((r) => (
                  <li key={r.id}>
                    <button
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

      {/* Selected / hovered node card */}
      {(selected ?? hovered) && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center p-4 sm:justify-start">
          <div className="pointer-events-auto w-full max-w-sm rounded-2xl border border-line bg-bg-elev/90 p-4 shadow-2xl backdrop-blur-md">
            {(() => {
              const n = (selected ?? hovered)!;
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
                            {c.kind !== "doc" && <span className="ml-auto text-xs text-muted">›</span>}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-3 flex gap-2">
                    {n.href && (
                      <Link href={n.href} className="rounded-full bg-accent px-3.5 py-1.5 text-sm font-medium text-accent-ink hover:opacity-90">
                        {n.kind === "doc" ? "노트 열기" : "사전에서 보기"} →
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

      {!selected && !hovered && (
        <p className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-bg-elev/70 px-3 py-1 text-xs whitespace-nowrap text-muted backdrop-blur">
          드래그해서 회전 · 스크롤로 확대 · 노드를 클릭해 이동
        </p>
      )}
    </div>
  );
}
