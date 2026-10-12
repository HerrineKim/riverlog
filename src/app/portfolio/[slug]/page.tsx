import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Prose from "@/components/Prose";
import SiteFooter from "@/components/SiteFooter";
import Toc, { MobileToc } from "@/components/Toc";
import { extractToc } from "@/lib/markdown";
import { getAllWorks, getWork } from "@/lib/portfolio";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllWorks().map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({ params }: PageProps<"/portfolio/[slug]">): Promise<Metadata> {
  const work = getWork((await params).slug);
  return work ? { title: `${work.company} · Portfolio`, description: work.summary } : {};
}

export default async function WorkPage({ params }: PageProps<"/portfolio/[slug]">) {
  const work = getWork((await params).slug);
  if (!work) notFound();
  const toc = extractToc(work.body);
  const works = getAllWorks();
  const i = works.findIndex((w) => w.slug === work.slug);
  const [newer, older] = [works[i - 1], works[i + 1]];

  return (
    <>
      <main>
        <div className="river-grain border-b border-line/70">
          <header className="mx-auto max-w-6xl px-4 pt-14 pb-12 sm:px-6 sm:pt-20">
            <Link href="/portfolio" className="text-sm text-muted hover:text-accent">
              <span aria-hidden>←</span> 포트폴리오
            </Link>
            <p className="mt-6 text-sm text-muted tabular-nums">
              {work.period}
              {work.location && <> · {work.location}</>}
            </p>
            <h1 className="mt-2 text-4xl leading-tight font-bold text-balance text-fg-strong sm:text-5xl">
              {work.company}
              {work.companyEn && <span className="ml-3 text-xl font-normal text-muted sm:text-2xl">{work.companyEn}</span>}
            </h1>
            <p className="mt-3 text-lg text-accent">{work.role}</p>
            <p className="mt-5 max-w-3xl text-lg text-fg">{work.summary}</p>
            {work.about && <p className="mt-3 max-w-3xl text-sm text-muted">{work.about}</p>}

            {work.highlights.length > 0 && (
              <dl className="mt-8 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4">
                {work.highlights.map((h) => (
                  <div key={h.label} className="flex flex-col-reverse rounded-xl border border-line bg-bg-elev px-4 py-3">
                    <dt className="mt-0.5 text-xs leading-snug text-muted">{h.label}</dt>
                    <dd className="text-2xl font-semibold text-accent tabular-nums">{h.value}</dd>
                  </div>
                ))}
              </dl>
            )}
            <ul className="mt-6 flex flex-wrap gap-1.5" aria-label="기술 스택">
              {work.stack.map((s) => (
                <li key={s} className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs text-accent">
                  {s}
                </li>
              ))}
            </ul>
          </header>
        </div>

        <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 py-12 pb-24 sm:px-6 lg:grid-cols-[minmax(0,1fr)_14rem]">
          <article className="mx-auto w-full max-w-3xl min-w-0 lg:mr-0">
            {work.cover && (
              <Image
                src={work.cover}
                alt={`${work.company} 대표 화면`}
                width={1600}
                height={1000}
                sizes="(min-width: 1024px) 48rem, 100vw"
                priority
                className="mb-10 h-auto w-full rounded-2xl border border-line"
              />
            )}
            <MobileToc items={toc} className="mb-8 lg:hidden" />
            <Prose markdown={work.body} />

            <nav aria-label="다른 회사" className="mt-16 grid gap-3 border-t border-line pt-8 sm:grid-cols-2">
              {older ? (
                <Link href={`/portfolio/${older.slug}`} className="group rounded-xl border border-line p-4 transition hover:border-accent">
                  <p className="text-xs text-muted">
                    <span aria-hidden>←</span> 이전 경력
                  </p>
                  <p className="mt-1 font-semibold text-fg-strong group-hover:text-accent">{older.company}</p>
                </Link>
              ) : (
                <span />
              )}
              {newer && (
                <Link href={`/portfolio/${newer.slug}`} className="group rounded-xl border border-line p-4 text-right transition hover:border-accent">
                  <p className="text-xs text-muted">
                    다음 경력 <span aria-hidden>→</span>
                  </p>
                  <p className="mt-1 font-semibold text-fg-strong group-hover:text-accent">{newer.company}</p>
                </Link>
              )}
            </nav>
          </article>
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <Toc items={toc} />
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
