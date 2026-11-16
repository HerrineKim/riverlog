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
