"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "About" },
  { href: "/blog", label: "Blog" },
  { href: "/knowledge", label: "Knowledge" },
  { href: "/books", label: "Books" },
  { href: "/portfolio", label: "Portfolio" },
];

export default function NavLinks() {
  const pathname = usePathname();
  return (
    // On narrow phones the links scroll sideways instead of squeezing the header buttons below tap size
    <nav aria-label="주 메뉴" className="flex min-w-0 items-center gap-0.5 overflow-x-auto p-1 text-sm [scrollbar-width:none] max-sm:[mask-image:linear-gradient(to_right,black_85%,transparent)] sm:gap-1">
      {LINKS.map((l) => {
        const active = l.href === "/" ? pathname === "/" : pathname === l.href || pathname.startsWith(`${l.href}/`);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-full px-1.5 py-1.5 text-[13px] whitespace-nowrap transition min-[480px]:px-2.5 min-[480px]:text-sm sm:px-3 ${
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
