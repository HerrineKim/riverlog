import type { Metadata } from "next";
import MindMap from "@/components/knowledge/MindMap";
import ViewSwitch from "@/components/knowledge/ViewSwitch";
import { placeGraph } from "@/lib/graph-layout";
import { packGraph } from "@/lib/graph-wire";
import { categoryColor, getGraphData, getKnowledgeTree, knowledgeStats } from "@/lib/knowledge";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "지식 창고 · 3D 마인드맵",
  description: "River가 정리한 개발·생활 지식 노트를 분야별 3D 마인드맵으로 둘러보기",
  path: "/knowledge",
});

export default function KnowledgeMapPage() {
  const data = packGraph(placeGraph(getGraphData()));
  const stats = knowledgeStats();
  const categories = getKnowledgeTree().children.map((c) => ({
    id: c.id,
    name: c.name,
    color: categoryColor(c.category),
    count: c.docCount,
  }));

  return (
    <main className="flex h-[calc(100dvh-3.5rem)] flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line/70 px-4 py-3 sm:px-6">
        <div className="flex items-baseline gap-3">
          <h1 className="font-display text-3xl text-fg-strong">지식 창고</h1>
          <p className="text-sm text-muted">
            {stats.categories}개 분야 · {stats.notes}개 노트
          </p>
        </div>
        <ViewSwitch active="map" />
      </div>
      <div className="relative min-h-0 flex-1 bg-bg-sunken">
        <MindMap data={data} categories={categories} />
      </div>
    </main>
  );
}
