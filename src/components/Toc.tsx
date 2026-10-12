"use client";

import { useEffect, useState } from "react";
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
            className={`-ml-px block leading-snug transition hover:text-accent ${
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
      <p className="mb-3 text-xs font-semibold tracking-[0.18em] text-muted uppercase">On this page</p>
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
