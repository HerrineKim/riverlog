import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import CareerRiver from "@/components/portfolio/CareerRiver";
import { getAllWorks, type Work } from "@/lib/portfolio";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "에이전시의 고객사 웹·앱부터 미국 핀테크의 성장 팀, 건설사 AX팀까지. 회사마다 풀었던 문제와 바뀐 숫자.",
};

export default function PortfolioIndex() {
  const works = getAllWorks();
  const projectCount = works.reduce((n, w) => n + w.projects.length, 0);

  return (
    <>
      <main>
        <section className="river-grain border-b border-line/70">
          <div className="mx-auto max-w-5xl px-4 pt-16 pb-14 sm:px-6 sm:pt-24">
            <h1 className="max-w-3xl text-4xl leading-[1.15] font-bold tracking-tight text-balance text-fg-strong sm:text-6xl">
              에이전시에서 건설 현장까지
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
              고객사 웹·앱을 만들던 첫 회사부터 미국 핀테크의 성장 팀, 건설사 AX팀까지. {works.length}곳에서 맡은 {projectCount}개
              프로젝트를 회사별로 모았습니다. 무엇이 문제였고, 무엇을 만들었고, 어떤 숫자가 바뀌었는지.
            </p>
            <CareerRiver works={works} />
          </div>
        </section>

        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          {works.map((w) => (
            <WorkSection key={w.slug} work={w} />
          ))}
          {works.length === 0 && <p className="py-16 text-muted">아직 정리한 경력이 없어요.</p>}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function WorkSection({ work: w }: { work: Work }) {
  const href = `/portfolio/${w.slug}`;
  return (
    <section id={w.slug} aria-labelledby={`${w.slug}-name`} className="scroll-mt-20 border-b border-line py-16 last:border-b-0 sm:py-20">
      <div className="grid gap-x-12 gap-y-6 lg:grid-cols-[11rem_minmax(0,1fr)]">
        <div className="text-sm text-muted lg:pt-3">
          <p className="text-fg tabular-nums">{w.period}</p>
          <p className="mt-1">{w.role}</p>
          {w.location && <p className="mt-1">{w.location}</p>}
        </div>

        <div className="min-w-0">
          <h2 id={`${w.slug}-name`} className="text-3xl font-bold tracking-tight text-fg-strong sm:text-5xl">
            <Link href={href} className="transition hover:text-accent">
              {w.company}
            </Link>
            {w.companyEn && <span className="ml-3 align-middle text-base font-normal tracking-normal text-muted">{w.companyEn}</span>}
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-fg">{w.summary}</p>

          {w.highlights.length > 0 && (
            <dl className="mt-9 grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4">
              {w.highlights.map((h) => (
                <div key={h.label} className="flex flex-col-reverse border-l border-accent/40 pl-4">
                  <dt className="mt-1 text-xs leading-snug text-muted">{h.label}</dt>
                  <dd className="font-display text-3xl leading-none text-fg-strong tabular-nums sm:text-4xl">{h.value}</dd>
                </div>
              ))}
            </dl>
          )}

          {w.cover && (
            <Link href={href} className="mt-10 block overflow-hidden rounded-2xl border border-line" tabIndex={-1} aria-hidden>
              <Image
                src={w.cover}
                alt=""
                width={1600}
                height={900}
                sizes="(min-width: 1024px) 50rem, 100vw"
                className="h-auto max-h-[26rem] w-full object-cover object-top transition duration-500 hover:scale-[1.015]"
              />
            </Link>
          )}

          <ul className="mt-10 grid gap-x-10 gap-y-5 sm:grid-cols-2">
            {w.projects.map((p) => (
              <li key={p.id}>
                <Link href={`${href}#${p.id}`} className="group block">
                  <span className="font-semibold text-fg-strong transition group-hover:text-accent">{p.title}</span>
                  {p.summary && <span className="mt-1 block text-sm leading-relaxed text-muted">{p.summary}</span>}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
            <p className="text-sm text-muted">{w.stack.join(", ")}</p>
            <Link
              href={href}
              className="shrink-0 rounded-full border border-line px-4 py-2 text-sm text-fg transition hover:border-accent hover:text-accent"
            >
              {w.company} 자세히 보기
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
