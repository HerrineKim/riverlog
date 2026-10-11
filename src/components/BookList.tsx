"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type BookRow = {
  slug: string;
  title: string;
  author: string;
  category: string;
  status: "read" | "reading" | "want";
  rating?: number;
  finished?: string;
  hasReview: boolean;
};

const STATUS: { key: "all" | BookRow["status"]; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "reading", label: "읽는 중" },
  { key: "read", label: "다 읽음" },
  { key: "want", label: "읽고 싶음" },
];
const STATUS_STYLE: Record<BookRow["status"], string> = {
  reading: "bg-accent-soft text-accent",
  read: "border border-line text-fg",
  want: "text-muted",
};
const STATUS_LABEL: Record<BookRow["status"], string> = { reading: "읽는 중", read: "다 읽음", want: "읽고 싶음" };

export default function BookList({ books }: { books: BookRow[] }) {
  const [status, setStatus] = useState<(typeof STATUS)[number]["key"]>("all");
  const [category, setCategory] = useState("all");
  const [onlyReviewed, setOnlyReviewed] = useState(false);

  const categories = useMemo(() => [...new Set(books.map((b) => b.category))].sort((a, b) => a.localeCompare(b, "ko")), [books]);
  const count = (k: string) => (k === "all" ? books.length : books.filter((b) => b.status === k).length);
  const shown = books.filter(
    (b) =>
      (status === "all" || b.status === status) &&
      (category === "all" || b.category === category) &&
      (!onlyReviewed || b.hasReview),
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {STATUS.map((s) => (
          <button
            key={s.key}
            onClick={() => setStatus(s.key)}
            aria-pressed={status === s.key}
            className={`rounded-full px-3.5 py-1.5 text-sm transition ${
              status === s.key ? "bg-accent font-medium text-accent-ink" : "border border-line text-muted hover:text-fg-strong"
            }`}
          >
            {s.label} <span className="tabular-nums opacity-70">{count(s.key)}</span>
          </button>
        ))}
        <label className="ml-auto flex cursor-pointer items-center gap-2 text-sm text-muted">
          <input type="checkbox" checked={onlyReviewed} onChange={(e) => setOnlyReviewed(e.target.checked)} className="accent-[var(--accent)]" />
          독후감 있는 책만
        </label>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {["all", ...categories].map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            aria-pressed={category === c}
            className={`rounded-md px-2.5 py-1 text-xs transition ${
              category === c ? "bg-bg-elev text-fg-strong ring-1 ring-line" : "text-muted hover:text-fg"
            }`}
          >
            {c === "all" ? "모든 분류" : c}
          </button>
        ))}
      </div>

      <ul className="mt-8 divide-y divide-line border-y border-line">
        {shown.map((b) => (
          <li key={b.slug}>
            <Link href={`/books/${b.slug}`} className="group grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 py-4 sm:grid-cols-[minmax(0,1fr)_9rem_6rem_5.5rem]">
              <div className="min-w-0">
                <p className="truncate font-medium text-fg-strong group-hover:text-accent">
                  {b.title}
                  {b.hasReview && (
                    <span className="ml-2 align-middle text-[0.7rem] font-normal text-accent" title="독후감 있음">
                      ✎ 독후감
                    </span>
                  )}
                </p>
                <p className="truncate text-sm text-muted">{b.author || "저자 정보 없음"}</p>
              </div>
              <span className="hidden truncate text-sm text-muted sm:block">{b.category}</span>
              <span className="hidden text-sm tracking-tight text-accent sm:block" aria-label={b.rating ? `별점 ${b.rating}점` : "별점 없음"}>
                {b.rating ? "★".repeat(b.rating) + "☆".repeat(5 - b.rating) : <span className="text-muted">—</span>}
              </span>
              <span className={`justify-self-end rounded-full px-2.5 py-0.5 text-xs whitespace-nowrap ${STATUS_STYLE[b.status]}`}>
                {STATUS_LABEL[b.status]}
              </span>
            </Link>
          </li>
        ))}
        {shown.length === 0 && <li className="py-12 text-center text-muted">조건에 맞는 책이 없어요.</li>}
      </ul>
    </div>
  );
}
