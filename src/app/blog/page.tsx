import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import { getAllPosts } from "@/lib/blog";
import { formatDate } from "@/lib/format";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({ title: "Blog", description: "River가 개발하며 겪고 배운 것을 적은 글", path: "/blog" });

export default function BlogIndex() {
  const posts = getAllPosts();
  return (
    <>
      <main className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
        <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">Blog</p>
        <h1 className="mt-3 font-display text-5xl text-fg-strong sm:text-6xl">글</h1>
        <p className="mt-4 text-muted">생각과 회고, 만들면서 배운 것들.</p>

        <ul className="mt-12 divide-y divide-line border-y border-line">
          {posts.map((p) => (
            <li key={p.slug}>
              <Link href={`/blog/${p.slug}`} className="group block py-7">
                <div className="flex items-center gap-3 text-xs text-muted">
                  <time dateTime={p.date}>{formatDate(p.date)}</time>
                  <span aria-hidden>·</span>
                  <span>{p.readingMinutes}분 읽기</span>
                </div>
                <h2 className="mt-2 text-xl font-semibold text-fg-strong transition group-hover:text-accent">
                  {p.title}
                </h2>
                <p className="mt-2 line-clamp-2 text-muted">{p.description}</p>
                {p.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {p.tags.map((t) => (
                      <span key={t} className="rounded-full border border-line px-2.5 py-0.5 text-xs text-muted">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            </li>
          ))}
          {posts.length === 0 && <li className="py-10 text-muted">아직 글이 없어요.</li>}
        </ul>
      </main>
      <SiteFooter />
    </>
  );
}
