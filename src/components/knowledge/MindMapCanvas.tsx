"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ForceGraph2D, { type ForceGraphMethods } from "react-force-graph-2d";
import useSearchOnEnter from "@/hooks/useSearchOnEnter";
import useTheme from "@/hooks/useTheme";
import type { GraphLink, GraphNode } from "@/lib/knowledge";
import { makeMatcher } from "@/lib/search";

type Node = GraphNode & { x?: number; y?: number };
type Link = GraphLink & { source: string | Node; target: string | Node };

// Zoom bar maps the canvas zoom factor on a log scale: 0 = farthest, 1 = closest
const MIN_SCALE = 0.15;
const MAX_SCALE = 12;
const LOG_SPAN = Math.log(MAX_SCALE) - Math.log(MIN_SCALE);
const scaleToZoom = (k: number) => Math.min(1, Math.max(0, (Math.log(k) - Math.log(MIN_SCALE)) / LOG_SPAN));
const zoomToScale = (z: number) => Math.exp(Math.log(MIN_SCALE) + z * LOG_SPAN);

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

const REFERENCE_COLOR = { dark: "#f5c26b", light: "#975a16" } as const; // light value doubles as label text, so ≥4.5:1
const FONT = "IBM Plex Sans KR, Apple SD Gothic Neo, sans-serif";
// Doc labels appear on their own once zoomed in this far
const DOC_LABEL_SCALE = 2.2;

