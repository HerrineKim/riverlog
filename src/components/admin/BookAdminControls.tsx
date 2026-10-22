"use client";

import Link from "next/link";
import { useState } from "react";
import useIsAdmin from "@/hooks/useIsAdmin";
import { adminFetch, DEPLOY_NOTE } from "@/lib/admin/client";

type Status = "reading" | "read" | "want";
const OPTIONS: { key: Status; label: string }[] = [
  { key: "reading", label: "읽는 중" },
  { key: "read", label: "다 읽음" },
  { key: "want", label: "안 읽음" },
];

/** The owner's tools on a book page: reading status, and writing, editing or deleting the review. Hidden for everyone else. */
export default function BookAdminControls({ slug, status: initial, hasReview }: { slug: string; status: Status; hasReview: boolean }) {
  const admin = useIsAdmin();
  const [status, setStatus] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  if (!admin) return null;

  const run = async (body: Record<string, unknown>, after?: () => void) => {
    setBusy(true);
    setMessage("");
    try {
      await adminFetch(`/api/admin/books/${slug}`, { method: "PATCH", body });
      after?.();
      setMessage(DEPLOY_NOTE);
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-6 rounded-2xl border border-accent/40 bg-accent-soft/40 p-4 text-sm">
      <p className="text-xs font-semibold tracking-[0.18em] text-accent uppercase">관리</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <div role="group" aria-label="읽기 상태" className="flex rounded-full border border-line bg-bg-elev p-0.5">
          {OPTIONS.map((o) => (
            <button
              key={o.key}
              type="button"
              disabled={busy}
              aria-pressed={status === o.key}
              onClick={() => status !== o.key && run({ status: o.key }, () => setStatus(o.key))}
              className={`rounded-full px-3 py-1 transition disabled:opacity-60 ${status === o.key ? "bg-accent font-medium text-accent-ink" : "text-muted hover:text-fg-strong"}`}
            >
              {o.label}
            </button>
          ))}
        </div>
        <Link href={`/admin/books/${slug}`} className="rounded-full border border-line bg-bg-elev px-3.5 py-1.5 text-fg transition hover:border-accent hover:text-accent">
          <span aria-hidden>✎</span> {hasReview ? "독후감 수정" : "독후감 쓰기"}
        </Link>
        {hasReview && (
          <button
            type="button"
            disabled={busy}
            onClick={() => confirm("이 책의 독후감을 삭제할까요?") && run({ review: "" })}
            className="rounded-full border border-line bg-bg-elev px-3.5 py-1.5 text-muted transition hover:border-red-500 hover:text-red-500 disabled:opacity-60"
          >
            독후감 삭제
          </button>
        )}
      </div>
      {message && (
        <p role="status" className="mt-3 text-muted">
          {message}
        </p>
      )}
    </div>
  );
}
