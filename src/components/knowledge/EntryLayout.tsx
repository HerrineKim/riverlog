"use client";

import { useLayoutEffect, useSyncExternalStore, type ReactNode } from "react";

const STORAGE_KEY = "knowledge-sidebar-collapsed";
const CHANGE_EVENT = "knowledge-sidebar-change";

function readCollapsed() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

// Back/forward navigations keep the scroll position the browser restores
let lastPopState = 0;
if (typeof window !== "undefined") window.addEventListener("popstate", () => (lastPopState = Date.now()));
let firstEntry = true;

/**
 * Next.js keeps the scroll position when the next page is "visible", and Chrome's scroll anchoring then
 * pins it to the comments block both pages share, so a new entry opened mid-scroll landed on its comments.
 * Render with `key` set to the entry: each entry starts at the top unless it came from back/forward or a #hash.
 */
export function ScrollReset() {
  useLayoutEffect(() => {
    const initial = firstEntry;
    firstEntry = false;
    if (initial || location.hash || Date.now() - lastPopState < 1000) return;
    window.scrollTo(0, 0);
    // Late layout (fonts, the outgoing page) can still nudge it by a few pixels
    const id = requestAnimationFrame(() => window.scrollTo(0, 0));
    return () => cancelAnimationFrame(id);
  }, []);
  return null;
}

/** Three-column dictionary layout whose sidebar can be collapsed; the choice is remembered per browser. */
export default function EntryLayout({ sidebar, children, toc }: { sidebar: ReactNode; children: ReactNode; toc: ReactNode }) {
  const collapsed = useSyncExternalStore(subscribe, readCollapsed, () => false);

  function toggle() {
    try {
      localStorage.setItem(STORAGE_KEY, collapsed ? "0" : "1");
    } catch {}
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }

  return (
    <div
      className={`mx-auto grid w-full max-w-7xl gap-10 px-4 pt-8 pb-24 sm:px-6 ${
        collapsed
          ? "lg:grid-cols-[2rem_minmax(0,1fr)] xl:grid-cols-[2rem_minmax(0,1fr)_13rem]"
          : "lg:grid-cols-[15rem_minmax(0,1fr)] xl:grid-cols-[15rem_minmax(0,1fr)_13rem]"
      }`}
    >
      <aside aria-label="사전 탐색" className="hidden lg:block">
        <div className="sticky top-20 flex max-h-[calc(100dvh-6rem)] flex-col">
          <button
            type="button"
            onClick={toggle}
            aria-expanded={!collapsed}
            aria-controls="dictionary-tree"
            title={collapsed ? "목록 펼치기" : "목록 접기"}
            className={`mb-3 flex size-8 shrink-0 items-center justify-center rounded-md border border-line text-muted transition hover:border-accent hover:text-accent ${collapsed ? "" : "self-end"}`}
          >
            <span className="sr-only">{collapsed ? "목록 펼치기" : "목록 접기"}</span>
            <svg viewBox="0 0 16 16" className={`size-3.5 transition ${collapsed ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
              <path d="M10 3.5 5.5 8 10 12.5" />
            </svg>
          </button>
          <div
            id="dictionary-tree"
            hidden={collapsed}
            className="overflow-y-auto pr-2 pb-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {sidebar}
          </div>
        </div>
      </aside>

      <main className="min-w-0">{children}</main>

      <div className="hidden xl:block">
        <div className="sticky top-20">{toc}</div>
      </div>
    </div>
  );
}
