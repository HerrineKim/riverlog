import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Comments from "@/components/Comments";
import JsonLd from "@/components/JsonLd";
import Prose from "@/components/Prose";
import SiteFooter from "@/components/SiteFooter";
import Toc, { MobileToc } from "@/components/Toc";
import EntryLayout from "@/components/knowledge/EntryLayout";
import TreeNav from "@/components/knowledge/TreeNav";
import { formatDate } from "@/lib/format";
import { categoryColor, getAllNodes, getKnowledgeTree, getNode, getTrail, KNOWLEDGE_BASE, tagHref, type KNode } from "@/lib/knowledge";
import { toNav } from "@/lib/knowledge-lite";
import { extractToc, splitLeadingQuote } from "@/lib/markdown";
import { articleLd, pageMeta } from "@/lib/seo";

// Only the pages generated at build time exist; anything else is a real 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllNodes().map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: PageProps<"/knowledge/dictionary/[...slug]">): Promise<Metadata> {
  const node = getNode((await params).slug);
  if (!node) return {};
  return pageMeta(noteSeo(node));
}

const noteSeo = (node: KNode) => ({
  title: node.doc?.title ?? node.name,
  description: node.doc?.excerpt,
  path: node.href,
  article: { published: node.doc?.date ?? node.doc?.created, modified: node.doc?.updated, tags: node.doc?.tags },
});

function sourceName(url: string) {
  if (url.includes("notion")) return "Notion 원문";
  if (url.includes("github.com")) return "GitHub 원문";
  return "원문";
}

