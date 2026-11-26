"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const LINKS = [
  { href: "/", label: "About" },
  { href: "/blog", label: "Blog" },
  { href: "/knowledge", label: "Knowledge" },
  { href: "/books", label: "Books" },
  { href: "/portfolio", label: "Portfolio" },
];

const isActive = (href: string, pathname: string) =>
  href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

export default function NavLinks() {
  const pathname = usePathname();
  return (
    <>
      <nav aria-label="주 메뉴" className="hidden items-center gap-1 text-sm sm:flex">
        {LINKS.map((l) => {
          const active = isActive(l.href, pathname);
          return (
            <Link
              key={l.href}
              href={l.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-11 items-center rounded-full px-3 whitespace-nowrap transition ${
                active ? "bg-accent-soft text-accent" : "text-muted hover:text-fg-strong"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
      <MobileMenu pathname={pathname} />
    </>
  );
}

/** Phones get a labelled menu button instead of a row of links that runs off the screen. */
function MobileMenu({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);
  const [openedAt, setOpenedAt] = useState(pathname);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  // Following a link closes the menu
  if (open && pathname !== openedAt) setOpen(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  const current = LINKS.find((l) => isActive(l.href, pathname));
  return (
    <div ref={rootRef} className="sm:hidden">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => {
          setOpenedAt(pathname);
          setOpen((o) => !o);
        }}
        className="flex min-h-11 items-center gap-1.5 rounded-lg border border-line px-3.5 text-sm text-fg transition hover:border-accent hover:text-accent"
      >
        메뉴
        {current && <span className="text-muted">· {current.label}</span>}
        <svg aria-hidden viewBox="0 0 16 16" className={`size-3 text-muted transition ${open ? "rotate-180" : ""}`} fill="currentColor">
          <path d="M3.5 6 8 10.5 12.5 6z" />
        </svg>
      </button>
      <nav
        id="mobile-menu"
        aria-label="주 메뉴"
        hidden={!open}
        className="absolute inset-x-0 top-14 border-b border-line bg-bg px-4 py-2 shadow-lg"
      >
        <ul>
          {LINKS.map((l) => {
            const active = isActive(l.href, pathname);
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={`flex min-h-12 items-center rounded-lg px-3 text-base transition ${
                    active ? "bg-accent-soft text-accent" : "text-fg hover:text-accent"
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
