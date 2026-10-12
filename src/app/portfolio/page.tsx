import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import { getAllWorks } from "@/lib/portfolio";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "회사에서 만든 것들 — 건설 AX, 미국 핀테크·장학금 플랫폼, 에이전시 프로젝트.",
};

export default function PortfolioIndex() {
  const works = getAllWorks();
  return (
    <>
      <main className="mx-auto w-full max-w-4xl px-4 py-14 sm:px-6 sm:py-20">
        <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">Portfolio</p>
        <h1 className="mt-3 font-display text-5xl text-fg-strong sm:text-6xl">일한 것들</h1>
        <p className="mt-4 max-w-2xl text-muted">
          에이전시에서 시작해 미국 핀테크·장학금 플랫폼을 거쳐 건설사 AX팀까지. 회사별로 맡았던 제품과 문제, 그리고 결과를 정리했습니다.
        </p>

        <ol className="relative mt-14 space-y-10 border-l border-line pl-6 sm:pl-10">
          {works.map((w) => (
            <li key={w.slug} className="relative">
              <span aria-hidden className="absolute top-2 -left-[1.82rem] size-3 rounded-full border-2 border-accent bg-bg sm:-left-[2.82rem]" />
              <p className="text-sm text-muted tabular-nums">{w.period}</p>
              <Link
                href={`/portfolio/${w.slug}`}
                className="group mt-2 block rounded-2xl border border-line bg-bg-elev p-5 transition hover:border-accent sm:p-7"
              >
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h2 className="text-2xl font-semibold text-fg-strong transition group-hover:text-accent">{w.company}</h2>
                  {w.companyEn && <span className="text-sm text-muted">{w.companyEn}</span>}
                </div>
                <p className="mt-1 text-sm text-muted">
                  {w.role}
                  {w.location && <> · {w.location}</>}
                </p>
                <p className="mt-4 text-fg">{w.summary}</p>

                {w.highlights.length > 0 && (
                  <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {w.highlights.slice(0, 4).map((h) => (
                      <div key={h.label} className="flex flex-col-reverse rounded-xl bg-bg-sunken px-3 py-2.5">
                        <dt className="text-xs leading-snug text-muted">{h.label}</dt>
                        <dd className="text-lg font-semibold text-accent tabular-nums">{h.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}

                {w.projects.length > 0 && (
                  <ul className="mt-5 space-y-1 text-sm text-fg">
                    {w.projects.map((p) => (
                      <li key={p} className="flex gap-2">
                        <span aria-hidden className="text-accent">▸</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-5 flex flex-wrap gap-1.5">
                  {w.stack.map((s) => (
                    <span key={s} className="rounded-full border border-line px-2.5 py-0.5 text-xs text-muted">
                      {s}
                    </span>
                  ))}
                </div>
                <p className="mt-5 text-sm text-accent">
                  자세히 보기 <span aria-hidden>→</span>
                </p>
              </Link>
            </li>
          ))}
          {works.length === 0 && <li className="text-muted">준비 중이에요.</li>}
        </ol>
      </main>
      <SiteFooter />
    </>
  );
}