export default async function KnowledgeEntry({ params }: PageProps<"/knowledge/dictionary/[...slug]">) {
  const node = getNode((await params).slug);
  if (!node) notFound();
  const tree = getKnowledgeTree();
  const trail = getTrail(node);
  const doc = node.doc;
  const toc = doc ? extractToc(doc.body) : [];
  const { lead, rest } = splitLeadingQuote(doc?.body ?? "");
  const color = categoryColor(node.category);
  const siblings = trail.length > 1 ? trail[trail.length - 2].children : tree.children;
  const idx = siblings.findIndex((s) => s.id === node.id);
  const prev = idx > 0 ? siblings[idx - 1] : undefined;
  const next = idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : undefined;

  return (
    <>
      <EntryLayout
        sidebar={
          <>
            <Link href={KNOWLEDGE_BASE} className="mb-4 flex items-center gap-2 text-sm text-muted hover:text-accent pointer-coarse:min-h-11">
              <span aria-hidden>←</span> 사전 전체
            </Link>
            <TreeNav tree={toNav(tree)} currentHref={node.href} />
          </>
        }
        toc={<Toc items={toc} />}
      >
          {doc && <JsonLd data={articleLd(noteSeo(node))} />}
          <nav aria-label="경로" className="text-sm text-muted">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link href={KNOWLEDGE_BASE} className="hover:text-accent pointer-coarse:inline-flex pointer-coarse:min-h-11 pointer-coarse:items-center">
                  사전
                </Link>
              </li>
              {trail.slice(0, -1).map((t) => (
                <li key={t.id} className="flex items-center gap-1.5">
                  <span aria-hidden>/</span>
                  <Link href={t.href} className="hover:text-accent pointer-coarse:inline-flex pointer-coarse:min-h-11 pointer-coarse:items-center">
                    {t.name}
                  </Link>
                </li>
              ))}
            </ol>
          </nav>

          <header className="mt-5 border-b border-line pb-7">
            <div className="flex items-center gap-2 text-xs font-semibold text-fg">
              <span className="size-2 rounded-full" style={{ background: color, boxShadow: `0 0 10px ${color}` }} />
              {trail[0]?.name}
            </div>
            <h1 className="mt-3 text-3xl leading-tight font-bold text-balance text-fg-strong sm:text-4xl">
              {doc?.title ?? node.name}
            </h1>
            {doc && (
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted">
                {doc.date && doc.date.slice(0, 10) !== doc.created?.slice(0, 10) && (
                  <span className="rounded-full border border-line px-2.5 py-1">작성 {formatDate(doc.date)}</span>
                )}
                {doc.created && (
                  <span className="rounded-full border border-line px-2.5 py-1">
                    추가 <time dateTime={doc.created}>{formatDate(doc.created)}</time>
                  </span>
                )}
                {doc.updated && doc.updated.slice(0, 10) !== doc.created?.slice(0, 10) && (
                  <span className="rounded-full border border-line px-2.5 py-1">
                    수정 <time dateTime={doc.updated}>{formatDate(doc.updated)}</time>
                  </span>
                )}
              </div>
            )}
          </header>

          {doc && (
            <article className="mt-8">
              <MobileToc items={toc} className="mb-8 xl:hidden" />
              {lead && (
                <details className="group mb-8 rounded-xl border border-line bg-bg-elev text-sm">
                  <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 font-medium text-fg [&::-webkit-details-marker]:hidden">
                    출처와 참고
                    <svg viewBox="0 0 16 16" className="ml-auto size-3 text-muted transition group-open:rotate-180" fill="currentColor" aria-hidden>
                      <path d="M3.5 6 8 10.5 12.5 6z" />
                    </svg>
                  </summary>
                  <Prose markdown={lead} className="px-4 pb-4 text-sm text-muted prose-p:my-2" />
                </details>
              )}
              <Prose markdown={rest} />
              {doc.tags.length > 0 && (
                <ul aria-label="태그" className="mt-12 flex flex-wrap gap-2 text-xs">
                  {doc.tags.map((t) => (
                    <li key={t}>
                      <Link
                        href={tagHref(t)}
                        className="rounded-full bg-accent-soft px-2.5 py-1 text-accent transition pointer-coarse:inline-flex pointer-coarse:min-h-11 pointer-coarse:items-center hover:bg-accent hover:text-accent-ink"
                      >
                        #{t}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              {doc.sources.length > 0 && (
                <div className="mt-14 rounded-xl border border-line bg-bg-elev p-4 text-sm text-muted">
                  <p className="font-medium text-fg">원본 기록</p>
                  <ul className="mt-2 space-y-1">
                    {doc.sources.map((s) => (
                      <li key={s} className="truncate">
                        <a href={s} className="hover:text-accent pointer-coarse:inline-flex pointer-coarse:min-h-11 pointer-coarse:items-center" target="_blank" rel="noreferrer">
                          {sourceName(s)} <span aria-hidden>↗</span>
                          <span className="sr-only">(새 창)</span> <span className="text-muted">{decodeSafe(s).replace(/^https?:\/\//, "")}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </article>
          )}

          {node.children.length > 0 && <ChildList node={node} hasDoc={!!doc} />}

          {doc && <Comments term={`knowledge/${node.id}`} />}

          {(prev || next) && (
            <nav aria-label="이전·다음 항목" className="mt-16 grid gap-3 sm:grid-cols-2">
              {prev ? <Pager node={prev} dir="prev" /> : <span />}
              {next && <Pager node={next} dir="next" />}
            </nav>
          )}
      </EntryLayout>
      <SiteFooter />
    </>
  );
}

function decodeSafe(s: string) {
  try {
    return decodeURI(s);
  } catch {
    return s;
  }
}

function ChildList({ node, hasDoc }: { node: KNode; hasDoc: boolean }) {
  return (
    <section className={hasDoc ? "mt-16" : "mt-8"}>
      <h2 className="text-sm font-semibold text-muted">
        이 주제의 항목 · {node.docCount - (hasDoc ? 1 : 0)}
      </h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {node.children.map((c) => (
          <li key={c.id}>
            <Link
              href={c.href}
              className="group flex h-full flex-col rounded-xl border border-line bg-bg-elev p-4 transition hover:-translate-y-0.5 hover:border-accent"
            >
              <span className="flex items-center gap-2 font-medium text-fg-strong group-hover:text-accent">
                {c.children.length > 0 && (
                  <svg viewBox="0 0 24 24" className="size-4 shrink-0 text-muted" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  </svg>
                )}
                {c.children.length ? c.name : (c.doc?.title ?? c.name)}
                {c.children.length > 0 && <span className="ml-auto text-xs text-muted tabular-nums">{c.docCount}</span>}
              </span>
              {c.doc?.excerpt && <span className="mt-1.5 line-clamp-2 text-sm text-muted">{c.doc.excerpt}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Pager({ node, dir }: { node: KNode; dir: "prev" | "next" }) {
  return (
    <Link
      href={node.href}
      className={`rounded-xl border border-line p-4 transition hover:border-accent ${dir === "next" ? "text-right sm:col-start-2" : ""}`}
    >
      <span className="text-xs text-muted">
        {dir === "prev" ? <span aria-hidden>← </span> : null}
        {dir === "prev" ? "이전" : "다음"}
        {dir === "next" ? <span aria-hidden> →</span> : null}
      </span>
      <span className="mt-1 block truncate font-medium text-fg-strong">{node.doc?.title ?? node.name}</span>
    </Link>
  );
}
