"use client";

export default function ThemeToggle() {
  function toggle() {
    const root = document.documentElement;
    const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={toggle}
      title="테마 전환"
      className="grid size-9 place-items-center rounded-full border border-line text-muted transition hover:border-accent hover:text-accent"
    >
      {/* moon in dark mode, sun in light mode; swapped purely with CSS so there is no hydration flash.
          The accessible name says what pressing it will do, and swaps the same way. */}
      <span className="sr-only hidden dark:block">라이트 모드로 전환</span>
      <span className="sr-only dark:hidden">다크 모드로 전환</span>
      <svg aria-hidden viewBox="0 0 24 24" className="size-4 dark:block hidden" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" strokeLinejoin="round" />
      </svg>
      <svg aria-hidden viewBox="0 0 24 24" className="size-4 dark:hidden block" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" strokeLinecap="round" />
      </svg>
    </button>
  );
}
