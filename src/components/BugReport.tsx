"use client";

import { useRef, useState } from "react";
import { site } from "@/lib/site";

/**
 * Header button that opens a short bug report form. The site is static, so a report leaves as a
 * prefilled GitHub issue (or an email for readers without a GitHub account) with the page and browser attached.
 */
export default function BugReport() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [page, setPage] = useState("");

  const open = () => {
    setPage(window.location.href);
    dialogRef.current?.showModal();
  };
  const close = () => dialogRef.current?.close();

  const subject = `[버그] ${title.trim()}`;
  const body = () =>
    [
      "## 무슨 일이 있었나요",
      details.trim() || "(설명 없음)",
      "",
      "## 환경",
      `- 페이지: ${page}`,
      `- 브라우저: ${navigator.userAgent}`,
      `- 화면: ${window.innerWidth}×${window.innerHeight}`,
      `- 테마: ${document.documentElement.getAttribute("data-theme")}`,
    ].join("\n");

  const send = (via: "github" | "email") => {
    if (via === "github")
      window.open(`${site.repo}/issues/new?${new URLSearchParams({ title: subject, body: body(), labels: "bug" })}`, "_blank", "noopener");
    else window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body())}`;
    setTitle("");
    setDetails("");
    close();
  };

  return (
    <>
      <button
        type="button"
        onClick={open}
        title="버그 제보"
        className="grid size-9 place-items-center rounded-full border border-line text-muted transition hover:border-accent hover:text-accent"
      >
        <span className="sr-only">버그 제보</span>
        <svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <rect x="7" y="7" width="10" height="13" rx="5" />
          <path d="M9 7.5a3 3 0 0 1 6 0M12 11v9M7 12H3M21 12h-4M7.5 16.5 4 19M16.5 16.5 20 19M7.5 8.5 4.5 6M16.5 8.5l3-2.5" />
        </svg>
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="bug-report-title"
        onClick={(e) => e.target === e.currentTarget && close()}
        className="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-2xl border border-line bg-bg-elev p-0 text-fg shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-sm"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send("github");
          }}
          className="flex flex-col gap-4 p-5"
        >
          <div>
            <h2 id="bug-report-title" className="text-lg font-semibold text-fg-strong">
              버그 제보
            </h2>
            <p className="mt-1 text-sm text-muted">이상한 점을 알려 주시면 고칠게요. 지금 보고 있는 페이지와 브라우저 정보가 함께 담겨요.</p>
          </div>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-fg-strong">한 줄 요약</span>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 마인드맵에서 검색 결과가 안 보여요"
              className="rounded-lg border border-line bg-bg px-3 py-2 text-fg-strong outline-none placeholder:text-muted focus:border-accent"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-fg-strong">무슨 일이 있었나요</span>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={5}
              placeholder="어떻게 했더니 어떤 일이 생겼는지, 원래 기대한 동작은 무엇인지"
              className="resize-y rounded-lg border border-line bg-bg px-3 py-2 text-fg-strong outline-none placeholder:text-muted focus:border-accent"
            />
          </label>
          <p className="truncate text-xs text-muted" title={page}>
            페이지: {page}
          </p>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button type="button" onClick={close} className="rounded-full px-3.5 py-1.5 text-sm text-muted hover:text-fg-strong">
              취소
            </button>
            <button
              type="button"
              disabled={!title.trim()}
              onClick={() => send("email")}
              className="rounded-full border border-line px-3.5 py-1.5 text-sm text-fg hover:border-accent hover:text-accent disabled:opacity-40"
            >
              메일로 보내기
            </button>
            <button type="submit" className="rounded-full bg-accent px-3.5 py-1.5 text-sm font-medium text-accent-ink hover:opacity-90">
              GitHub 이슈로 보내기 <span aria-hidden>↗</span>
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
