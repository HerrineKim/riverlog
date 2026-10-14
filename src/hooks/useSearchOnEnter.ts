"use client";

import { useState } from "react";

/**
 * A search box that only searches when Enter is pressed. `query` is the submitted value;
 * typing changes only the draft, emptying the box or pressing Escape clears the search.
 */
export default function useSearchOnEnter(onSubmit?: (query: string) => void) {
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const clear = () => {
    setDraft("");
    setQuery("");
  };
  const inputProps = {
    value: draft,
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
