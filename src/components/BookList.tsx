"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import BookCover from "@/components/BookCover";
import useSearchOnEnter from "@/hooks/useSearchOnEnter";

export type BookRow = {
  slug: string;
  title: string;
  author: string;
  category: string;
  status: "read" | "reading" | "want";
  rating?: number;
  finished?: string;
  cover?: string;
  hasReview: boolean;
};

const STATUS: { key: "all" | BookRow["status"]; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "reading", label: "읽는 중" },
  { key: "read", label: "다 읽음" },
  { key: "want", label: "안 읽음" },
];
const STATUS_STYLE: Record<BookRow["status"], string> = {
  reading: "bg-accent-soft text-accent",
  read: "border border-line text-fg",
  want: "text-muted",
};
const STATUS_LABEL: Record<BookRow["status"], string> = { reading: "읽는 중", read: "다 읽음", want: "안 읽음" };
// The shelf has ~1,900 books; rendering them all at once makes a 1MB page
const PAGE = 60;
type View = "gallery" | "list";
const VIEW_KEY = "riverlog:books-view";
// The chosen view is a per-browser convenience; storage may be unavailable
function storedView(): View {
  try {
    return localStorage.getItem(VIEW_KEY) === "list" ? "list" : "gallery";
  } catch {
    return "gallery";
  }
}
const noSubscribe = () => () => {};

