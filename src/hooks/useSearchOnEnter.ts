"use client";

import { useState } from "react";
import useUrlState from "./useUrlState";

/**
 * A search box that only searches when Enter is pressed. `query` is the submitted value, kept in the
 * `param` query param; typing changes only the draft, emptying the box or pressing Escape clears the search.
 */
export default function useSearchOnEnter(param: string, onSubmit?: (query: string) => void) {
  const [query, setQuery] = useUrlState(param, "");
  const [draft, setDraft] = useState(query);
  // A query arriving from the URL (first load, back/forward) fills the box
  const [shown, setShown] = useState(query);
  if (query !== shown) {
    setShown(query);
    setDraft(query);
  }
  const clear = () => {
    setDraft("");
    setQuery("");
  };
  const inputProps = {
    value: draft,
    autoComplete: "off",
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      setDraft(e.target.value);
      if (!e.target.value) setQuery("");
    },
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Enter that confirms a Hangul syllable is part of typing, not a submit
      if (e.nativeEvent.isComposing) return;
      if (e.key === "Enter") {
        setQuery(draft.trim());
        onSubmit?.(draft.trim());
      }
      if (e.key === "Escape") clear();
    },
  };
  return { query, draft, inputProps, clear };
}
