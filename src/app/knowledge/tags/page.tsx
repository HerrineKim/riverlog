import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";
import TagExplorer from "@/components/knowledge/TagExplorer";
import ViewSwitch from "@/components/knowledge/ViewSwitch";
import { getTags } from "@/lib/knowledge";
import { tagGroups, tagPanel } from "@/lib/knowledge-tags";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({ title: "지식 창고 · 태그", description: "지식 창고의 노트를 태그로 찾아보기", path: "/knowledge/tags" });

export default function TagsPage() {
  const tags = getTags();
  const groups = tagGroups(tags);
  // Only tags you can pick get a preview; the rare tail links straight to its tag page
  const pickable = new Set([...groups.top, ...groups.mid].map((t) => t.tag));
  const panels = Object.fromEntries(tags.filter((t) => pickable.has(t.tag)).map((t) => [t.tag, tagPanel(t)]));
  return (
    <>
      <main className="mx-auto w-full max-w-5xl px-4 pt-12 pb-24 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-fg-strong sm:text-5xl">태그</h1>
            <p className="mt-3 max-w-xl text-muted">
              분야와 상관없이 노트를 묶는 {tags.length}개 태그. 자주 쓰는 순서로 보여 주고, 한두 번만 쓴 태그는 접어 뒀어요.
            </p>
          </div>
          <ViewSwitch active="tags" />
        </div>
        <div className="mt-8">
          <TagExplorer groups={groups} panels={panels} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
