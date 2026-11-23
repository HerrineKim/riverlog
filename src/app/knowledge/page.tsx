import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import ViewSwitch from "@/components/knowledge/ViewSwitch";
import { categoryColor, getKnowledgeTree, getTags, knowledgeStats, tagHref } from "@/lib/knowledge";
import { fieldSummaries, recentNotes, type FieldSummary } from "@/lib/knowledge-overview";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "지식 창고",
  description: "River가 정리한 개발·생활 지식 노트. 분야에서 시작해 주제, 노트 순으로 찾아보기",
  path: "/knowledge",
});

const DICTIONARY = "/knowledge/dictionary";

export default function KnowledgeOverviewPage() {
  const tree = getKnowledgeTree();
  const stats = knowledgeStats();
  const fields = fieldSummaries(tree);
  const [biggest, ...rest] = [...fields].sort((a, b) => b.count - a.count);
  const recent = recentNotes(tree, 7);
  const tags = getTags().slice(0, 10);
  const excerptOf = (id: string) => tree.children.find((c) => c.id === id)?.doc?.excerpt;

  return (
    <>
      <main className="mx-auto w-full max-w-5xl px-4 pt-12 pb-24 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-fg-strong sm:text-5xl">지식 창고</h1>
            <p className="mt-3 max-w-xl text-muted">공부하고 일하며 정리한 노트. 분야에서 시작해 주제, 노트 순으로 내려가요.</p>
          </div>
          <ViewSwitch active="overview" />
        </div>

        <Form action={DICTIONARY} className="mt-8">
          <label htmlFor="kb-search" className="text-sm font-semibold text-muted">
            노트 검색
          </label>
          <div className="mt-2 flex gap-2">
            <input
              id="kb-search"
              name="q"
              type="search"
              enterKeyHint="search"
              autoComplete="off"
              placeholder={`${stats.notes}개 노트에서 용어, 주제, #태그로 찾기`}
              className="min-h-12 w-full min-w-0 rounded-lg border border-control bg-bg-elev px-4 text-fg-strong placeholder:text-muted focus:border-accent"
            />
            <button type="submit" className="min-h-12 shrink-0 rounded-lg bg-accent px-5 font-medium text-accent-ink transition hover:opacity-90">
              검색
            </button>
          </div>
        </Form>

        <section aria-labelledby="fields-h" className="mt-14">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="fields-h" className="text-sm font-semibold text-muted">
              {stats.categories}개 분야 · {stats.notes}개 노트
            </h2>
            <span className="text-sm text-muted">막대 길이는 노트 수</span>
          </div>
          <div
            role="img"
            aria-label={`분야별 노트 수: ${fields.map((f) => `${f.name} ${f.count}`).join(", ")}`}
            className="mt-4 flex h-3.5 gap-[3px] overflow-hidden rounded-full"
          >
            {fields.map((f, i) => (
              <span
                key={f.id}
                className="river-bar block h-full"
                style={{ flex: f.count, background: categoryColor(f.category), animationDelay: `${i * 70}ms` }}
              />
            ))}
          </div>

          <FieldTile field={biggest} wide />
          <ul className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-3">
            {rest.map((f) => (
              <li key={f.id}>
                <FieldTile field={f} fallback={excerptOf(f.id)} />
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-14 flex flex-wrap gap-12">
          <section aria-labelledby="recent-h" className="min-w-0 flex-[999_1_32rem]">
            <div className="flex items-baseline justify-between">
              <h2 id="recent-h" className="text-sm font-semibold text-muted">
                최근 정리한 노트
              </h2>
              <Link href={`${DICTIONARY}?view=date`} className="py-2.5 text-sm text-accent hover:underline">
                전체 보기
              </Link>
            </div>
            <ol className="mt-1 border-t border-line">
              {recent.map((n) => (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    className="grid grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-x-4 gap-y-1 border-b border-line px-2 py-3.5 transition hover:bg-bg-elev sm:grid-cols-[3.5rem_minmax(0,1fr)_auto]"
                  >
                    <time dateTime={n.date} className="text-sm text-muted tabular-nums">
                      {n.date.slice(5).replace("-", ".")}
                    </time>
                    <span className="font-medium text-fg-strong">{n.title}</span>
                    <span className="col-start-2 flex items-center gap-1.5 text-xs text-muted sm:col-start-3">
                      <span aria-hidden className="size-2 rounded-full" style={{ background: categoryColor(n.category) }} />
                      {n.field}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>

          <aside aria-labelledby="tags-h" className="min-w-0 flex-[1_1_16rem]">
            <h2 id="tags-h" className="text-sm font-semibold text-muted">
              자주 쓰는 태그
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {tags.map((t) => (
                <li key={t.tag}>
                  <Link
                    href={tagHref(t.tag)}
                    className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-line bg-bg-elev px-3.5 text-sm text-fg transition hover:border-accent hover:text-accent"
                  >
                    #{t.tag}
                    <span className="text-xs text-muted tabular-nums">{t.notes.length}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/knowledge/tags" className="mt-3 inline-flex min-h-11 items-center text-sm text-accent hover:underline">
              태그 모두 보기
            </Link>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

/** The biggest field gets a full row with every sub-topic; the rest show their top three. */
function FieldTile({ field, wide = false, fallback }: { field: FieldSummary; wide?: boolean; fallback?: string }) {
  const shown = wide ? field.topics : field.topics.slice(0, 3);
  const more = field.topics.length - shown.length;
  const topics = shown.map((t) => (wide ? `${t.name} ${t.count}` : t.name)).join(" · ") + (more > 0 ? ` 외 ${more}개 주제` : "");
  return (
    <Link
      href={field.href}
      className={`flex h-full rounded-2xl border border-line bg-bg-elev p-5 transition hover:border-control ${
        wide ? "mt-6 flex-wrap items-center justify-between gap-x-8 gap-y-3 sm:p-6" : "flex-col gap-3"
      }`}
    >
      <div className={wide ? "min-w-0 flex-[1_1_20rem]" : "flex items-center justify-between gap-3"}>
        <span className={`flex items-center gap-2.5 font-semibold text-fg-strong ${wide ? "text-xl" : "text-base"}`}>
          <span aria-hidden className="size-2.5 shrink-0 rounded-full" style={{ background: categoryColor(field.category) }} />
          {field.name}
          {wide && <span className="text-sm font-normal text-muted">전체의 {field.share}%</span>}
        </span>
        {wide ? (
          <p className="mt-2 text-sm leading-relaxed text-muted">{topics}</p>
        ) : (
          <span className="font-display text-3xl leading-none text-fg-strong tabular-nums">{field.count}</span>
        )}
      </div>
      {wide ? (
        <span className="font-display text-6xl leading-none text-fg-strong tabular-nums">{field.count}</span>
      ) : (
        <p className="text-sm leading-relaxed text-muted line-clamp-2">{topics || fallback}</p>
      )}
    </Link>
  );
}
