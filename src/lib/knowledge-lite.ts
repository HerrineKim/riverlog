import type { LiteNode } from "@/components/knowledge/types";
import { categoryColor, type KNode } from "./knowledge";

export function toLite(n: KNode): LiteNode {
  return {
    id: n.id,
    name: n.children.length ? n.name : (n.doc?.title ?? n.name),
    href: n.href,
    category: n.category,
    color: categoryColor(n.category),
    depth: n.depth,
    excerpt: n.doc?.excerpt,
    tags: n.doc?.tags ?? [],
    isDoc: !!n.doc,
    docCount: n.docCount,
    children: n.children.map(toLite),
  };
}
