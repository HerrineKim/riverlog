import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Comments from "@/components/Comments";
import Prose from "@/components/Prose";
import SiteFooter from "@/components/SiteFooter";
import Toc, { MobileToc } from "@/components/Toc";
import { getAllPosts, getPost } from "@/lib/blog";
import { formatDate } from "@/lib/format";
import { extractToc } from "@/lib/markdown";

// Only the pages generated at build time exist; anything else is a real 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const post = getPost((await params).slug);
  return post ? { title: post.title, description: post.description } : {};
}

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  const toc = extractToc(post.body);

  return (
    <>
      <main>
        <div className="river-grain">
          <header className="mx-auto max-w-3xl px-4 pt-14 pb-10 sm:px-6 sm:pt-20">
            <Link href="/blog" className="text-sm text-muted hover:text-accent">
              <span aria-hidden>←</span> 모든 글
            </Link>
            <h1 className="mt-6 text-3xl leading-tight font-bold text-balance text-fg-strong sm:text-[2.6rem]">
              {post.title}
            </h1>
            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-muted">
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              <span aria-hidden>·</span>
              <span>{post.readingMinutes}분 읽기</span>
              {post.tags.map((t) => (
                <span key={t} className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs text-accent">
                  #{t}
                </span>
              ))}
            </div>
          </header>
        </div>
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 pb-24 sm:px-6 lg:grid-cols-[minmax(0,1fr)_14rem]">
          <article className="mx-auto w-full max-w-3xl min-w-0 lg:mr-0">
            <MobileToc items={toc} className="mb-8 lg:hidden" />
            <Prose markdown={post.body} />
            <Comments term={`blog/${post.slug}`} />
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
