"use client";

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect } from "react";

const positions = new Map<string, number>();
const currentUrl = () => location.pathname + location.search;
// Between a navigation starting and the next page committing, the URL and the DOM disagree, so scroll events
// (clamping, scroll anchoring) would be filed under the wrong page
let recordPausedUntil = 0;
const pauseRecording = () => (recordPausedUntil = Date.now() + 1000);
let lastPopState = 0;
// The page load keeps whatever the browser restored; Strict Mode re-running the effect must not reset it
let lastPathname: string | null = null;

if (typeof window !== "undefined") {
  window.addEventListener("popstate", () => {
    lastPopState = Date.now();
    pauseRecording();
  });
  // Capture phase runs before Next.js handles the click, while the old page is still in place
  document.addEventListener(
    "click",
    (e) => {
      if (!(e.target instanceof Element) || !e.target.closest("a[href]")) return;
      positions.set(currentUrl(), window.scrollY);
      pauseRecording();
    },
    true,
  );
}

function scrollToY(top: number) {
  window.scrollTo({ top, behavior: "instant" });
  // Late layout (fonts, the outgoing page) can still nudge it by a few pixels
  const id = requestAnimationFrame(() => window.scrollTo({ top, behavior: "instant" }));
  return () => cancelAnimationFrame(id);
}

/**
 * Next.js keeps the scroll position when the next page is "visible", which every long page is, so a menu
 * click mid-scroll kept the old offset (clamped to the bottom on shorter pages), and Chrome's scroll anchoring
 * pinned dictionary entries to the comments block they share. Every new pathname starts at the top unless it
 * has a #hash; back/forward returns to where that page was left; query-only changes (filters, search) keep their place.
 */
export default function ScrollReset() {
  const pathname = usePathname();

  useEffect(() => {
    let frame = 0;
    const record = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (Date.now() > recordPausedUntil) positions.set(currentUrl(), window.scrollY);
      });
    };
    window.addEventListener("scroll", record, { passive: true });
    return () => {
      window.removeEventListener("scroll", record);
      cancelAnimationFrame(frame);
    };
  }, []);

  useLayoutEffect(() => {
    const initial = lastPathname === null || lastPathname === pathname;
    lastPathname = pathname;
    if (initial) return;
    recordPausedUntil = 0;
    if (location.hash) return;
    if (Date.now() - lastPopState < 1000) return scrollToY(positions.get(currentUrl()) ?? 0);
    return scrollToY(0);
  }, [pathname]);

  return null;
}
