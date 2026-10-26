import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteFooter from "@/components/SiteFooter";
import { categoryColor, getTag, getTags, getTrail, tagHref, TAGS_BASE } from "@/lib/knowledge";
import { pageMeta } from "@/lib/seo";

// Only the pages generated at build time exist; anything else is a real 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return getTags().map((t) => ({ tag: t.tag }));
}

export async function generateMetadata({ params }: PageProps<"/knowledge/tags/[tag]">): Promise<Metadata> {
  const entry = getTag((await params).tag);
  return entry
    ? pageMeta({ title: `#${entry.tag}`, description: `‘${entry.tag}’ 태그가 붙은 노트 ${entry.notes.length}개`, path: `/knowledge/tags/${entry.tag.toLowerCase()}` })
    : {};
}

export default async function TagPage({ params }: PageProps<"/knowledge/tags/[tag]">) {
  const entry = getTag((await params).tag);
  if (!entry) notFound();

  return (
    <>
      <main className="mx-auto w-full max-w-4xl px-4 pt-12 pb-24 sm:px-6">
        <nav aria-label="경로" className="flex flex-wrap items-center gap-1.5 text-sm text-muted">
          <Link href="/knowledge/dictionary" className="hover:text-accent">
            사전
          </Link>
          <span aria-hidden>/</span>
          <Link href={TAGS_BASE} className="hover:text-accent">
            태그
          </Link>
        </nav>

        <header className="mt-5 border-b border-line pb-7">
          <h1 className="text-4xl font-bold text-fg-strong sm:text-5xl">
            <span className="text-accent">#</span>
            {entry.tag}
          </h1>
          <p className="mt-3 text-muted">노트 {entry.notes.length}개</p>
          {entry.related.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 text-xs font-semibold tracking-[0.16em] text-muted uppercase">함께 쓰인 태그</p>
              <ul className="flex flex-wrap gap-1.5">
                {entry.related.map((r) => (
                  <li key={r.tag}>
                    <Link
                      href={tagHref(r.tag)}
                      className="inline-flex items-baseline gap-1 rounded-full border border-line px-2.5 py-0.5 text-sm text-fg transition hover:border-accent hover:text-accent"
                    >
                      #{r.tag}
                      <span className="text-xs text-muted tabular-nums">{r.count}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </header>

        <ul className="divide-y divide-line">
          {entry.notes.map((n) => {
            const trail = getTrail(n).slice(0, -1);
            const color = categoryColor(n.category);
            return (
              <li key={n.id} className="py-5">
                <p className="flex items-center gap-1.5 text-xs text-muted">
                  <span className="size-1.5 rounded-full" style={{ background: color }} />
                  {trail.map((t) => t.name).join(" › ")}
                </p>
                <Link href={n.href} className="mt-1 block text-lg font-semibold text-fg-strong hover:text-accent">
                  {n.doc?.title ?? n.name}
                </Link>
                {n.doc?.excerpt && <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted">{n.doc.excerpt}</p>}
                {n.doc && n.doc.tags.length > 1 && (
                  <ul className="mt-2 flex flex-wrap gap-1">
                    {n.doc.tags.map((t) =>
                      t.toLowerCase() === entry.tag ? null : (
                        <li key={t}>
                          <Link href={tagHref(t)} className="rounded-full px-2 py-0.5 text-xs text-muted transition hover:bg-accent-soft hover:text-accent">
                            #{t}
                          </Link>
                        </li>
                      ),
                    )}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </main>
      <SiteFooter />
    </>
  );
}
