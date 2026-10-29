"use client";

import Link from "next/link";
import { useDeferredValue, useState } from "react";
import useUrlState from "@/hooks/useUrlState";

export type TagCount = { tag: string; count: number; href: string };

/** All tags, biggest first, with an instant filter. Size steps with how many notes carry the tag. */
export default function TagCloud({ tags }: { tags: TagCount[] }) {
  // The box filters as you type; the URL follows, so a filtered cloud can be shared
  const [urlQuery, setUrlQuery] = useUrlState("q", "");
  const [query, setQueryState] = useState(urlQuery);
  const [shownUrl, setShownUrl] = useState(urlQuery);
  if (urlQuery !== shownUrl) {
    setShownUrl(urlQuery);
    setQueryState(urlQuery);
  }
  const setQuery = (v: string) => {
    setQueryState(v);
    setUrlQuery(v);
  };
  const q = useDeferredValue(query.trim().toLowerCase().replace(/^#/, ""));
  const shown = q ? tags.filter((t) => t.tag.includes(q)) : tags;
  const max = Math.max(1, ...tags.map((t) => t.count));
  const step = (n: number) => (n === 1 ? 0 : Math.ceil((Math.log(n) / Math.log(max)) * 3));
  const SIZE = ["text-xs", "text-sm", "text-base", "text-lg font-medium"];

  return (
    <div>
      <div className="sticky top-14 z-20 -mx-4 flex flex-wrap items-center gap-3 border-b border-line/70 bg-bg px-4 py-3 sm:-mx-6 sm:px-6">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">태그 검색</span>
          <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-sm text-muted" aria-hidden>
            #
          </span>
          <input
            type="search"
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && setQuery("")}
            placeholder="태그 이름으로 찾기…"
            className="w-full min-h-11 rounded-lg border border-control bg-bg-elev py-2 pr-4 pl-8 text-sm text-fg-strong placeholder:text-muted focus:border-accent"
          />
        </label>
        <span className="text-xs text-muted tabular-nums" aria-live="polite">
          {shown.length}개 태그
        </span>
      </div>

      {shown.length === 0 ? (
        <p className="py-16 text-center text-muted">“{query}”에 해당하는 태그가 없어요.</p>
      ) : (
        <ul className="mt-8 flex flex-wrap items-baseline gap-2">
          {shown.map((t) => (
            <li key={t.tag}>
              <Link
                href={t.href}
                className={`inline-flex items-baseline gap-1.5 rounded-full border border-line px-3 py-1 text-fg pointer-coarse:min-h-11 pointer-coarse:items-center transition hover:border-accent hover:text-accent ${SIZE[step(t.count)]}`}
              >
                <span className="text-muted">#</span>
                {t.tag}
                <span className="text-xs font-normal text-muted tabular-nums">{t.count}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
