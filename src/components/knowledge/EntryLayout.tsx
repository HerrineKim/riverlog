"use client";

import { useSyncExternalStore, type ReactNode } from "react";

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

/**
 * Dictionary layout: a collapsible sidebar (the choice is remembered per browser) beside the page.
 * The page brings its own TOC column, so this shell can live in a layout shared by every note.
 */
export default function EntryLayout({ sidebar, children }: { sidebar: ReactNode; children: ReactNode }) {
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
        collapsed ? "lg:grid-cols-[2rem_minmax(0,1fr)]" : "lg:grid-cols-[15rem_minmax(0,1fr)]"
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
            className={`mb-3 flex size-8 shrink-0 items-center justify-center rounded-md border border-line pointer-coarse:size-11 text-muted transition hover:border-accent hover:text-accent ${collapsed ? "" : "self-end"}`}
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

      <div className="min-w-0">{children}</div>
    </div>
  );
}
