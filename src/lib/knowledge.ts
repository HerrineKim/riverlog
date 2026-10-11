import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { excerptOf } from "./markdown";

const ROOT = path.join(process.cwd(), "content/knowledge");
export const KNOWLEDGE_BASE = "/knowledge/dictionary";

export type KDoc = {
  title: string;
  concept?: string; // short concept-map label
  source: "til" | "notion" | "mixed" | "other";
  sources: string[]; // original note URLs (GitHub TIL / Notion)
  date?: string;
  tags: string[];
  excerpt: string;
  body: string;
};

export type KNode = {
  id: string; // slug path joined with "/"
  slug: string[];
  href: string;
  name: string; // display label
  category: string; // top-level folder id
  depth: number;
  doc?: KDoc; // a note, or a folder's index note
  children: KNode[];
  docCount: number; // notes in this subtree, including itself
};

// Display order, label and color of the top-level categories
const CATEGORIES: { id: string; label: string; color: string }[] = [
  { id: "Frontend", label: "Frontend", color: "#5eead4" },
  { id: "Backend", label: "Backend", color: "#a78bfa" },
  { id: "Computer-Science", label: "Computer Science", color: "#fbbf24" },
  { id: "Algorithm", label: "Algorithm", color: "#f472b6" },
  { id: "DevOps", label: "DevOps", color: "#86efac" },
  { id: "AI-Data", label: "AI & Data", color: "#f87171" },
  { id: "Tools", label: "Tools", color: "#7dd3fc" },
  { id: "Projects", label: "Projects", color: "#fb923c" },
  { id: "Career", label: "Career", color: "#c4b5fd" },
  { id: "General", label: "General", color: "#cbd5e1" },
];
const CATEGORY_LABELS = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.label]));
const CATEGORY_COLORS = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.color]));
const CATEGORY_ORDER = CATEGORIES.map((c) => c.id);
const FALLBACK_COLORS = ["#67e8f9", "#fda4af", "#bef264", "#fcd34d"];

export function categoryColor(category: string): string {
  if (CATEGORY_COLORS[category]) return CATEGORY_COLORS[category];
  const n = [...category].reduce((a, c) => a + c.charCodeAt(0), 0);
  return FALLBACK_COLORS[n % FALLBACK_COLORS.length];
}

