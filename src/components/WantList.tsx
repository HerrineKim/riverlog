"use client";

import Link from "next/link";
import { useMemo } from "react";
import BookCover from "@/components/BookCover";
import useSearchOnEnter from "@/hooks/useSearchOnEnter";
import useUrlState from "@/hooks/useUrlState";
import { compareCategory } from "@/lib/book-categories";

export type WantRow = {
  slug: string;
  title: string;
  author: string;
  category: string;
  cover?: string;
  hasNote: boolean;
};

const collator = new Intl.Collator("ko", { numeric: true });

function groupBooks(books: WantRow[]) {
  const groups: { category: string; books: WantRow[] }[] = [];
  for (const book of books) {
    const last = groups[groups.length - 1];
    if (last?.category === book.category) last.books.push(book);
    else groups.push({ category: book.category, books: [book] });
  }
  return groups;
}

/**
 * Compact catalog of want-to-read books. The whole list is in the first HTML response so the
 * page can be indexed in place of the empty detail cards; category chips and search only hide rows.
 */
export default function WantList({ books }: { books: WantRow[] }) {
  const [category, setCategory] = useUrlState("category", "all");
  const { query, draft, inputProps } = useSearchOnEnter("q");
  const q = query.trim().toLowerCase();

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const book of books) map.set(book.category, (map.get(book.category) ?? 0) + 1);
    return [...map.entries()].sort((a, b) => compareCategory(a[0], b[0]));
  }, [books]);
  const activeCategory = category === "all" || counts.some(([name]) => name === category) ? category : "all";

  const groups = useMemo(() => {
    const sorted = [...books].sort((a, b) => compareCategory(a.category, b.category) || collator.compare(a.title, b.title));
    const matched = sorted.filter(
      (book) =>
        (activeCategory === "all" || book.category === activeCategory) &&
        (!q || book.title.toLowerCase().includes(q) || book.author.toLowerCase().includes(q)),
    );
    return groupBooks(matched);
  }, [books, activeCategory, q]);
  const shown = groups.reduce((n, group) => n + group.books.length, 0);

  return (
    <div>
      <div className="sticky top-14 z-20 -mx-4 border-b border-line/70 bg-bg px-4 py-3 sm:-mx-6 sm:px-6">
        <label className="relative block">
          <span className="sr-only">책 검색</span>
          <svg viewBox="0 0 24 24" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            enterKeyHint="search"
            {...inputProps}
            placeholder="제목이나 저자로 찾기…"
            className="w-full min-h-11 rounded-lg border border-control bg-bg-elev py-2 pr-4 pl-9 text-sm text-fg-strong placeholder:text-muted focus:border-accent"
          />
        </label>
        <div role="group" aria-label="분류" className="mt-3 flex gap-1.5 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
          {[["all", books.length] as const, ...counts].map(([name, count]) => (
            <button
              key={name}
              type="button"
              onClick={() => setCategory(name)}
              aria-pressed={activeCategory === name}
              className={`shrink-0 rounded-md px-2.5 py-1 text-xs transition pointer-coarse:min-h-11 ${
                activeCategory === name ? "bg-bg-elev text-fg-strong ring-1 ring-line" : "text-muted hover:text-fg"
              }`}
            >
              {name === "all" ? "모든 분류" : name} <span className="tabular-nums">{count.toLocaleString("ko-KR")}</span>
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted tabular-nums" aria-live="polite">
          {shown.toLocaleString("ko-KR")}권
          {draft.trim() && draft.trim() !== query && <span className="ml-1.5 text-accent">· Enter로 검색</span>}
        </p>
      </div>

      {shown === 0 ? (
        <p className="py-16 text-center text-muted">조건에 맞는 책이 없어요.</p>
      ) : (
        <div className="mt-8 space-y-10">
          {groups.map((group) => (
            <section key={group.category}>
              <h2 className="flex items-baseline gap-2 text-sm font-semibold text-muted">
                {group.category}
                <span className="font-normal tabular-nums">{group.books.length.toLocaleString("ko-KR")}</span>
              </h2>
              <ul className="mt-2 divide-y divide-line border-y border-line">
                {group.books.map((book) => (
                  <li key={book.slug} className="[contain-intrinsic-size:auto_3.25rem] [content-visibility:auto]">
                    <Link
                      href={`/books/${book.slug}`}
                      className="group grid min-h-11 grid-cols-[2rem_minmax(0,1fr)] items-center gap-3 py-2"
                    >
                      <BookCover title={book.title} cover={book.cover} className="w-8 [&_p]:hidden" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-fg-strong group-hover:text-accent" title={book.title}>
                          {book.title}
                          {book.hasNote && (
                            <span className="ml-1.5 align-middle text-[0.7rem] font-normal text-accent">
                              <span aria-hidden>✎</span> 메모
                            </span>
                          )}
                        </p>
                        <p className="truncate text-xs text-muted">{book.author || "저자 정보 없음"}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
