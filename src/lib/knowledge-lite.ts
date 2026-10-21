import type { LiteNode, NavNode } from "@/components/knowledge/types";
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
    created: n.doc?.created,
    updated: n.doc?.updated,
    isDoc: !!n.doc,
    docCount: n.docCount,
    children: n.children.map(toLite),
  };
}

/** The sidebar tree with only what it draws; every note page ships it, so leaves carry just a name and a link. */
export function toNav(n: KNode): NavNode {
  if (!n.children.length) return { name: n.name, href: n.href };
  return {
    name: n.name,
    href: n.href,
    isDoc: !!n.doc || undefined,
    docCount: n.docCount,
    color: n.depth === 1 ? categoryColor(n.category) : undefined,
    children: n.children.map(toNav),
  };
}
