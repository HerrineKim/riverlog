import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";
import TagCloud from "@/components/knowledge/TagCloud";
import ViewSwitch from "@/components/knowledge/ViewSwitch";
import { getTags, tagHref } from "@/lib/knowledge";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({ title: "지식 창고 · 태그", description: "지식 창고의 노트를 태그로 찾아보기", path: "/knowledge/tags" });

export default function TagsPage() {
  const tags = getTags();
  return (
    <>
      <main className="mx-auto w-full max-w-5xl px-4 pt-12 pb-24 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="font-display text-5xl text-fg-strong sm:text-6xl">태그</h1>
            <p className="mt-3 max-w-xl text-muted">
              {tags.length}개의 태그로 분야에 상관없이 노트를 찾아보세요. 태그를 누르면 그 태그가 붙은 노트가 나오고, 함께 자주 쓰인 태그도 보여요.
            </p>
          </div>
          <ViewSwitch active="tags" />
        </div>
        <div className="mt-8">
          <TagCloud tags={tags.map((t) => ({ tag: t.tag, count: t.notes.length, href: tagHref(t.tag) }))} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
