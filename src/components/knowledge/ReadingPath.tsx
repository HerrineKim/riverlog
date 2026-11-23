import Link from "next/link";
import type { ResolvedStep } from "@/lib/knowledge-reading-order";

/** A field's suggested reading order: numbered steps, each naming the topic folders to read. */
export default function ReadingPath({ steps, source }: { steps: ResolvedStep[]; source: string }) {
  if (!steps.length) return null;
  return (
    <section aria-labelledby="reading-path-h" className="rounded-2xl border border-line bg-bg-elev p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="reading-path-h" className="text-sm font-semibold text-muted">
          읽는 순서
        </h2>
        <span className="text-xs text-muted">{source}</span>
      </div>
      <ol className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(9.5rem,1fr))] gap-2">
        {steps.map((s, i) => (
          <li key={s.label} className="flex flex-col gap-1.5 rounded-xl border border-line p-4">
            <span className="font-display text-2xl leading-none text-muted tabular-nums">{i + 1}</span>
            <span className="font-semibold text-fg-strong">{s.label}</span>
            <ul className="flex flex-wrap gap-x-2 text-sm">
              {s.topics.map((t) => (
                <li key={t.href}>
                  <Link href={t.href} className="inline-flex min-h-8 items-center text-accent hover:underline pointer-coarse:min-h-11">
                    {t.name}
                    <span className="ml-1 text-xs text-muted tabular-nums">{t.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  );
}
