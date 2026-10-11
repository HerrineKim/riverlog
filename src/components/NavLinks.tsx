"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "About" },
  { href: "/blog", label: "Blog" },
  { href: "/knowledge", label: "Knowledge" },
  { href: "/books", label: "Books" },
];

export default function NavLinks() {
  const pathname = usePathname();
  return (
    <nav className="flex items-center gap-0.5 text-sm sm:gap-1">
      {LINKS.map((l) => {
        const active = l.href === "/" ? pathname === "/" : pathname === l.href || pathname.startsWith(`${l.href}/`);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`rounded-full px-2.5 py-1.5 transition sm:px-3 ${
              active ? "bg-accent-soft text-accent" : "text-muted hover:text-fg-strong"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
