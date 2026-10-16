import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { excerptOf } from "./markdown";
import { cachedRead, isHiddenName, isPublished, KNOWLEDGE_BASE, resolveNote, safeDecode, slugify, stringList } from "./vault";

export { KNOWLEDGE_BASE };

const ROOT = path.join(process.cwd(), "content/knowledge");
const DATES_FILE = path.join(process.cwd(), "content/.knowledge-dates.json"); // written by scripts/knowledge-dates.mjs

type NoteDates = { created: string; updated: string };

/** When a note was first added to the knowledge base and last changed, keyed by path under content/knowledge. */
const noteDates = cachedRead((): Record<string, NoteDates> => {
  try {
    return JSON.parse(fs.readFileSync(DATES_FILE, "utf8"));
  } catch {
    return {};
  }
});

export type KDoc = {
  title: string;
  concept?: string; // short concept-map label
  source: "til" | "notion" | "mixed" | "other";
  sources: string[]; // original note URLs (GitHub TIL / Notion)
  date?: string;
  created?: string; // first added to the knowledge base (ISO)
  updated?: string; // last changed (ISO)
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
  { id: "Career", label: "Career", color: "#c4b5fd" },
  { id: "Life-and-Learning", label: "Life & Learning", color: "#cbd5e1" },
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

function prettyFolder(name: string, depth: number): string {
  if (depth === 1 && CATEGORY_LABELS[name]) return CATEGORY_LABELS[name];
  return name.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Rewrites note-to-note links written as file paths into dictionary URLs.
 * Accepts paths relative to the note (`Blender/basics.md`) or to content/knowledge (`Backend/Django/admin`).
 */
function resolveRelativeLinks(markdown: string, file: string): string {
  const fromDir = path.posix.dirname(path.relative(ROOT, file).split(path.sep).join("/"));
  const hrefOf = (rel: string) => `${KNOWLEDGE_BASE}/${rel.split("/").map(slugify).join("/")}`;
  // Only published notes resolve, so a link never points at a draft's 404 or leaks its file name
  const noteHref = (rel: string) => {
    // resolveNote also matches bare file names; a file-path link must name the exact note
    const href = resolveNote(rel)?.href;
    return href === hrefOf(rel) ? href : undefined;
  };
  const isFolder = (rel: string) => fs.existsSync(path.join(ROOT, rel)) && fs.statSync(path.join(ROOT, rel)).isDirectory();
  const exists = (rel: string) => !rel.startsWith("..") && (!!noteHref(rel) || isFolder(rel));
  return markdown.replace(/\]\((?!https?:|\/|#|mailto:)([^)\s#{}]+?)(#[^)\s]*)?\)/g, (m, target: string, hash = "") => {
    const bare = safeDecode(target).replace(/\.md$/, "").replace(/\/$/, "");
    const candidates = [path.posix.normalize(path.posix.join(fromDir === "." ? "" : fromDir, bare)), path.posix.normalize(bare)];
    const hit = candidates.find(exists);
    if (!hit) return m;
    return `](${noteHref(hit) ?? hrefOf(hit)}${hash})`;
  });
}

/** Undefined when the note has `publish: false`. */
function readDoc(file: string): KDoc | undefined {
  const parsed = matter(fs.readFileSync(file, "utf8"));
  const data = parsed.data;
  if (!isPublished(data)) return undefined;
  const content = resolveRelativeLinks(parsed.content, file);
  const source = ["til", "notion", "mixed"].includes(data.source) ? data.source : "other";
  const added = noteDates()[path.relative(ROOT, file).split(path.sep).join("/").normalize("NFC")];
  const sources = (Array.isArray(data.sources) ? data.sources.map(String) : data.sourceUrl ? [String(data.sourceUrl)] : []).filter(
    (u) => /^https?:\/\//i.test(u),
  );
  return {
    title: String(data.title ?? path.basename(file, ".md")).normalize("NFC"),
    concept: data.concept ? String(data.concept) : undefined,
    source,
    sources,
    date: data.date ? String(data.date) : undefined,
    created: added?.created,
    updated: added?.updated,
    tags: stringList(data.tags),
    excerpt: data.summary ? String(data.summary) : excerptOf(content),
    body: content,
  };
}

const collator = new Intl.Collator("ko", { numeric: true, sensitivity: "base" });

function buildNode(dir: string, slug: string[], name: string, category: string, doc?: KDoc): KNode {
  const depth = slug.length;
  const entries = fs.readdirSync(dir, { withFileTypes: true }).filter((e) => !isHiddenName(e.name));
  const dirNames = new Set(entries.filter((e) => e.isDirectory()).map((e) => e.name.normalize("NFC")));
  const children: KNode[] = [];

  for (const e of entries) {
    const raw = e.name.normalize("NFC");
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      const indexFile = path.join(dir, `${e.name}.md`);
      const indexDoc = fs.existsSync(indexFile) ? readDoc(indexFile) : undefined;
      const node = buildNode(full, [...slug, slugify(raw)], prettyFolder(raw, depth + 1), category || raw, indexDoc);
      if (node.docCount > 0) children.push(node);
    } else if (raw.endsWith(".md") && !dirNames.has(raw.replace(/\.md$/, ""))) {
      const d = readDoc(full);
      if (!d) continue;
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

const load = cachedRead(() => {
  const tree = buildNode(ROOT, [], "Knowledge", "");
  const byId = new Map<string, KNode>();
  const visit = (n: KNode) => {
    byId.set(n.id, n);
    n.children.forEach(visit);
  };
  visit(tree);
  return { tree, byId };
});

export function getKnowledgeTree(): KNode {
  return load().tree;
}

export function getNode(slug: string[]): KNode | undefined {
  return load().byId.get(slug.map((s) => safeDecode(s).normalize("NFC")).join("/"));
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

export const TAGS_BASE = "/knowledge/tags";
export const tagHref = (tag: string) => `${TAGS_BASE}/${encodeURIComponent(tag.toLowerCase())}`;

export type TagEntry = { tag: string; notes: KNode[]; related: { tag: string; count: number }[] };

/** Every tag (lowercased) with its notes in tree order and the tags that most often appear alongside it. */
let tagsCache: { tree: KNode; tags: TagEntry[] } | undefined;

export function getTags(): TagEntry[] {
  const tree = getKnowledgeTree();
  if (tagsCache?.tree !== tree) tagsCache = { tree, tags: buildTags() };
  return tagsCache.tags;
}

function buildTags(): TagEntry[] {
  const byTag = new Map<string, KNode[]>();
  for (const n of getAllNodes())
    for (const t of new Set(n.doc?.tags.map((t) => t.toLowerCase()) ?? [])) {
      if (!byTag.has(t)) byTag.set(t, []);
      byTag.get(t)!.push(n);
    }

  return [...byTag.entries()]
    .map(([tag, notes]) => {
      const co = new Map<string, number>();
      for (const n of notes)
        for (const t of new Set(n.doc!.tags.map((t) => t.toLowerCase()))) if (t !== tag) co.set(t, (co.get(t) ?? 0) + 1);
      const related = [...co.entries()]
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
        .slice(0, 12);
      return { tag, notes, related };
    })
    .sort((a, b) => b.notes.length - a.notes.length || a.tag.localeCompare(b.tag));
}

export function getTag(param: string): TagEntry | undefined {
  const tag = safeDecode(param).toLowerCase();
  return getTags().find((t) => t.tag === tag);
}

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

/** Ids of knowledge notes a note body links to, via dictionary URLs or [[wikilinks]]. */
function referencedIds(body: string): string[] {
  const prefix = `${KNOWLEDGE_BASE}/`;
  const hrefs: string[] = [];
  for (const m of body.matchAll(/\]\((\/knowledge\/dictionary\/[^)\s#]+)/g)) hrefs.push(m[1]);
  for (const m of body.matchAll(/!?\[\[([^\]|#\n]+)(?:#[^\]|\n]*)?(?:\\?\|[^\]\n]+)?\]\]/g)) {
    const href = resolveNote(m[1].replace(/\\$/, "").trim())?.href;
    if (href) hrefs.push(href);
  }
  return hrefs.filter((h) => h.startsWith(prefix)).map((h) => decodeURIComponent(h.slice(prefix.length)));
}

/** Flat map: every note hangs directly off its category hub; notes that link to each other or share tags are cross-linked. */
export function getGraphData(): { nodes: GraphNode[]; links: GraphLink[] } {
  const tree = getKnowledgeTree();
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];
  const docs: { id: string; tags: string[]; refs: string[] }[] = [];

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
      tags: cat.doc?.tags ?? [],
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
          tags: n.doc.tags,
          path: [cat.name, ...trail].join(" › "),
          size: 2.2,
        });
        links.push({ source: cat.id, target: n.id, kind: "member" });
        docs.push({ id: n.id, tags: n.doc.tags.map((t) => t.toLowerCase()), refs: referencedIds(n.doc.body) });
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

  // Explicit links between notes win over tag similarity; each pair is linked at most once
  const docIds = new Set(docs.map((d) => d.id));
  const linked = new Set<string>();
  const pair = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`);
  for (const d of docs)
    for (const ref of d.refs) {
      if (ref === d.id || !docIds.has(ref) || linked.has(pair(d.id, ref))) continue;
      // A folder overview listing its own notes repeats the tree, not a conceptual link
      if (ref.startsWith(`${d.id}/`) || d.id.startsWith(`${ref}/`)) continue;
      linked.add(pair(d.id, ref));
      links.push({ source: d.id, target: ref, kind: "reference" });
    }
  for (let i = 0; i < docs.length; i++) {
    for (let j = i + 1; j < docs.length; j++) {
      if (linked.has(pair(docs[i].id, docs[j].id))) continue;
      const shared = docs[i].tags.filter((t) => docs[j].tags.includes(t)).length;
      if (shared >= 2) links.push({ source: docs[i].id, target: docs[j].id, kind: "related" });
    }
  }
  return { nodes, links };
}
