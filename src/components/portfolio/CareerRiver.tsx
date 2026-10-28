import Link from "next/link";
import { monthSpan, onTimeline, type Work } from "@/lib/portfolio";

/**
 * Every company on one shared time axis, each bar as long as the time spent there.
 * Older stretches are paler and the current one carries the full accent, so the river runs toward now.
 */
export default function CareerRiver({ works }: { works: Work[] }) {
  const rows = works.filter(onTimeline).sort((a, b) => a.start.localeCompare(b.start));
  if (rows.length === 0) return null;
  const origin = rows[0].start;
  const total = monthSpan(origin, rows.reduce((m, w) => (w.end > m ? w.end : m), rows[0].end));
  const offset = (ym: string) => monthSpan(origin, ym) - 1;
  const firstYear = Number(origin.slice(0, 4)) + 1;
  const years = Array.from({ length: Math.ceil(total / 12) }, (_, i) => firstYear + i).filter((y) => offset(`${y}-01`) < total);

  return (
    <figure className="mt-14">
      <figcaption className="sr-only">회사별 근무 기간 타임라인</figcaption>
      <div className="relative ml-0 sm:ml-40">
        {/* year ticks share the bar track's coordinates */}
        <div aria-hidden className="relative h-6 text-xs text-muted tabular-nums">
          {years.map((y) => (
            <span key={y} className="absolute top-0 -translate-x-1/2" style={{ left: `${(offset(`${y}-01`) / total) * 100}%` }}>
              {y}
            </span>
          ))}
        </div>
      </div>
      <ol className="space-y-3 sm:space-y-2">
        {rows.map((w, i) => {
          const strength = 35 + Math.round((65 * i) / Math.max(1, rows.length - 1));
          const months = monthSpan(w.start, w.end);
          return (
            <li key={w.slug}>
              <Link href={`#${w.slug}`} className="group grid items-center gap-x-4 gap-y-1.5 pointer-coarse:min-h-11 sm:grid-cols-[9rem_minmax(0,1fr)]">
                <span className="truncate text-sm text-fg transition group-hover:text-accent sm:text-right">
                  {w.company}
                  <span className="ml-2 text-xs text-muted tabular-nums sm:hidden">{months}개월</span>
                </span>
                <span className="relative block h-3 rounded-full bg-bg-sunken">
                  {years.map((y) => (
                    <span
                      key={y}
                      aria-hidden
                      className="absolute inset-y-0 w-px bg-line"
                      style={{ left: `${(offset(`${y}-01`) / total) * 100}%` }}
                    />
                  ))}
                  <span
                    className="river-bar absolute inset-y-0 rounded-full transition group-hover:brightness-125"
                    style={{
                      left: `${(offset(w.start) / total) * 100}%`,
                      width: `${(months / total) * 100}%`,
                      background: `color-mix(in srgb, var(--accent) ${strength}%, transparent)`,
                      animationDelay: `${i * 120}ms`,
                    }}
                  />
                  <span className="sr-only">
                    {w.period}, {months}개월
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </figure>
  );
}
