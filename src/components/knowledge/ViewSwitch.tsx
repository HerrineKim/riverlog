import Link from "next/link";

type View = "map" | "dictionary" | "tags";

export default function ViewSwitch({ active }: { active: View }) {
  const item = (key: View, href: string, label: string, icon: React.ReactNode) => (
    <Link
      href={href}
      aria-current={active === key ? "page" : undefined}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm whitespace-nowrap transition sm:px-3.5 ${
        active === key ? "bg-accent text-accent-ink font-medium" : "text-muted hover:text-fg-strong"
      }`}
    >
      <span className="hidden sm:inline">{icon}</span>
      {label}
    </Link>
  );
  return (
    <div className="inline-flex rounded-full border border-line bg-bg-elev/80 p-1 backdrop-blur">
      {item(
        "map",
        "/knowledge",
        "마인드맵",
        <svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="2.5" />
          <circle cx="4.5" cy="6" r="1.8" />
          <circle cx="19.5" cy="6" r="1.8" />
          <circle cx="6" cy="19" r="1.8" />
          <circle cx="18.5" cy="18" r="1.8" />
          <path d="M10 10.5 6 7.2M14 10.5l4-3.3M10.3 13.8 7.2 17.6M13.9 13.6l3.3 3.2" />
        </svg>,
      )}
      {item(
        "dictionary",
        "/knowledge/dictionary",
        "계층형 사전",
        <svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M4 5h6M4 12h6M4 19h6M14 5h6M16 9h4M16 12h4M14 16h6M16 19h4" strokeLinecap="round" />
        </svg>,
      )}
      {item(
        "tags",
        "/knowledge/tags",
        "태그",
        <svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z" strokeLinejoin="round" />
          <circle cx="8" cy="8" r="1.5" />
        </svg>,
      )}
    </div>
  );
}
