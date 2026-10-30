"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useSearchOnEnter from "@/hooks/useSearchOnEnter";
import useTheme from "@/hooks/useTheme";
import useUrlState from "@/hooks/useUrlState";
import type { PlacedNode } from "@/lib/graph-layout";
import type { GraphLink } from "@/lib/knowledge";
import { makeMatcher } from "@/lib/search";
import { MindMapScene, REFERENCE_COLOR, toneFor } from "./mindmap-scene";

type Category = { id: string; name: string; color: string; count: number };

function webglAvailable() {
  const gl = document.createElement("canvas").getContext("webgl2");
  gl?.getExtension("WEBGL_lose_context")?.loseContext();
  return !!gl;
}

export default function MindMapCanvas({
  data,
  categories,
}: {
  data: { nodes: PlacedNode[]; links: GraphLink[] };
  categories: Category[];
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<MindMapScene | null>(null);
  const [failed, setFailed] = useState(() => !webglAvailable());
  const theme = useTheme();
  const dark = theme === "dark";
  const byId = useMemo(() => new Map(data.nodes.map((n) => [n.id, n])), [data]);
  // The focused node and the search live in the URL, so a view of the map can be shared
  const [selectedId, setSelectedId] = useUrlState("node", "");
  const selected = byId.get(selectedId) ?? null;
  const setSelected = useCallback((node: PlacedNode | null) => setSelectedId(node?.id ?? ""), [setSelectedId]);
  // A new search drops the selection so its hits show
  const { query, draft, inputProps, clear } = useSearchOnEnter("q", () => setSelected(null));

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
    const m = new Map<string, { node: PlacedNode; kind: "reference" | "related" }[]>();
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
  }, [data, byId]);

  const childrenOf = useMemo(() => {
    const m = new Map<string, PlacedNode[]>();
    for (const l of data.links)
      if (l.kind === "member") m.set(l.source, [...(m.get(l.source) ?? []), byId.get(l.target)!]);
    return m;
  }, [data, byId]);

  // Nodes whose name, summary, tags or path contain the submitted query
  const results = useMemo(() => {
    const match = makeMatcher(query);
    if (!match) return null;
    return data.nodes.filter((n) => match(`${n.name} ${n.excerpt ?? ""} ${n.path}`, n.tags));
  }, [query, data]);
  const hits = useMemo(() => (results?.length ? new Set(results.map((n) => n.id)) : null), [results]);

  // A selected node focuses its neighborhood; otherwise search hits stay lit
  const isLit = useCallback(
    (id: string) => (selected ? selected.id === id || !!neighbors.get(selected.id)?.has(id) : !hits || hits.has(id)),
    [selected, hits, neighbors],
  );

  const isLinkLit = useCallback(
    (l: GraphLink) =>
      selected
        ? isLit(l.target) && isLit(l.source) && (selected.id === l.target || selected.id === l.source || l.kind === "member")
        : !hits || (hits.has(l.target) && hits.has(l.source)),
    [selected, hits, isLit],
  );

  const [zoom, setZoom] = useState(0.5);

  const select = useCallback(
    (node: PlacedNode) => {
      setSelected(node);
      sceneRef.current?.focusOn(node);
    },
    [setSelected],
  );
  const onBackground = useCallback(() => setSelected(null), [setSelected]);

  // One scene per data set; it draws on demand and owns its canvas and label layer
  useEffect(() => {
    const host = stageRef.current;
    if (!host || failed) return;
    let scene: MindMapScene;
    try {
      scene = new MindMapScene(host, data.nodes, data.links, { onSelect: select, onBackground, onZoom: setZoom });
    } catch {
      // The probe passed but the renderer still failed (context limit, blocklisted GPU)
      queueMicrotask(() => setFailed(true));
      return;
    }
    sceneRef.current = scene;
    // A shared link opens on its node
    const linked = byId.get(new URLSearchParams(location.search).get("node") ?? "");
    if (linked) scene.focusOn(linked);
    return () => {
      scene.dispose();
      sceneRef.current = null;
    };
    }, [data, byId, failed, select, onBackground]);

  // Restyle on focus, search or theme changes: only color buffers are rewritten
  useEffect(() => {
    sceneRef.current?.setStyle({
      dark,
      isLit,
      isLinkLit,
      dimmed: !!(selected || hits),
      labelled: (n) => n.kind === "category" || (!!(selected || hits) && isLit(n.id)),
      labelNearby: !(selected || hits),
    });
  }, [data, dark, selected, hits, isLit, isLinkLit]);

  const zoomTo = useCallback((z: number) => {
    const clamped = Math.min(1, Math.max(0, z));
    sceneRef.current?.zoomTo(clamped);
    setZoom(clamped);
  }, []);

  // Frame the search hits when there are any, the whole map otherwise
  const reset = () => {
    setSelected(null);
    sceneRef.current?.fit(hits);
    if (!hits) sceneRef.current?.resumeSpin();
  };

  const firstFit = useRef(true);
  useEffect(() => {
    if (firstFit.current) {
      firstFit.current = false;
      return;
    }
    sceneRef.current?.fit(hits);
  }, [hits]);

  // Escape clears the selection, like clicking the background
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !(e.target instanceof HTMLInputElement)) setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setSelected]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div ref={stageRef} className="absolute inset-0" />
      <p className="sr-only">
        3D 마인드맵은 마우스나 터치로 보는 시각화예요. 화면 낭독기나 키보드로는 아래 검색창과 분야 버튼으로 노드를 고르거나,{" "}
        <Link href="/knowledge/dictionary">계층형 사전</Link>에서 같은 노트를 목록으로 볼 수 있어요.
      </p>
      {failed && (
        <div className="absolute inset-0 grid place-items-center p-6 text-center text-sm text-muted">
          <p>
            이 브라우저에서는 3D 마인드맵을 그릴 수 없어요(WebGL 미지원).{" "}
            <Link href="/knowledge/dictionary" className="text-accent underline">
              계층형 사전
            </Link>
            에서 같은 노트를 볼 수 있어요.
          </p>
        </div>
      )}

      {/* Search + legend */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="pointer-events-auto w-full max-w-xs">
          <div className="relative">
            <input
              type="search"
              enterKeyHint="search"
              {...inputProps}
              placeholder="노드나 #태그 찾기…"
              aria-label="마인드맵에서 노드 찾기"
              className="w-full min-h-11 rounded-lg border border-control bg-bg-elev/95 px-4 py-2 text-sm text-fg-strong placeholder:text-muted focus:border-accent"
            />
            <p className="sr-only" aria-live="polite">
              {results ? `검색 결과 ${results.length}개${results.length ? ", 일치하는 노드만 강조했어요" : ""}` : ""}
            </p>
            {draft.trim() && draft.trim() !== query && (
              <p className="mt-1.5 px-3 text-xs text-muted">Enter로 검색</p>
            )}
            {results && !selected && (
              <div className="mt-2 overflow-hidden rounded-xl border border-line bg-bg-elev text-sm shadow-xl">
                <p className="flex items-center justify-between gap-2 border-b border-line px-3 py-2 text-xs text-muted">
                  <span>
                    “{query}” {results.length ? `${results.length}개 일치` : "에 해당하는 노드가 없어요"}
                  </span>
                  <button type="button" onClick={clear} className="-my-1 rounded-md px-2 py-1 hover:text-fg-strong pointer-coarse:min-h-11">
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
                          className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-accent-soft pointer-coarse:min-h-11"
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
                type="button"
                onClick={() => {
                  const n = byId.get(c.id);
                  if (n) select(n);
                }}
                className="flex items-center gap-1.5 rounded-full border border-line bg-bg-elev/95 px-2.5 py-1 text-xs text-fg transition hover:border-accent pointer-coarse:min-h-11"
              >
                <span className="size-2 rounded-full" style={{ background: toneFor(c.color, dark), boxShadow: `0 0 8px ${toneFor(c.color, dark)}${dark ? "" : "66"}` }} />
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
            className="pointer-events-auto w-full max-w-sm rounded-2xl border border-line bg-bg-elev p-4 shadow-2xl"
          >
            <p className="flex items-center gap-2 text-xs text-muted">
              <span className="size-2 rounded-full" style={{ background: selected.color }} />
              {selected.path}
            </p>
            <p className="mt-1.5 text-lg font-semibold text-fg-strong">{selected.name}</p>
            {selected.excerpt && <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-muted">{selected.excerpt}</p>}
            {(childrenOf.get(selected.id)?.length ?? 0) > 0 && (
              <ul className="mt-3 max-h-48 space-y-0.5 overflow-y-auto border-t border-line pt-2 text-sm">
                {childrenOf.get(selected.id)!.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => select(c)}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-fg hover:bg-accent-soft hover:text-accent pointer-coarse:min-h-11"
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
            {selected.kind === "doc" && (connectionsOf.get(selected.id)?.length ?? 0) > 0 && (
              <div className="mt-3 border-t border-line pt-2">
                <p className="mb-1 text-xs font-semibold tracking-wide text-muted">연결된 노트</p>
                <ul className="max-h-40 space-y-0.5 overflow-y-auto text-sm">
                  {connectionsOf.get(selected.id)!.map(({ node: c, kind }) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => select(c)}
                        className="flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-fg hover:bg-accent-soft hover:text-accent pointer-coarse:min-h-11"
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
              {selected.href && (
                <Link href={selected.href} className="flex min-h-11 items-center gap-1 rounded-lg bg-accent px-4 text-sm font-medium text-accent-ink transition hover:ring-2 hover:ring-accent hover:ring-offset-2 hover:ring-offset-bg-elev">
                  {selected.kind === "doc" ? "노트 열기" : "사전에서 보기"} <span aria-hidden>→</span>
                </Link>
              )}
              <button type="button" onClick={reset} className="min-h-11 rounded-lg border border-line px-4 text-sm text-muted hover:text-fg-strong">
                전체 보기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Zoom bar */}
      <div role="group" aria-label="확대·축소" className="absolute right-4 bottom-20 flex flex-col items-center gap-1 rounded-full border border-line bg-bg-elev/95 p-1.5 shadow-lg sm:top-1/2 sm:bottom-auto sm:-translate-y-1/2">
        <button
          type="button"
          onClick={() => zoomTo(zoom + 0.08)}
          aria-label="확대"
          className="grid size-8 place-items-center rounded-full text-lg pointer-coarse:size-11 leading-none text-fg-strong hover:bg-accent-soft hover:text-accent"
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
          type="button"
          onClick={() => zoomTo(zoom - 0.08)}
          aria-label="축소"
          className="grid size-8 place-items-center rounded-full text-lg pointer-coarse:size-11 leading-none text-fg-strong hover:bg-accent-soft hover:text-accent"
        >
          −
        </button>
      </div>

      {!selected && (
        <p className="pointer-events-none absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-bg-elev/90 px-3 py-1 text-xs whitespace-nowrap text-muted">
          <span className="hidden sm:inline">드래그해서 회전 · 오른쪽 드래그로 이동 · 스크롤이나 오른쪽 바로 확대 · 노드를 클릭해 초점 ·</span>
          <span className="inline-block h-px w-4 opacity-70" style={{ background: REFERENCE_COLOR[theme] }} />
          노트 간 링크
          <span className="inline-block h-px w-4 bg-muted" />
          같은 태그
        </p>
      )}
    </div>
  );
}
