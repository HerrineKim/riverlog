import { categoryColor, getKnowledgeTree, type KNode } from "./knowledge";
import { referencedIds } from "./knowledge-refs";

export type GraphNode = {
  id: string;
  name: string;
  kind: "category" | "doc";
  category: string;
  color: string;
  href?: string;
  excerpt?: string;
  tags: string[];
  path: string;
  size: number;
};
/** member: hub → note · hub: invisible hub springs · reference: one note links to another · related: notes share 2+ tags */
export type GraphLink = { source: string; target: string; kind: "member" | "related" | "hub" | "reference" };

/** A note's id with what cross-linking needs: lowercased tags and the note ids its body links to. */
type DocRefs = { id: string; tags: string[]; refs: string[] };

/** Concept-map label: "01 정렬(sorting)" → "정렬", "[Udemy] 빅오 소개" → "빅오 소개". */
function conceptLabel(title: string): string {
  const cleaned = title
    .replace(/^\s*\[[^\]]*\]\s*/g, "")
    .replace(/^\s*(?:\d+[\s._)-]*)+/, "")
    .replace(/\s*[(（][^)）]*[)）]\s*$/, "")
    .replace(/[_]+/g, " ")
    .trim();
  return cleaned || title;
}

function categoryNode(cat: KNode): GraphNode {
  return {
    id: cat.id,
    name: cat.name,
    kind: "category",
    category: cat.category,
    color: categoryColor(cat.category),
    href: cat.href,
    excerpt: cat.doc?.excerpt,
    tags: cat.doc?.tags ?? [],
    path: `${cat.docCount}개 노트`,
    size: 6 + Math.min(6, Math.sqrt(cat.docCount)),
  };
}

function docNode(n: KNode & { doc: NonNullable<KNode["doc"]> }, cat: KNode, trail: string[]): GraphNode {
  return {
    id: n.id,
    name: n.doc.concept ?? conceptLabel(n.doc.title),
    kind: "doc",
    category: cat.category,
    color: categoryColor(cat.category),
    href: n.href,
    excerpt: n.doc.excerpt,
    tags: n.doc.tags,
    path: [cat.name, ...trail].join(" › "),
    size: 2.2,
  };
}

/** Each category hub, then every note below it hung directly off the hub by a member link. */
function collectNodes(tree: KNode): { nodes: GraphNode[]; members: GraphLink[]; docs: DocRefs[] } {
  const nodes: GraphNode[] = [];
  const members: GraphLink[] = [];
  const docs: DocRefs[] = [];

  for (const cat of tree.children) {
    nodes.push(categoryNode(cat));
    const visit = (n: KNode, trail: string[]) => {
      if (n.doc && n.depth > 1) {
        nodes.push(docNode({ ...n, doc: n.doc }, cat, trail));
        members.push({ source: cat.id, target: n.id, kind: "member" });
        docs.push({ id: n.id, tags: n.doc.tags.map((t) => t.toLowerCase()), refs: referencedIds(n.doc.body) });
      }
      const nextTrail = n.depth > 1 && n.children.length ? [...trail, n.name] : trail;
      n.children.forEach((c) => visit(c, nextTrail));
    };
    cat.children.forEach((c) => visit(c, []));
  }
  return { nodes, members, docs };
}

/** Invisible hub-to-hub springs keep the category clusters together as one constellation. */
function hubLinks(hubs: string[]): GraphLink[] {
  const links: GraphLink[] = [];
  for (let i = 0; i < hubs.length; i++)
    for (let j = i + 1; j < hubs.length; j++) links.push({ source: hubs[i], target: hubs[j], kind: "hub" });
  return links;
}

const pairKey = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`);

/** A folder overview listing its own notes repeats the tree, not a conceptual link. */
const isAncestry = (a: string, b: string) => b.startsWith(`${a}/`) || a.startsWith(`${b}/`);

/** Explicit links between notes win over tag similarity; each pair is linked at most once. */
function crossLinks(docs: DocRefs[]): GraphLink[] {
  const links: GraphLink[] = [];
  const docIds = new Set(docs.map((d) => d.id));
  const linked = new Set<string>();

  for (const d of docs)
    for (const ref of d.refs) {
      if (ref === d.id || !docIds.has(ref) || linked.has(pairKey(d.id, ref)) || isAncestry(d.id, ref)) continue;
      linked.add(pairKey(d.id, ref));
      links.push({ source: d.id, target: ref, kind: "reference" });
    }

  for (let i = 0; i < docs.length; i++)
    for (let j = i + 1; j < docs.length; j++) {
      if (linked.has(pairKey(docs[i].id, docs[j].id))) continue;
      const shared = docs[i].tags.filter((t) => docs[j].tags.includes(t)).length;
      if (shared >= 2) links.push({ source: docs[i].id, target: docs[j].id, kind: "related" });
    }
  return links;
}

/** Flat map: every note hangs directly off its category hub; notes that link to each other or share tags are cross-linked. */
export function getGraphData(): { nodes: GraphNode[]; links: GraphLink[] } {
  const tree = getKnowledgeTree();
  const { nodes, members, docs } = collectNodes(tree);
  const links = [...members, ...hubLinks(tree.children.map((c) => c.id)), ...crossLinks(docs)];
  return { nodes, links };
}
