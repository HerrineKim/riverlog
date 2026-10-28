import Link from "next/link";
import BugReport from "./BugReport";
import NavLinks from "./NavLinks";
import ThemeToggle from "./ThemeToggle";

export function RiverMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden>
      <path d="M3 11c4-4 8 4 13 0s9 4 13 0" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M3 18c4-4 8 4 13 0s9 4 13 0" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" opacity=".65" />
      <path d="M3 25c4-4 8 4 13 0s9 4 13 0" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" opacity=".35" />
    </svg>
  );
}

export default function SiteHeader() {
  return (
    // The only blurred surface: page content scrolls under the header and stays legible through it
    <header className="sticky top-0 z-40 border-b border-line/70 bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-4 min-[400px]:gap-4 sm:px-6">
        <Link href="/" className="group flex min-h-11 shrink-0 items-center gap-2 text-fg-strong" aria-label="riverlog 홈">
          <RiverMark className="size-6 text-accent transition group-hover:translate-x-0.5" />
          <span className="hidden font-display text-2xl leading-none tracking-tight min-[480px]:inline">riverlog</span>
        </Link>
        <div className="flex min-w-0 items-center gap-1 sm:gap-3">
          <NavLinks />
          <BugReport />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
