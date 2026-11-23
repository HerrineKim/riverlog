import { getKnowledgeTree, KNOWLEDGE_BASE, type KNode } from "./knowledge";
import type { NoteRef } from "./knowledge-connections";
import { resolveNote } from "./vault";

/** Ids of knowledge notes a note body links to, via dictionary URLs or [[wikilinks]]. */
export function referencedIds(body: string): string[] {
  const prefix = `${KNOWLEDGE_BASE}/`;
  const hrefs: string[] = [];
  for (const m of body.matchAll(/\]\((\/knowledge\/dictionary\/[^)\s#]+)/g)) hrefs.push(m[1]);
  for (const m of body.matchAll(/!?\[\[([^\]|#\n]+)(?:#[^\]|\n]*)?(?:\\?\|[^\]\n]+)?\]\]/g)) {
    const href = resolveNote(m[1].replace(/\\$/, "").trim())?.href;
    if (href) hrefs.push(href);
  }
  return hrefs.filter((h) => h.startsWith(prefix)).map((h) => decodeURIComponent(h.slice(prefix.length)));
}

let refsCache: { tree: KNode; refs: NoteRef[] } | undefined;

/** Every note below the field level with its outgoing note links and lowercased tags, rebuilt when the tree is. */
export function getNoteRefs(): NoteRef[] {
  const tree = getKnowledgeTree();
  if (refsCache?.tree !== tree) {
    const refs: NoteRef[] = [];
    for (const field of tree.children) {
      const visit = (n: KNode) => {
        if (n.doc)
          refs.push({
            id: n.id,
            title: n.doc.title,
            href: n.href,
            field: field.name,
            category: field.category,
            tags: n.doc.tags.map((t) => t.toLowerCase()),
            refs: referencedIds(n.doc.body),
          });
        n.children.forEach(visit);
      };
      field.children.forEach(visit);
    }
    refsCache = { tree, refs };
  }
  return refsCache.refs;
}
