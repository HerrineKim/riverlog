import type { ReactNode } from "react";
import IntentLink from "@/components/IntentLink";
import SiteFooter from "@/components/SiteFooter";
import EntryLayout from "@/components/knowledge/EntryLayout";
import TreeNav from "@/components/knowledge/TreeNav";
import { getKnowledgeTree, KNOWLEDGE_BASE } from "@/lib/knowledge";
import { toNav } from "@/lib/knowledge-lite";

/**
 * The sidebar tree is the same on every note, so it lives in this layout rather than in each page.
 * Client navigations and prefetches between notes then reuse the layout segment and fetch only the
 * note itself; when the tree was a page prop, it was ~70% of every note's RSC payload.
 */
export default function EntryGroupLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <EntryLayout
        sidebar={
          <>
            <IntentLink href={KNOWLEDGE_BASE} className="mb-4 flex items-center gap-2 text-sm text-muted hover:text-accent pointer-coarse:min-h-11">
              <span aria-hidden>←</span> 사전 전체
            </IntentLink>
            <TreeNav tree={toNav(getKnowledgeTree())} />
          </>
        }
      >
        {children}
      </EntryLayout>
      <SiteFooter />
    </>
  );
}