const linkVisibility = (l: object) => (l as Link).kind !== "hub";
const linkWidth = (l: object) => ((l as Link).kind === "reference" ? 0.9 : 0.6);
const linkCurvature = (l: object) => ((l as Link).kind === "reference" ? 0.18 : 0);
const nodePointerArea = (n: Node, color: string, ctx: CanvasRenderingContext2D) => {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(n.x ?? 0, n.y ?? 0, n.size + 1.5, 0, 2 * Math.PI);
  ctx.fill();
};

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
  // A new search drops the selection so its hits show
  const { query, draft, inputProps, clear } = useSearchOnEnter(() => setSelected(null));

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

  // Nodes whose name, summary, tags or path contain the submitted query
  const results = useMemo(() => {
    const match = makeMatcher(query);
    if (!match) return null;
    return graphData.nodes.filter((n) => match(`${n.name} ${n.excerpt ?? ""} ${n.path}`, n.tags));
  }, [query, graphData]);
  const hits = useMemo(() => (results?.length ? new Set(results.map((n) => n.id)) : null), [results]);

  // A selected node focuses its neighborhood; otherwise search hits stay lit
  const focus = selected;
  const isLit = useCallback(
    (id: string) => (focus ? focus.id === id || !!neighbors.get(focus.id)?.has(id) : !hits || hits.has(id)),
    [focus, hits, neighbors],
  );

  // Forces
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
  }, [width]);

  // Keep the zoom bar in sync with wheel/pinch zoom and animated transitions
  const [zoom, setZoom] = useState(0.5);
  const zoomFrame = useRef(0);
  const onZoom = useCallback(({ k }: { k: number }) => {
    cancelAnimationFrame(zoomFrame.current);
    zoomFrame.current = requestAnimationFrame(() => setZoom(Math.round(scaleToZoom(k) * 1000) / 1000));
  }, []);
  useEffect(() => () => cancelAnimationFrame(zoomFrame.current), []);

  const zoomTo = useCallback((z: number) => {
    const clamped = Math.min(1, Math.max(0, z));
    fgRef.current?.zoom(zoomToScale(clamped), 0);
    setZoom(clamped);
  }, []);

  const select = useCallback((node: Node) => {
    setSelected(node);
    const fg = fgRef.current;
    if (!fg || node.x === undefined) return;
    fg.centerAt(node.x, node.y, 800);
    fg.zoom(node.kind === "category" ? 2 : 4, 800);
  }, []);

  // Frame the search hits when there are any, the whole map otherwise
  const hitsRef = useRef(hits);
  useEffect(() => {
    hitsRef.current = hits;
  }, [hits]);
  const fit = useCallback(() => {
    const h = hitsRef.current;
    fgRef.current?.zoomToFit(800, 80, h ? (n: Node) => h.has(n.id) : undefined);
  }, []);

  const reset = () => {
    setSelected(null);
    fit();
  };

  useEffect(() => {
    fit();
  }, [hits, fit]);

  const drawNode = useCallback(
    (n: Node, ctx: CanvasRenderingContext2D, scale: number) => {
      const x = n.x ?? 0;
      const y = n.y ?? 0;
      const lit = isLit(n.id);
      ctx.globalAlpha = lit ? 1 : 0.15;
      if (dark && lit) {
        ctx.shadowColor = n.color;
        ctx.shadowBlur = n.kind === "category" ? 14 : 5;
      }
      ctx.fillStyle = n.color;
      ctx.beginPath();
      ctx.arc(x, y, n.size, 0, 2 * Math.PI);
      ctx.fill();
      ctx.shadowBlur = 0;

      const showLabel = n.kind === "category" || (focus || hits ? lit : scale >= DOC_LABEL_SCALE);
      if (showLabel) {
        // World-sized text, but never smaller than a readable size on screen
        const size = n.kind === "category" ? Math.max(8, 13 / scale) : Math.max(3, 11 / scale);
        ctx.font = `${n.kind === "doc" ? 500 : 700} ${size}px ${FONT}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        const ty = y - n.size - size * 0.3;
        if (n.kind === "doc") {
          const w = ctx.measureText(n.name).width;
          const pad = size * 0.3;
          ctx.fillStyle = dark ? "rgba(16,22,30,0.82)" : "rgba(255,255,255,0.88)";
          ctx.fillRect(x - w / 2 - pad, ty - size - pad * 0.5, w + pad * 2, size + pad);
          ctx.fillStyle = dark ? "#cbd5e1" : "#1f2933";
        } else {
          ctx.fillStyle = dark ? n.color : "#1f2933";
        }
        ctx.fillText(n.name, x, ty);
      }
      ctx.globalAlpha = 1;
    },
    [dark, focus, hits, isLit],
  );

  const linkColor = useCallback(
    (l: object) => {
      const link = l as Link;
      const t = link.target as Node;
      const s = link.source as Node;
      const lit = focus
        ? isLit(t.id) && isLit(s.id) && (focus.id === t.id || focus.id === s.id || link.kind === "member")
        : !hits || (hits.has(t.id) && hits.has(s.id));
      const dimmed = focus || hits;
      // Quiet in the overview; full strength only on the selected note's own links
      if (link.kind === "reference")
        return !dimmed ? `${REFERENCE_COLOR[theme]}66` : lit ? REFERENCE_COLOR[theme] : dark ? "#2a2416" : "#ece3d2";
      if (link.kind === "related") return lit ? (dark ? "#5b6b7d88" : "#9aa39a88") : dark ? "#161d26" : "#e6e8e2";
      if (!dimmed) return dark ? "#3a4a5a" : "#b9c0b5";
      return lit ? `${t.color}aa` : dark ? "#1a222c" : "#e1e4dd";
    },
    [dark, focus, hits, isLit, theme],
  );

  const onNodeHover = useCallback((n: Node | null) => {
    if (wrapRef.current) wrapRef.current.style.cursor = n ? "pointer" : "grab";
  }, []);
  const onBackgroundClick = useCallback(() => setSelected(null), []);
  const selectedRef = useRef<Node | null>(null);
  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);
  const onEngineStop = useCallback(() => {
    if (!selectedRef.current) fit();
  }, [fit]);

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
        마인드맵은 마우스나 터치로 보는 시각화예요. 화면 낭독기나 키보드로는 아래 검색창과 분야 버튼으로 노드를 고르거나,{" "}
        <Link href="/knowledge/dictionary">계층형 사전</Link>에서 같은 노트를 목록으로 볼 수 있어요.
      </p>
      {width > 0 && (
        <ForceGraph2D<Node>
          ref={fgRef}
          width={width}
          height={height}
          graphData={graphData}
          backgroundColor={dark ? "#070a0e" : "#f3f4f0"}
          minZoom={MIN_SCALE}
          maxZoom={MAX_SCALE}
          nodeCanvasObject={drawNode}
          nodePointerAreaPaint={nodePointerArea}
          linkColor={linkColor}
          linkVisibility={linkVisibility}
          linkWidth={linkWidth}
          linkCurvature={linkCurvature}
          onNodeHover={onNodeHover}
          onNodeClick={select}
          onBackgroundClick={onBackgroundClick}
          onZoom={onZoom}
          warmupTicks={100}
          cooldownTicks={150}
          onEngineStop={onEngineStop}
        />
      )}

      {/* Search + legend */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="pointer-events-auto w-full max-w-xs">
          <div className="relative">
            <input
              type="search"
              enterKeyHint="search"
              {...inputProps}
              placeholder="노드 찾기 · #태그 (Enter)"
              aria-label="마인드맵에서 노드 찾기"
              className="w-full rounded-full border border-line bg-bg-elev/85 px-4 py-2 text-sm text-fg-strong outline-none backdrop-blur placeholder:text-muted focus:border-accent"
            />
            <p className="sr-only" aria-live="polite">
              {results ? `검색 결과 ${results.length}개${results.length ? ", 일치하는 노드만 강조했어요" : ""}` : ""}
            </p>
            {draft.trim() && draft.trim() !== query && (
              <p className="mt-1.5 px-3 text-xs text-muted">Enter로 검색</p>
            )}
            {results && !selected && (
              <div className="mt-2 overflow-hidden rounded-xl border border-line bg-bg-elev/95 text-sm shadow-xl backdrop-blur">
                <p className="flex items-center justify-between gap-2 border-b border-line px-3 py-2 text-xs text-muted">
                  <span>
                    “{query}” {results.length ? `${results.length}개 일치` : "에 해당하는 노드가 없어요"}
                  </span>
                  <button type="button" onClick={clear} className="hover:text-fg-strong">
                    지우기
                  </button>
                </p>
                {results.length > 0 && (
                  <ul className="max-h-64 overflow-y-auto">
                    {results.map((r) => (
                      <li key={r.id}>
                        <button
                          type="button"
                          onClick={() => select(r)}
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
          <span className="hidden sm:inline">드래그해서 이동 · 스크롤이나 오른쪽 바로 확대 · 노드를 클릭해 초점 ·</span>
          <span className="inline-block h-px w-4 opacity-70" style={{ background: REFERENCE_COLOR[theme] }} />
          노트 간 링크
          <span className="inline-block h-px w-4 bg-muted" />
          같은 태그
        </p>
      )}
    </div>
  );
}
