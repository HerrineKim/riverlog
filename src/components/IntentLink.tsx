"use client";

import Link from "next/link";
import { useState, type ComponentProps } from "react";

/**
 * A Link that prefetches only once the reader shows intent (pointer over it, keyboard focus, or a touch),
 * instead of as soon as it scrolls into view. Use it for links to heavy index pages: /knowledge/dictionary
 * and /books are 100~200 KB of RSC each, and the default prefetch made every page that shows such a link
 * download them in the background.
 */
export default function IntentLink({ onPointerEnter, onFocus, onTouchStart, ...props }: Omit<ComponentProps<typeof Link>, "prefetch">) {
  const [intent, setIntent] = useState(false);
  return (
    <Link
      {...props}
      prefetch={intent ? null : false}
      onPointerEnter={(e) => {
        setIntent(true);
        onPointerEnter?.(e);
      }}
      onFocus={(e) => {
        setIntent(true);
        onFocus?.(e);
      }}
      onTouchStart={(e) => {
        setIntent(true);
        onTouchStart?.(e);
      }}
    />
  );
}
