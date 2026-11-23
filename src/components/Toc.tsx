"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { TocItem } from "@/lib/markdown";

/** Id of the last heading scrolled past the top of the viewport. */
function useActiveHeading(items: TocItem[]) {
  const [active, setActive] = useState<string>();
  useEffect(() => {
    const headings = items.map((t) => document.getElementById(t.id)).filter((el): el is HTMLElement => !!el);
    if (!headings.length) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const passed = headings.filter((h) => h.getBoundingClientRect().top < 120);
        setActive(passed.at(-1)?.id);
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
    };
  }, [items]);
  return active;
}

function TocList({ items, active, onNavigate }: { items: TocItem[]; active?: string; onNavigate?: () => void }) {
  return (
    <ul className="space-y-1.5 border-l border-line">
      {items.map((t) => (
        <li key={t.id} className={t.depth === 3 ? "pl-6" : "pl-3"}>
          <a
            href={`#${t.id}`}
            onClick={onNavigate}
            aria-current={active === t.id ? "location" : undefined}
            className={`-ml-px block leading-snug transition hover:text-accent pointer-coarse:flex pointer-coarse:min-h-11 pointer-coarse:items-center ${
              active === t.id ? "font-medium text-accent" : "text-muted"
            }`}
          >
            {t.text}
          </a>
        </li>
      ))}
    </ul>
  );
}

export default function Toc({ items }: { items: TocItem[] }) {
  const active = useActiveHeading(items);
  if (items.length < 2) return null;
  return (
    <nav aria-label="목차" className="text-sm">
      <p className="mb-3 text-xs font-semibold text-muted">이 글의 목차</p>
      <TocList items={items} active={active} />
    </nav>
  );
}

/** Collapsed table of contents for screens where the sidebar is hidden. */
export function MobileToc({ items, className = "" }: { items: TocItem[]; className?: string }) {
  const [open, setOpen] = useState(false);
  if (items.length < 2) return null;
  return (
    <details
      open={open}
      onToggle={(e) => setOpen(e.currentTarget.open)}
      className={`group rounded-xl border border-line bg-bg-elev text-sm ${className}`}
    >
      <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 font-medium text-fg [&::-webkit-details-marker]:hidden">
        목차
        <span className="ml-auto text-xs font-normal text-muted">{items.length}개 항목</span>
        <svg viewBox="0 0 16 16" className="size-3 text-muted transition group-open:rotate-180" fill="currentColor" aria-hidden>
          <path d="M3.5 6 8 10.5 12.5 6z" />
        </svg>
      </summary>
      <nav aria-label="목차" className="px-4 pb-4">
        <TocList items={items} onNavigate={() => setOpen(false)} />
      </nav>
    </details>
  );
}

/**
 * Below the wide layout, a button pinned to the bottom opens a sheet with the TOC and whatever the page passes
 * (the note's connections). A native modal dialog gives Escape, focus return and an inert page for free.
 */
export function NoteSheet({ items, children, label }: { items: TocItem[]; children?: ReactNode; label: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const active = useActiveHeading(items);
  const hasToc = items.length >= 2;
  if (!hasToc && !children) return null;
  const close = () => ref.current?.close();
  return (
    <div className="xl:hidden">
      {/* Room under the last row of the page so the pinned button never covers it */}
      <div aria-hidden className="h-20" />
      <button
        type="button"
        aria-haspopup="dialog"
        onClick={() => ref.current?.showModal()}
        className="fixed bottom-5 left-1/2 z-30 inline-flex min-h-12 -translate-x-1/2 items-center gap-2 rounded-full border border-line bg-bg-elev px-5 text-sm font-semibold text-fg-strong shadow-lg shadow-black/20 transition hover:border-accent"
      >
        {label}
      </button>
      <dialog
        ref={ref}
        aria-labelledby="note-sheet-title"
        onClick={(e) => e.target === e.currentTarget && close()}
        className="fixed inset-x-0 top-auto bottom-0 m-0 max-h-[80dvh] w-full max-w-none overflow-y-auto rounded-t-2xl border border-line bg-bg-elev p-0 text-fg backdrop:bg-black/50"
      >
        <div className="px-5 pt-3 pb-8">
          <span aria-hidden className="mx-auto block h-1 w-10 rounded-full bg-line" />
          <div className="mt-2 flex items-center justify-between">
            <h2 id="note-sheet-title" className="text-base font-bold text-fg-strong">
              이 노트
            </h2>
            <button type="button" onClick={close} className="-mr-2 flex size-11 items-center justify-center rounded-full text-muted hover:text-fg-strong">
              <span className="sr-only">닫기</span>
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          {hasToc && (
            <nav aria-label="목차" className="mt-3 text-sm">
              <TocList items={items} active={active} onNavigate={close} />
            </nav>
          )}
          {children && (
            <div className={hasToc ? "mt-6 border-t border-line pt-5" : "mt-3"} onClick={(e) => (e.target as HTMLElement).closest("a") && close()}>
              {children}
            </div>
          )}
        </div>
      </dialog>
    </div>
  );
}
