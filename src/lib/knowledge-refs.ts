import { KNOWLEDGE_BASE } from "./knowledge";
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
