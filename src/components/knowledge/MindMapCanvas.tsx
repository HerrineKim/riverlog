"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useSearchOnEnter from "@/hooks/useSearchOnEnter";
import useTheme from "@/hooks/useTheme";
import useUrlState from "@/hooks/useUrlState";
import type { PlacedNode } from "@/lib/graph-layout";
import type { GraphLink } from "@/lib/knowledge-graph";
import { makeMatcher } from "@/lib/search";
import { MindMapScene } from "./mindmap-scene";
import { CategoryLegend, MapHint, SearchPanel, SelectedNodeCard, ZoomBar, type Category } from "./MindMapPanels";
import useGraphIndex from "./useGraphIndex";

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
  const { byId, neighbors, connectionsOf, childrenOf } = useGraphIndex(data);
  // The focused node and the search live in the URL, so a view of the map can be shared
  const [selectedId, setSelectedId] = useUrlState("node", "");
  const selected = byId.get(selectedId) ?? null;
  const setSelected = useCallback((node: PlacedNode | null) => setSelectedId(node?.id ?? ""), [setSelectedId]);
  // A new search drops the selection so its hits show
  const { query, draft, inputProps, clear } = useSearchOnEnter("q", () => setSelected(null));

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
        <SearchPanel
          inputProps={inputProps}
          draft={draft}
          query={query}
          results={results}
          showResults={!selected}
          onClear={clear}
          onSelect={select}
        />
        <CategoryLegend
          categories={categories}
          dark={dark}
          onPick={(id) => {
            const n = byId.get(id);
            if (n) select(n);
          }}
        />
      </div>

      <p className="sr-only" aria-live="polite">
        {selected ? `${selected.name} 선택됨. ${selected.kind === "doc" ? "노트" : "분야"}, ${selected.path}` : ""}
      </p>

      {selected && (
        <SelectedNodeCard
          selected={selected}
          members={childrenOf.get(selected.id) ?? []}
          connections={connectionsOf.get(selected.id) ?? []}
          theme={theme}
          onSelect={select}
          onReset={reset}
        />
      )}

      <ZoomBar zoom={zoom} onZoom={zoomTo} />

      {!selected && <MapHint theme={theme} />}
    </div>
  );
}
