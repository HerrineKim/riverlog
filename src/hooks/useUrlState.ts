"use client";

import { useCallback, useSyncExternalStore } from "react";

const CHANGE_EVENT = "riverlog:url-state";

function subscribe(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

/**
 * One query param as state, so filtered views can be shared as links. The static page renders `fallback`
 * (no Suspense boundary, so the full list stays in the HTML) and the browser picks up the URL on hydration.
 * Changes replace the history entry: filters are not pages to step back through.
 */
export default function useUrlState(key: string, fallback: string) {
  const value = useSyncExternalStore(
    subscribe,
    () => new URLSearchParams(location.search).get(key) ?? fallback,
    () => fallback,
  );
  const set = useCallback(
    (next: string) => {
      const params = new URLSearchParams(location.search);
      if (next === fallback) params.delete(key);
      else params.set(key, next);
      const search = params.toString();
      window.history.replaceState(null, "", `${location.pathname}${search ? `?${search}` : ""}${location.hash}`);
      window.dispatchEvent(new Event(CHANGE_EVENT));
    },
    [key, fallback],
  );
  return [value, set] as const;
}
