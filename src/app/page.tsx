import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Prose from "@/components/Prose";
import SiteFooter from "@/components/SiteFooter";
import { RiverMark } from "@/components/SiteHeader";
import SocialLinks from "@/components/SocialLinks";
import { getAllPosts } from "@/lib/blog";
import { formatDate } from "@/lib/format";
import { categoryColor, getKnowledgeTree, knowledgeStats } from "@/lib/knowledge";
import { pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = pageMeta({ path: "/" });

function getAbout() {
  const { data, content } = matter(fs.readFileSync(path.join(process.cwd(), "content/about.md"), "utf8"));
  return {
    headline: String(data.headline ?? ""),
    role: data.role ? String(data.role) : undefined,
    photo: typeof data.photo === "string" && data.photo.startsWith("/") ? data.photo : undefined,
    body: content,
  };
}

export default function AboutPage() {
  const about = getAbout();
  const posts = getAllPosts().slice(0, 3);
  const tree = getKnowledgeTree();
  const stats = knowledgeStats();
  const NameTag = about.headline ? "p" : "h1";

  return (
    <>
      <main>
        <section className="river-grain relative overflow-hidden border-b border-line/70">
          <RiverMark className="pointer-events-none absolute -right-24 -bottom-28 size-[28rem] text-accent opacity-[0.06]" />
          <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
            <div className="flex items-center gap-4">
              {about.photo && (
                <Image
                  src={about.photo}
                  alt={`${site.nickname}(${site.author}) 프로필 사진`}
                  width={160}
                  height={160}
                  priority
                  sizes="4rem"
                  className="size-14 shrink-0 rounded-full border border-line object-cover object-[50%_18%] sm:size-16"
                />
              )}
              <div className="min-w-0">
                {/* Without a headline, the name is the page's h1 */}
                <NameTag className="font-semibold text-fg-strong">
                  {site.nickname} <span className="font-normal text-muted">· {site.author}</span>
                </NameTag>
                {about.role && <p className="text-sm text-muted">{about.role}</p>}
              </div>
            </div>

            {about.headline && (
              <h1 className="mt-8 max-w-3xl font-display text-4xl leading-[1.08] text-fg-strong sm:text-6xl">
                {about.headline}
              </h1>
            )}

            <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-16">
              <div className="max-w-2xl">
                <Prose markdown={about.body} />
              </div>
              <section aria-labelledby="contact-heading" className="lg:pt-1">
                <h2 id="contact-heading" className="mb-3 text-xs font-semibold tracking-[0.18em] text-muted uppercase">
                  Contact & Subscribe
                </h2>
                <SocialLinks />
              </section>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-14 px-4 py-16 sm:px-6 lg:grid-cols-2">
          <div>
            <div className="flex items-baseline justify-between">
              <h2 className="text-sm font-semibold tracking-[0.18em] text-muted uppercase">최근 글</h2>
              <Link href="/blog" className="text-sm text-muted hover:text-accent">
                전체 <span aria-hidden>→</span>
              </Link>
            </div>
            <ul className="mt-5 divide-y divide-line border-t border-line">
              {posts.map((p) => (
                <li key={p.slug}>
                  <Link href={`/blog/${p.slug}`} className="group block py-5">
                    <time className="text-xs text-muted" dateTime={p.date}>
                      {formatDate(p.date)}
                    </time>
                    <p className="mt-1 text-lg font-semibold text-fg-strong group-hover:text-accent">{p.title}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-muted">{p.description}</p>
                  </Link>
                </li>
              ))}
              {posts.length === 0 && <li className="py-8 text-sm text-muted">아직 글이 없어요.</li>}
            </ul>
          </div>

          <div>
            <div className="flex items-baseline justify-between">
              <h2 className="text-sm font-semibold tracking-[0.18em] text-muted uppercase">지식 창고</h2>
              <p className="text-sm text-muted tabular-nums">
                {stats.categories}개 분야 · {stats.notes}개 노트
              </p>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Link href="/knowledge" className="group rounded-2xl border border-line bg-bg-elev p-5 transition hover:border-accent">
                <Constellation />
                <p className="text-lg font-semibold text-fg-strong group-hover:text-accent">3D 마인드맵 <span aria-hidden>→</span></p>
                <p className="mt-1 text-sm text-muted">개념 사이의 연결을 한눈에 탐색</p>
              </Link>
              <Link href="/knowledge/dictionary" className="group rounded-2xl border border-line bg-bg-elev p-5 transition hover:border-accent">
                <div className="mb-5 space-y-1.5 font-mono text-xs text-muted">
                  <p>Frontend</p>
                  <p className="pl-3">└ React</p>
                  <p className="pl-7">└ Hooks</p>
                </div>
                <p className="text-lg font-semibold text-fg-strong group-hover:text-accent">계층형 사전 <span aria-hidden>→</span></p>
                <p className="mt-1 text-sm text-muted">분야별 목차와 가나다·ABC 색인</p>
              </Link>
            </div>
            <ul className="mt-6 flex flex-wrap gap-2">
              {tree.children.map((c) => (
                <li key={c.id}>
                  <Link href={c.href} className="flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-sm text-fg transition hover:border-accent">
                    <span className="size-2 rounded-full" style={{ background: categoryColor(c.category) }} />
                    {c.name}
                    <span className="text-xs text-muted tabular-nums">{c.docCount}</span>
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/knowledge/tags" className="flex items-center gap-1 rounded-full border border-dashed border-line px-3 py-1.5 text-sm text-muted transition hover:border-accent hover:text-accent">
                  # 태그로 찾기
                </Link>
              </li>
            </ul>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function Constellation() {
  const pts = [
    [70, 30], [120, 18], [160, 44], [110, 60], [200, 26], [230, 58], [180, 74],
  ];
  return (
    <svg viewBox="0 0 260 90" className="mb-2 h-16 w-full text-accent" aria-hidden>
      {[[0, 3], [1, 3], [2, 3], [2, 4], [4, 5], [2, 6], [5, 6]].map(([a, b], i) => (
        <line key={i} x1={pts[a][0]} y1={pts[a][1]} x2={pts[b][0]} y2={pts[b][1]} stroke="currentColor" strokeOpacity=".3" />
      ))}
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i === 3 ? 5 : 3} fill="currentColor" opacity={i === 3 ? 1 : 0.7} />
      ))}
    </svg>
  );
}
