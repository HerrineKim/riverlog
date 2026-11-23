"use client";

import Link from "next/link";
import { useDeferredValue, useRef, useState } from "react";
import useUrlState from "@/hooks/useUrlState";
import type { TagPanel, TagSummary } from "@/lib/knowledge-tags";

type Groups = { top: TagSummary[]; mid: TagSummary[]; tail: TagSummary[] };

/**
 * The tag index: the most used tags as bars, the rest as chips, the rare tail folded away.
 * Picking a tag previews its company and newest notes beside the list (below it on small screens).
 */
export default function TagExplorer({ groups, panels }: { groups: Groups; panels: Record<string, TagPanel> }) {
  const all = [...groups.top, ...groups.mid, ...groups.tail];
  const [selected, setSelected] = useUrlState("tag", groups.top[0]?.tag ?? "");
  const panel = panels[selected] ?? panels[groups.top[0]?.tag];
  const [query, setQuery] = useUrlState("q", "");
  const q = useDeferredValue(query.trim().toLowerCase().replace(/^#/, ""));
  const [tailOpen, setTailOpen] = useState(false);
  const panelRef = useRef<HTMLElement>(null);
  const max = Math.max(1, ...groups.top.map((t) => t.count));

  const pick = (tag: string) => {
    setSelected(tag);
    // The preview sits below the list on small screens; bring it into view there
    if (!window.matchMedia("(min-width: 64rem)").matches) {
      const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      panelRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
    }
  };

  const shown = q ? all.filter((t) => t.tag.includes(q)) : [];

  return (
    <div>
      <div className="sticky top-14 z-20 -mx-4 flex flex-wrap items-end gap-3 border-b border-line/70 bg-bg px-4 py-3 sm:-mx-6 sm:px-6">
        <label className="min-w-0 flex-1">
          <span className="text-sm font-semibold text-muted">태그 검색</span>
          <span className="relative mt-1.5 block">
            <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-sm text-muted" aria-hidden>
              #
            </span>
            <input
              type="search"
              autoComplete="off"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && setQuery("")}
              placeholder="예: react, agent"
              className="min-h-11 w-full rounded-lg border border-control bg-bg-elev py-2 pr-4 pl-8 text-sm text-fg-strong placeholder:text-muted focus:border-accent"
            />
          </span>
        </label>
        <span className="pb-3 text-xs text-muted tabular-nums" aria-live="polite">
          {q ? `${shown.length}개 찾음` : `${all.length}개 태그`}
        </span>
      </div>

      {q ? (
        shown.length === 0 ? (
          <p className="py-16 text-center text-muted">“{query}”에 해당하는 태그가 없어요.</p>
        ) : (
          <ul className="mt-8 flex flex-wrap gap-2">
            {shown.map((t) => (
              <li key={t.tag}>
                <TagChip t={t} />
              </li>
            ))}
          </ul>
        )
      ) : (
        <div className="mt-8 grid gap-x-10 gap-y-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <section aria-labelledby="top-tags-h" className="min-w-0">
            <h2 id="top-tags-h" className="text-sm font-semibold text-muted">
              많이 쓰는 태그 {groups.top.length}
            </h2>
            <div role="group" aria-label="미리 볼 태그 고르기" className="mt-3 grid gap-x-6 sm:grid-cols-2">
              {groups.top.map((t) => {
                const on = t.tag === panel?.tag;
                return (
                  <button
                    key={t.tag}
                    type="button"
                    aria-pressed={on}
                    onClick={() => pick(t.tag)}
                    className={`grid min-h-11 grid-cols-[minmax(0,8.5rem)_minmax(0,1fr)_2.5rem] items-center gap-3 rounded-lg px-2.5 text-left text-sm transition ${
                      on ? "bg-accent-soft font-semibold text-fg-strong" : "text-fg hover:bg-bg-elev"
                    }`}
                  >
                    <span className="truncate">#{t.tag}</span>
                    <span aria-hidden className="h-1.5 overflow-hidden rounded-full bg-line">
                      <span className="block h-full rounded-full bg-accent" style={{ width: `${Math.round((t.count / max) * 100)}%` }} />
                    </span>
                    <span className="text-right text-muted tabular-nums">{t.count}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {panel && (
            <aside
              ref={panelRef}
              aria-labelledby="tag-panel-h"
              className="scroll-mt-32 lg:col-start-2 lg:row-span-2 lg:row-start-1"
            >
              <div className="rounded-2xl border border-line bg-bg-elev p-6 lg:sticky lg:top-36">
                <div className="flex items-baseline justify-between gap-3">
                  <h2 id="tag-panel-h" className="min-w-0 truncate text-2xl font-bold text-fg-strong">
                    #{panel.tag}
                  </h2>
                  <span className="font-display text-3xl leading-none text-fg-strong tabular-nums">{panel.count}</span>
                </div>
                {panel.related.length > 0 && (
                  <>
                    <h3 className="mt-5 text-sm font-semibold text-muted">함께 자주 붙는 태그</h3>
                    <ul className="mt-2 flex flex-wrap gap-1.5">
                      {panel.related.map((r) => (
                        <li key={r.tag}>
                          <TagChip t={r} />
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                <h3 className="mt-5 border-t border-line pt-5 text-sm font-semibold text-muted">최근 노트</h3>
                <ul className="mt-1">
                  {panel.recent.map((n) => (
                    <li key={n.href}>
                      <Link href={n.href} className="block rounded-lg px-2 py-2.5 leading-snug font-medium text-fg hover:bg-bg hover:text-accent">
                        {n.title}
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href={panel.href}
                  className="mt-4 flex min-h-11 items-center justify-center rounded-lg bg-accent px-4 text-sm font-semibold text-accent-ink transition hover:opacity-90"
                >
                  #{panel.tag} 노트 {panel.count}개 모두 보기
                </Link>
              </div>
            </aside>
          )}

          <div className="min-w-0 space-y-10">
            {groups.mid.length > 0 && (
              <section aria-labelledby="mid-tags-h">
                <h2 id="mid-tags-h" className="text-sm font-semibold text-muted">
                  세 번 이상 쓴 태그 {groups.mid.length}
                </h2>
                <div role="group" aria-label="미리 볼 태그 고르기" className="mt-3 flex flex-wrap gap-2">
                  {groups.mid.map((t) => {
                    const on = t.tag === panel?.tag;
                    return (
                      <button
                        key={t.tag}
                        type="button"
                        aria-pressed={on}
                        onClick={() => pick(t.tag)}
                        className={`inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3 text-sm transition ${
                          on ? "border-accent bg-accent-soft font-semibold text-fg-strong" : "border-line text-fg hover:border-accent"
                        }`}
                      >
                        #{t.tag}
                        <span className="text-xs font-normal text-muted tabular-nums">{t.count}</span>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {groups.tail.length > 0 && (
              <section aria-label="한두 번만 쓴 태그">
                <button
                  type="button"
                  aria-expanded={tailOpen}
                  aria-controls="tag-tail"
                  onClick={() => setTailOpen((v) => !v)}
                  className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-control bg-bg-elev px-4 text-sm text-fg transition hover:border-accent"
                >
                  {tailOpen ? "한두 번만 쓴 태그 접기" : `한두 번만 쓴 태그 ${groups.tail.length}개 펼치기`}
                  <svg viewBox="0 0 24 24" className={`size-4 transition ${tailOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
                <ul id="tag-tail" hidden={!tailOpen} className="mt-4 flex flex-wrap gap-1.5">
                  {groups.tail.map((t) => (
                    <li key={t.tag}>
                      <TagChip t={t} small />
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function TagChip({ t, small = false }: { t: { tag: string; count: number; href: string }; small?: boolean }) {
  return (
    <Link
      href={t.href}
      className={`inline-flex items-center gap-1.5 rounded-full border border-line px-3 text-fg transition hover:border-accent hover:text-accent ${
        small ? "min-h-9 text-xs pointer-coarse:min-h-11" : "min-h-10 text-sm"
      }`}
    >
      #{t.tag}
      <span className="text-xs text-muted tabular-nums">{t.count}</span>
    </Link>
  );
}
