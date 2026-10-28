import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";
import DictionaryBrowser from "@/components/knowledge/DictionaryBrowser";
import ViewSwitch from "@/components/knowledge/ViewSwitch";
import { getKnowledgeTree, knowledgeStats } from "@/lib/knowledge";
import { toLite } from "@/lib/knowledge-lite";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "지식 창고 · 계층형 사전",
  description: "River가 정리한 개발·생활 지식 노트를 분야 → 주제 → 노트 순으로, 가나다·ABC 색인으로 찾아보기",
  path: "/knowledge/dictionary",
});

export default function DictionaryPage() {
  const tree = getKnowledgeTree();
  const stats = knowledgeStats();
  return (
    <>
      <main className="mx-auto w-full max-w-5xl px-4 pt-12 pb-24 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="font-display text-5xl text-fg-strong sm:text-6xl">계층형 사전</h1>
            <p className="mt-3 max-w-xl text-muted">
              {stats.categories}개 분야, {stats.notes}개의 노트를 분야 → 주제 → 노트 순으로 정리했어요. 가나다·ABC 색인으로도 찾을 수 있어요.
            </p>
          </div>
          <ViewSwitch active="dictionary" />
        </div>
        <div className="mt-8">
          <DictionaryBrowser tree={toLite(tree)} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
