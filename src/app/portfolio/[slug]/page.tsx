import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Prose from "@/components/Prose";
import SiteFooter from "@/components/SiteFooter";
import Toc, { MobileToc } from "@/components/Toc";
import { extractToc } from "@/lib/markdown";
import { getAllWorks, getWork, type WorkKind } from "@/lib/portfolio";

export const dynamicParams = false;

const LABELS: Record<WorkKind, { location: string; about: string }> = {
  career: { location: "근무 형태", about: "회사" },
  education: { location: "장소", about: "과정" },
  project: { location: "장소", about: "행사" },
};

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
        <header className="river-grain border-b border-line/70">
          <div className="mx-auto max-w-6xl px-4 pt-14 pb-14 sm:px-6 sm:pt-20">
            <Link href={`/portfolio#${work.slug}`} className="text-sm text-muted hover:text-accent">
              포트폴리오로 돌아가기
            </Link>
            <div className="mt-10 grid gap-x-12 gap-y-6 lg:grid-cols-[minmax(0,1fr)_17rem]">
              <div>
                <h1 className="text-5xl font-bold tracking-tight text-fg-strong sm:text-7xl">{work.company}</h1>
                <p className="mt-4 text-lg text-accent">{work.role}</p>
                <p className="mt-8 max-w-2xl text-xl leading-relaxed text-fg">{work.summary}</p>
              </div>
              <dl className="grid content-start gap-4 border-line text-sm lg:border-l lg:pl-8">
                <div>
                  <dt className="text-muted">기간</dt>
                  <dd className="mt-0.5 text-fg tabular-nums">{work.period}</dd>
                </div>
                {work.location && (
                  <div>
                    <dt className="text-muted">{LABELS[work.kind].location}</dt>
                    <dd className="mt-0.5 text-fg">{work.location}</dd>
                  </div>
                )}
                {work.about && (
                  <div>
                    <dt className="text-muted">{LABELS[work.kind].about}</dt>
                    <dd className="mt-0.5 leading-relaxed text-fg">{work.about}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-muted">기술</dt>
                  <dd className="mt-0.5 leading-relaxed text-fg">{work.stack.join(", ")}</dd>
                </div>
              </dl>
            </div>

            {work.highlights.length > 0 && (
              <dl className="mt-14 grid grid-cols-2 gap-x-8 gap-y-8 border-t border-line pt-10 sm:grid-cols-4">
                {work.highlights.map((h) => (
                  <div key={h.label} className="flex flex-col-reverse">
                    <dt className="mt-2 text-sm leading-snug text-muted">{h.label}</dt>
                    <dd className="font-display text-4xl leading-none text-accent tabular-nums sm:text-5xl">{h.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </header>

        <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 pt-14 pb-24 sm:px-6 lg:grid-cols-[minmax(0,1fr)_14rem]">
          <article className="mx-auto w-full max-w-3xl min-w-0 lg:mr-0">
            {work.cover && (
              <Image
                src={work.cover}
                alt={`${work.company}에서 만든 서비스 화면`}
                width={1600}
                height={1000}
                sizes="(min-width: 1024px) 48rem, 100vw"
                priority
                className="mb-12 h-auto w-full rounded-2xl border border-line"
              />
            )}
            <MobileToc items={toc} className="mb-8 lg:hidden" />
            <Prose markdown={work.body} figures className="prose-portfolio" />

            <nav aria-label="다른 경력" className="mt-20 grid gap-3 border-t border-line pt-8 sm:grid-cols-2">
              {older ? (
                <Link href={`/portfolio/${older.slug}`} className="group rounded-2xl border border-line p-5 transition hover:border-accent">
                  <p className="text-xs text-muted">이전 경력 · {older.period}</p>
                  <p className="mt-1 text-lg font-semibold text-fg-strong group-hover:text-accent">{older.company}</p>
                </Link>
              ) : (
                <span />
              )}
              {newer && (
                <Link href={`/portfolio/${newer.slug}`} className="group rounded-2xl border border-line p-5 text-right transition hover:border-accent">
                  <p className="text-xs text-muted">다음 경력 · {newer.period}</p>
                  <p className="mt-1 text-lg font-semibold text-fg-strong group-hover:text-accent">{newer.company}</p>
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
