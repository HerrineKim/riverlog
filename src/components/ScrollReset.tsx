"use client";

import { useLayoutEffect } from "react";

// Back/forward navigations keep the scroll position the browser restores
let lastPopState = 0;
if (typeof window !== "undefined") window.addEventListener("popstate", () => (lastPopState = Date.now()));
let firstEntry = true;

/**
 * Next.js keeps the scroll position when the next page is "visible", and Chrome's scroll anchoring then
 * pins it to the comments block both pages share, so a new entry opened mid-scroll landed on its comments.
 * Render with `key` set to the entry: each entry starts at the top unless it came from back/forward or a #hash.
 */
export default function ScrollReset() {
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
