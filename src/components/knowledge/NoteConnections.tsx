import Link from "next/link";
import { categoryColor } from "@/lib/knowledge";
import type { Connected } from "@/lib/knowledge-connections";

type Props = { linked: Connected[]; tagged: (Connected & { shared: number })[]; compact?: boolean };

/**
 * Notes this note links to or is linked from, then notes that share tags.
 * `compact` is the short list under the wide-screen TOC; the full one closes the article.
 */
export default function NoteConnections({ linked, tagged, compact = false }: Props) {
  if (!linked.length && !tagged.length) return null;
  const Heading = compact ? "p" : "h2";
  return (
    <section aria-label="연결된 노트" className={compact ? "text-sm" : ""}>
      {linked.length > 0 && (
        <>
          <Heading className={compact ? "mb-2 text-xs font-semibold text-muted" : "text-sm font-semibold text-muted"}>
            연결된 노트 {linked.length}
          </Heading>
          <ul className={compact ? "space-y-1" : "mt-3 grid gap-2 sm:grid-cols-2"}>
            {(compact ? linked.slice(0, 5) : linked).map((n) => (
              <li key={n.id}>
                <Item n={n} compact={compact} />
              </li>
            ))}
          </ul>
        </>
      )}
      {tagged.length > 0 && (
        <>
          <Heading className={`${compact ? "mt-4 mb-2 text-xs" : "mt-6 text-sm"} font-semibold text-muted`}>태그가 겹치는 노트</Heading>
          <ul className={compact ? "space-y-1" : "mt-3 grid gap-2 sm:grid-cols-2"}>
            {tagged.map((n) => (
              <li key={n.id}>
                <Item n={n} compact={compact} note={`태그 ${n.shared}개 겹침`} />
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

function Item({ n, compact, note }: { n: Connected; compact: boolean; note?: string }) {
  if (compact)
    return (
      <Link href={n.href} className="block leading-snug text-muted transition hover:text-accent pointer-coarse:flex pointer-coarse:min-h-11 pointer-coarse:items-center">
        {n.title}
      </Link>
    );
  return (
    <Link href={n.href} className="flex h-full flex-col gap-1 rounded-xl border border-line p-4 transition hover:border-accent">
      <span className="font-medium leading-snug text-fg-strong">{n.title}</span>
      <span className="flex items-center gap-1.5 text-xs text-muted">
        <span aria-hidden className="size-2 rounded-full" style={{ background: categoryColor(n.category) }} />
        {n.field}
        {note && <span>· {note}</span>}
      </span>
    </Link>
  );
}
