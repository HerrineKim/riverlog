import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import Link from "next/link";
import Prose from "@/components/Prose";
import SiteFooter from "@/components/SiteFooter";
import { RiverMark } from "@/components/SiteHeader";
import SocialLinks from "@/components/SocialLinks";
import { getAllPosts } from "@/lib/blog";
import { formatDate } from "@/lib/format";
import { categoryColor, getKnowledgeTree, knowledgeStats } from "@/lib/knowledge";
import { site } from "@/lib/site";

function getAbout() {
  const { data, content } = matter(fs.readFileSync(path.join(process.cwd(), "content/about.md"), "utf8"));
  return { headline: String(data.headline ?? ""), body: content };
}

export default function AboutPage() {
  const about = getAbout();
  const posts = getAllPosts().slice(0, 3);
  const tree = getKnowledgeTree();
  const stats = knowledgeStats();

  return (
    <>
      <main>
        <section className="river-grain relative overflow-hidden border-b border-line/70">
          <RiverMark className="pointer-events-none absolute -right-24 -bottom-28 size-[28rem] text-accent opacity-[0.06]" />
          <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-end">
            <div>
              <p className="text-xs font-semibold tracking-[0.24em] text-accent uppercase">About · {site.author}</p>
              <h1 className="mt-5 font-display text-5xl leading-[1.02] text-fg-strong sm:text-7xl">
                {about.headline}
              </h1>
              <div className="mt-8 max-w-2xl">
                <Prose markdown={about.body} />
              </div>
            </div>
            <div className="lg:pb-2">
              <p className="mb-3 text-xs font-semibold tracking-[0.18em] text-muted uppercase">Contact & Subscribe</p>
              <SocialLinks />
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-14 px-4 py-16 sm:px-6 lg:grid-cols-2">
          <div>
            <div className="flex items-baseline justify-between">
              <h2 className="text-sm font-semibold tracking-[0.18em] text-muted uppercase">최근 글</h2>
              <Link href="/blog" className="text-sm text-muted hover:text-accent">
                전체 →
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
                <p className="text-lg font-semibold text-fg-strong group-hover:text-accent">3D 마인드맵 →</p>
                <p className="mt-1 text-sm text-muted">개념들의 연결을 공간 속에서 탐색</p>
              </Link>
              <Link href="/knowledge/dictionary" className="group rounded-2xl border border-line bg-bg-elev p-5 transition hover:border-accent">
                <div className="mb-5 space-y-1.5 font-mono text-xs text-muted">
                  <p>Frontend</p>
                  <p className="pl-3">└ React</p>
                  <p className="pl-7">└ Hooks</p>
                </div>
                <p className="text-lg font-semibold text-fg-strong group-hover:text-accent">계층형 사전 →</p>
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
