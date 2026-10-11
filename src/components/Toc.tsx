import type { TocItem } from "@/lib/markdown";

export default function Toc({ items }: { items: TocItem[] }) {
  if (items.length < 2) return null;
  return (
    <nav aria-label="목차" className="text-sm">
      <p className="mb-3 text-xs font-semibold tracking-[0.18em] text-muted uppercase">On this page</p>
      <ul className="space-y-1.5 border-l border-line">
        {items.map((t) => (
          <li key={t.id} className={t.depth === 3 ? "pl-6" : "pl-3"}>
            <a
              href={`#${t.id}`}
              className="-ml-px block border-l border-transparent pl-0 leading-snug text-muted transition hover:text-accent"
            >
              {t.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
