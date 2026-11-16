"use client";

import Link from "next/link";
import type { InputHTMLAttributes, ReactNode } from "react";
import type { PlacedNode } from "@/lib/graph-layout";
import { REFERENCE_COLOR, toneFor } from "./mindmap-scene";
import type { Connection } from "./useGraphIndex";

type Theme = keyof typeof REFERENCE_COLOR;
export type Category = { id: string; name: string; color: string; count: number };

export function SearchPanel({
  inputProps,
  draft,
  query,
  results,
  showResults,
  onClear,
  onSelect,
}: {
  inputProps: InputHTMLAttributes<HTMLInputElement>;
  draft: string;
  query: string;
  results: PlacedNode[] | null;
  showResults: boolean;
  onClear: () => void;
  onSelect: (node: PlacedNode) => void;
}) {
  return (
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
        {results && showResults && (
          <div className="mt-2 overflow-hidden rounded-xl border border-line bg-bg-elev text-sm shadow-xl">
            <p className="flex items-center justify-between gap-2 border-b border-line px-3 py-2 text-xs text-muted">
              <span>
                “{query}” {results.length ? `${results.length}개 일치` : "에 해당하는 노드가 없어요"}
              </span>
              <button type="button" onClick={onClear} className="-my-1 rounded-md px-2 py-1 hover:text-fg-strong pointer-coarse:min-h-11">
                지우기
              </button>
            </p>
            {results.length > 0 && (
              <ul className="max-h-64 overflow-y-auto">
                {results.map((r) => (
                  <li key={r.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(r)}
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
  );
}

export function CategoryLegend({ categories, dark, onPick }: { categories: Category[]; dark: boolean; onPick: (id: string) => void }) {
  return (
    <ul className="pointer-events-auto flex flex-wrap gap-1.5 sm:max-w-md sm:justify-end">
      {categories.map((c) => (
        <li key={c.id}>
          <button
            type="button"
            onClick={() => onPick(c.id)}
            className="flex items-center gap-1.5 rounded-full border border-line bg-bg-elev/95 px-2.5 py-1 text-xs text-fg transition hover:border-accent pointer-coarse:min-h-11"
          >
            <span className="size-2 rounded-full" style={{ background: toneFor(c.color, dark), boxShadow: `0 0 8px ${toneFor(c.color, dark)}${dark ? "" : "66"}` }} />
            {c.name}
            <span className="text-muted tabular-nums">{c.count}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

/** A row in the selected node card: a dot, the node name and a trailing marker. */
function NodeButton({ node, onSelect, children }: { node: PlacedNode; onSelect: (node: PlacedNode) => void; children?: ReactNode }) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(node)}
        className="flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-fg hover:bg-accent-soft hover:text-accent pointer-coarse:min-h-11"
      >
        <span className="size-1.5 shrink-0 rounded-full" style={{ background: node.color }} />
        <span className="truncate">{node.name}</span>
        {children}
      </button>
    </li>
  );
}

export function SelectedNodeCard({
  selected,
  members,
  connections,
  theme,
  onSelect,
  onReset,
}: {
  selected: PlacedNode;
  members: PlacedNode[];
  connections: Connection[];
  theme: Theme;
  onSelect: (node: PlacedNode) => void;
  onReset: () => void;
}) {
  return (
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
        {members.length > 0 && (
          <ul className="mt-3 max-h-48 space-y-0.5 overflow-y-auto border-t border-line pt-2 text-sm">
            {members.map((c) => (
              <NodeButton key={c.id} node={c} onSelect={onSelect}>
                {c.kind !== "doc" && (
                  <span aria-hidden className="ml-auto text-xs text-muted">
                    ›
                  </span>
                )}
              </NodeButton>
            ))}
          </ul>
        )}
        {selected.kind === "doc" && connections.length > 0 && (
          <div className="mt-3 border-t border-line pt-2">
            <p className="mb-1 text-xs font-semibold tracking-wide text-muted">연결된 노트</p>
            <ul className="max-h-40 space-y-0.5 overflow-y-auto text-sm">
              {connections.map(({ node: c, kind }) => (
                <NodeButton key={c.id} node={c} onSelect={onSelect}>
                  <span className="ml-auto shrink-0 text-[0.7rem]" style={{ color: kind === "reference" ? REFERENCE_COLOR[theme] : undefined }}>
                    {kind === "reference" ? "링크" : "같은 태그"}
                  </span>
                </NodeButton>
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
          <button type="button" onClick={onReset} className="min-h-11 rounded-lg border border-line px-4 text-sm text-muted hover:text-fg-strong">
            전체 보기
          </button>
        </div>
      </div>
    </div>
  );
}

const ZOOM_STEP = 0.08;
const ZOOM_BUTTON = "grid size-8 place-items-center rounded-full text-lg pointer-coarse:size-11 leading-none text-fg-strong hover:bg-accent-soft hover:text-accent";

export function ZoomBar({ zoom, onZoom }: { zoom: number; onZoom: (z: number) => void }) {
  return (
    <div role="group" aria-label="확대·축소" className="absolute right-4 bottom-20 flex flex-col items-center gap-1 rounded-full border border-line bg-bg-elev/95 p-1.5 shadow-lg sm:top-1/2 sm:bottom-auto sm:-translate-y-1/2">
      <button type="button" onClick={() => onZoom(zoom + ZOOM_STEP)} aria-label="확대" className={ZOOM_BUTTON}>
        +
      </button>
      <input
        type="range"
        min={0}
        max={1}
        step={0.005}
        value={zoom}
        onChange={(e) => onZoom(Number(e.target.value))}
        aria-label="확대·축소"
        aria-orientation="vertical"
        className="h-32 w-6 cursor-grab accent-[var(--accent)] active:cursor-grabbing sm:h-40"
        style={{ writingMode: "vertical-lr", direction: "rtl" }}
      />
      <button type="button" onClick={() => onZoom(zoom - ZOOM_STEP)} aria-label="축소" className={ZOOM_BUTTON}>
        −
      </button>
    </div>
  );
}

export function MapHint({ theme }: { theme: Theme }) {
  return (
    <p className="pointer-events-none absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-bg-elev/90 px-3 py-1 text-xs whitespace-nowrap text-muted">
      <span className="hidden sm:inline">드래그해서 회전 · 오른쪽 드래그로 이동 · 스크롤이나 오른쪽 바로 확대 · 노드를 클릭해 초점 ·</span>
      <span className="inline-block h-px w-4 opacity-70" style={{ background: REFERENCE_COLOR[theme] }} />
      노트 간 링크
      <span className="inline-block h-px w-4 bg-muted" />
      같은 태그
    </p>
  );
}