export function slugify(segment: string): string {
  return segment
    .normalize("NFC")
    .replace(/\.md$/, "")
    .replace(/[[\]()&!,+'"?#%:;{}<>|^`=@$*\\/]/g, " ")
    .trim()
    .replace(/[\s_.]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function prettyFolder(name: string, depth: number): string {
  if (depth === 1 && CATEGORY_LABELS[name]) return CATEGORY_LABELS[name];
  return name.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
}

function readDoc(file: string): KDoc {
  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  const source = ["til", "notion", "mixed"].includes(data.source) ? data.source : "other";
  const sources = Array.isArray(data.sources) ? data.sources.map(String) : data.sourceUrl ? [String(data.sourceUrl)] : [];
  return {
    title: String(data.title ?? path.basename(file, ".md")).normalize("NFC"),
    concept: data.concept ? String(data.concept) : undefined,
    source,
    sources,
    date: data.date ? String(data.date) : undefined,
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    excerpt: data.summary ? String(data.summary) : excerptOf(content),
    body: content,
  };
}

const collator = new Intl.Collator("ko", { numeric: true, sensitivity: "base" });

function buildNode(dir: string, slug: string[], name: string, category: string, doc?: KDoc): KNode {
  const depth = slug.length;
  const entries = fs.readdirSync(dir, { withFileTypes: true }).filter((e) => !e.name.startsWith("."));
  const dirNames = new Set(entries.filter((e) => e.isDirectory()).map((e) => e.name.normalize("NFC")));
  const children: KNode[] = [];

  for (const e of entries) {
    const raw = e.name.normalize("NFC");
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      const indexFile = path.join(dir, `${e.name}.md`);
      const indexDoc = fs.existsSync(indexFile) ? readDoc(indexFile) : undefined;
      children.push(buildNode(full, [...slug, slugify(raw)], prettyFolder(raw, depth + 1), category || raw, indexDoc));
    } else if (raw.endsWith(".md") && !dirNames.has(raw.replace(/\.md$/, ""))) {
      const d = readDoc(full);
      const childSlug = [...slug, slugify(raw)];
      children.push({
        id: childSlug.join("/"),
        slug: childSlug,
        href: `${KNOWLEDGE_BASE}/${childSlug.join("/")}`,
        name: d.title,
        category: category || raw.replace(/\.md$/, ""),
        depth: depth + 1,
        doc: d,
        children: [],
        docCount: 1,
      });
    }
  }

  const isFolder = (n: KNode) => n.children.length > 0;
  if (depth === 0) {
    const rank = (n: KNode) => (CATEGORY_ORDER.includes(n.category) ? CATEGORY_ORDER.indexOf(n.category) : 99);
    children.sort((a, b) => rank(a) - rank(b) || collator.compare(a.name, b.name));
  } else {
    children.sort((a, b) => Number(isFolder(b)) - Number(isFolder(a)) || collator.compare(a.name, b.name));
  }

  return {
    id: slug.join("/"),
    slug,
    href: slug.length ? `${KNOWLEDGE_BASE}/${slug.join("/")}` : KNOWLEDGE_BASE,
    name,
    category,
    depth,
    doc,
    children,
    docCount: children.reduce((a, c) => a + c.docCount, doc ? 1 : 0),
  };
}

let cached: { tree: KNode; byId: Map<string, KNode> } | undefined;

function load() {
  if (cached && process.env.NODE_ENV === "production") return cached;
  const tree = buildNode(ROOT, [], "Knowledge", "");
  const byId = new Map<string, KNode>();
  const visit = (n: KNode) => {
    byId.set(n.id, n);
    n.children.forEach(visit);
  };
  visit(tree);
  cached = { tree, byId };
  return cached;
}

export function getKnowledgeTree(): KNode {
  return load().tree;
}

export function getNode(slug: string[]): KNode | undefined {
  const id = slug
    .map((s) => {
      try {
        return decodeURIComponent(s);
      } catch {
        return s;
      }
    })
    .map((s) => s.normalize("NFC"))
    .join("/");
  return load().byId.get(id);
}

export function getAllNodes(): KNode[] {
  return [...load().byId.values()].filter((n) => n.depth > 0);
}

/** Ancestors from the first category down to the node itself. */
export function getTrail(node: KNode): KNode[] {
  const trail: KNode[] = [];
  for (let i = 1; i <= node.slug.length; i++) {
    const n = load().byId.get(node.slug.slice(0, i).join("/"));
    if (n) trail.push(n);
  }
  return trail;
}

export function knowledgeStats() {
  const tree = getKnowledgeTree();
  const all = getAllNodes();
  return {
    notes: tree.docCount,
    categories: tree.children.length,
    fromTil: all.filter((n) => n.doc && n.doc.source !== "notion").length,
    fromNotion: all.filter((n) => n.doc && n.doc.source !== "til").length,
  };
}

export type GraphNode = {
  id: string;
  name: string;
  kind: "category" | "doc";
  category: string;
  color: string;
  href?: string;
  excerpt?: string;
  path: string;
  size: number;
};
export type GraphLink = { source: string; target: string; kind: "member" | "related" | "hub" };

/** Concept-map label: "01 정렬(sorting)" → "정렬", "[Udemy] 빅오 소개" → "빅오 소개". */
export function conceptLabel(title: string): string {
  const cleaned = title
    .replace(/^\s*\[[^\]]*\]\s*/g, "")
    .replace(/^\s*(?:\d+[\s._)-]*)+/, "")
    .replace(/\s*[(（][^)）]*[)）]\s*$/, "")
    .replace(/[_]+/g, " ")
    .trim();
  return cleaned || title;
}

/** Flat map: every note hangs directly off its category hub; notes sharing tags are cross-linked. */
export function getGraphData(): { nodes: GraphNode[]; links: GraphLink[] } {
  const tree = getKnowledgeTree();
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];
  const docs: { id: string; tags: string[] }[] = [];

  for (const cat of tree.children) {
    const color = categoryColor(cat.category);
    nodes.push({
      id: cat.id,
      name: cat.name,
      kind: "category",
      category: cat.category,
      color,
      href: cat.href,
      excerpt: cat.doc?.excerpt,
      path: `${cat.docCount}개 노트`,
      size: 6 + Math.min(6, Math.sqrt(cat.docCount)),
    });
    const visit = (n: KNode, trail: string[]) => {
      if (n.doc && n.depth > 1) {
        nodes.push({
          id: n.id,
          name: n.doc.concept ?? conceptLabel(n.doc.title),
          kind: "doc",
          category: cat.category,
          color,
          href: n.href,
          excerpt: n.doc.excerpt,
          path: [cat.name, ...trail].join(" › "),
          size: 2.2,
        });
        links.push({ source: cat.id, target: n.id, kind: "member" });
        docs.push({ id: n.id, tags: n.doc.tags.map((t) => t.toLowerCase()) });
      }
      const nextTrail = n.depth > 1 && n.children.length ? [...trail, n.name] : trail;
      n.children.forEach((c) => visit(c, nextTrail));
    };
    cat.children.forEach((c) => visit(c, []));
  }

  // Invisible hub-to-hub springs keep the category clusters together as one constellation
  const hubs = tree.children.map((c) => c.id);
  for (let i = 0; i < hubs.length; i++)
    for (let j = i + 1; j < hubs.length; j++) links.push({ source: hubs[i], target: hubs[j], kind: "hub" });

  for (let i = 0; i < docs.length; i++) {
    for (let j = i + 1; j < docs.length; j++) {
      const shared = docs[i].tags.filter((t) => docs[j].tags.includes(t)).length;
      if (shared >= 2) links.push({ source: docs[i].id, target: docs[j].id, kind: "related" });
    }
  }
  return { nodes, links };
}
