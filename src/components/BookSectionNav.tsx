import Link from "next/link";
import IntentLink from "@/components/IntentLink";

type Section = "shelf" | "want";

/** Shelf vs want-to-read. Same segmented control as the knowledge views. */
export default function BookSectionNav({ active }: { active: Section }) {
  const item = (key: Section, href: string, label: string) => {
    // The want list ships every unread card, so prefetch it on intent rather than from the shelf
    const L = key === "want" ? IntentLink : Link;
    return (
      <L
        href={href}
        aria-current={active === key ? "page" : undefined}
        className={`flex min-h-11 items-center rounded-full px-3.5 text-sm whitespace-nowrap transition ${
          active === key ? "bg-accent font-medium text-accent-ink" : "text-muted hover:text-fg-strong"
        }`}
      >
        {label}
      </L>
    );
  };
  return (
    <nav aria-label="책 목록" className="inline-flex rounded-full border border-line bg-bg-elev p-1">
      {item("shelf", "/books", "책장")}
      {item("want", "/books/want", "읽고 싶은 책")}
    </nav>
  );
}
