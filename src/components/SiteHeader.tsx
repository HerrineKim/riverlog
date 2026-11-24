import Link from "next/link";
import BugReport from "./BugReport";
import NavLinks from "./NavLinks";
import ThemeToggle from "./ThemeToggle";
import { riverMark } from "@/lib/river-mark";

export function RiverMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 256 256" className={className} fill="currentColor" aria-hidden>
      <path d={riverMark.regular} />
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