export default function BookList({ books }: { books: BookRow[] }) {
  const [status, setStatus] = useState<(typeof STATUS)[number]["key"]>("all");
  const [category, setCategory] = useState("all");
  const [onlyReviewed, setOnlyReviewed] = useState(false);
  const [limit, setLimit] = useState(PAGE);
  const stored = useSyncExternalStore(noSubscribe, storedView, () => "gallery" as View);
  const [chosen, setChosen] = useState<View>();
  const view = chosen ?? stored;
  const changeView = (v: View) => {
    setChosen(v);
    try {
      localStorage.setItem(VIEW_KEY, v);
    } catch {}
  };
  const { query, draft, inputProps } = useSearchOnEnter(() => setLimit(PAGE));
  const q = query.toLowerCase();
  // Any filter change starts the list over from the top
  const filter = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setLimit(PAGE);
  };

  const categories = useMemo(() => [...new Set(books.map((b) => b.category))].sort((a, b) => a.localeCompare(b, "ko")), [books]);
  const count = (k: string) => (k === "all" ? books.length : books.filter((b) => b.status === k).length);
  const shown = books.filter(
    (b) =>
      (status === "all" || b.status === status) &&
      (category === "all" || b.category === category) &&
      (!onlyReviewed || b.hasReview) &&
      (!q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)),
  );

  return (
    <div>
      <label className="relative mb-4 block">
        <span className="sr-only">책 검색</span>
        <svg viewBox="0 0 24 24" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          enterKeyHint="search"
          {...inputProps}
          placeholder="제목이나 저자로 찾기 (Enter)"
          className="w-full min-h-11 rounded-lg border border-control bg-bg-elev py-2 pr-4 pl-9 text-sm text-fg-strong placeholder:text-muted focus:border-accent"
        />
      </label>
      <div className="flex flex-wrap items-center gap-2">
        {STATUS.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => filter(setStatus)(s.key)}
            aria-pressed={status === s.key}
            className={`min-h-11 rounded-full px-3.5 text-sm transition ${
              status === s.key ? "bg-accent font-medium text-accent-ink" : "border border-line text-muted hover:text-fg-strong"
            }`}
          >
            {s.label} <span className="tabular-nums">{count(s.key)}</span>
          </button>
        ))}
        <label className="ml-auto flex min-h-11 cursor-pointer items-center gap-2 text-sm text-muted">
          <input type="checkbox" checked={onlyReviewed} onChange={(e) => filter(setOnlyReviewed)(e.target.checked)} className="accent-[var(--accent)]" />
          독후감 있는 책만
        </label>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {["all", ...categories].map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => filter(setCategory)(c)}
            aria-pressed={category === c}
            className={`rounded-md px-2.5 py-1 text-xs transition pointer-coarse:min-h-11 ${
              category === c ? "bg-bg-elev text-fg-strong ring-1 ring-line" : "text-muted hover:text-fg"
            }`}
          >
            {c === "all" ? "모든 분류" : c}
          </button>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <p className="text-xs text-muted tabular-nums" aria-live="polite">
          {shown.length}권
          {draft.trim() && draft.trim() !== query && <span className="ml-1.5 text-accent">· Enter로 검색</span>}
        </p>
        <div role="group" aria-label="보기 방식" className="flex rounded-full border border-line p-0.5 text-xs">
          {(
            [
              ["gallery", "갤러리"],
              ["list", "목록"],
            ] as const
          ).map(([v, label]) => (
            <button
              key={v}
              type="button"
              onClick={() => changeView(v)}
              aria-pressed={view === v}
              className={`min-h-11 rounded-full px-3.5 transition ${view === v ? "bg-accent font-medium text-accent-ink" : "text-muted hover:text-fg-strong"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      {view === "gallery" ? (
        <ul className="mt-4 grid grid-cols-3 gap-x-4 gap-y-7 sm:grid-cols-4 md:grid-cols-5">
          {shown.slice(0, limit).map((b) => (
            <li key={b.slug}>
              <Link href={`/books/${b.slug}`} className="group block">
                <BookCover title={b.title} author={b.author} cover={b.cover} className="w-full transition group-hover:-translate-y-0.5 group-hover:shadow-md" />
                <p className="mt-2 line-clamp-2 text-sm leading-snug font-medium text-fg-strong group-hover:text-accent">{b.title}</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
                  <span className={`rounded-full px-1.5 py-px whitespace-nowrap ${STATUS_STYLE[b.status]}`}>{STATUS_LABEL[b.status]}</span>
                  {b.hasReview && (
                    <span className="text-accent" title="독후감 있음">
                      <span aria-hidden>✎</span>
                      <span className="sr-only">독후감 있음</span>
                    </span>
                  )}
                </p>
              </Link>
            </li>
          ))}
          {shown.length === 0 && <li className="col-span-full py-12 text-center text-muted">조건에 맞는 책이 없어요.</li>}
        </ul>
      ) : (
        <ul className="mt-2 divide-y divide-line border-y border-line">
          {shown.slice(0, limit).map((b) => (
            <li key={b.slug}>
              <Link href={`/books/${b.slug}`} className="group grid grid-cols-[2.5rem_1fr_auto] items-center gap-x-4 gap-y-1 py-3 sm:grid-cols-[2.5rem_minmax(0,1fr)_9rem_6rem_5.5rem]">
                <BookCover title={b.title} cover={b.cover} className="w-10 [&_p]:hidden" />
                <div className="min-w-0">
                  <p className="truncate font-medium text-fg-strong group-hover:text-accent">
                    {b.title}
                    {b.hasReview && (
                      <span className="ml-2 align-middle text-[0.7rem] font-normal text-accent" title="독후감 있음">
                        <span aria-hidden>✎</span> 독후감
                      </span>
                    )}
                  </p>
                  <p className="truncate text-sm text-muted">{b.author || "저자 정보 없음"}</p>
                </div>
                <span className="hidden truncate text-sm text-muted sm:block">{b.category}</span>
                <span role="img" className="hidden text-sm tracking-tight text-accent sm:block" aria-label={b.rating ? `별점 5점 중 ${b.rating}점` : "별점 없음"}>
                  {b.rating ? "★".repeat(b.rating) + "☆".repeat(5 - b.rating) : <span className="text-muted">-</span>}
                </span>
                <span className={`justify-self-end rounded-full px-2.5 py-0.5 text-xs whitespace-nowrap ${STATUS_STYLE[b.status]}`}>
                  {STATUS_LABEL[b.status]}
                </span>
              </Link>
            </li>
          ))}
          {shown.length === 0 && <li className="py-12 text-center text-muted">조건에 맞는 책이 없어요.</li>}
        </ul>
      )}
      {shown.length > limit && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setLimit((l) => l + PAGE * 2)}
            className="min-h-11 rounded-lg border border-line px-5 text-sm text-fg transition hover:border-accent hover:text-accent"
          >
            더 보기 <span className="text-muted tabular-nums">({shown.length - limit}권 남음)</span>
          </button>
        </div>
      )}
    </div>
  );
}
