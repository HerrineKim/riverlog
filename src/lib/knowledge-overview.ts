import type { KNode } from "./knowledge";

export type FieldSummary = {
  id: string;
  name: string;
  href: string;
  category: string;
  count: number;
  share: number; // percent of all notes, rounded
  topics: { name: string; href: string; count: number }[]; // sub-topic folders, biggest first
};

/** One row per top-level field, in tree order, with how much of the knowledge base it holds. */
export function fieldSummaries(tree: KNode): FieldSummary[] {
  const total = tree.docCount || 1;
  return tree.children.map((f) => ({
    id: f.id,
    name: f.name,
    href: f.href,
    category: f.category,
    count: f.docCount,
    share: Math.round((f.docCount / total) * 100),
    topics: f.children
      .filter((c) => c.children.length > 0)
      .map((c) => ({ name: c.name, href: c.href, count: c.docCount }))
      .sort((a, b) => b.count - a.count),
  }));
}

export type RecentNote = { title: string; href: string; date: string; category: string; field: string };

/** Notes below the field level, newest `date` first (falling back to when they were added). */
export function recentNotes(tree: KNode, limit: number): RecentNote[] {
  const out: RecentNote[] = [];
  for (const field of tree.children) {
    const visit = (n: KNode) => {
      const date = n.doc?.date ?? n.doc?.created?.slice(0, 10);
      if (n.doc && date) out.push({ title: n.doc.title, href: n.href, date, category: field.category, field: field.name });
      n.children.forEach(visit);
    };
    field.children.forEach(visit);
  }
  return out.sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title, "ko")).slice(0, limit);
}
