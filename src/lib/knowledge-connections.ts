/** A note with what connecting it needs: its links out (`refs`, note ids) and lowercased tags. */
export type NoteRef = {
  id: string;
  title: string;
  href: string;
  field: string;
  category: string;
  tags: string[];
  refs: string[];
};

export type Connected = Omit<NoteRef, "tags" | "refs">;

/** A topic overview listing its own notes repeats the tree, not a conceptual link. */
const isAncestry = (a: string, b: string) => b.startsWith(`${a}/`) || a.startsWith(`${b}/`);

const lite = ({ id, title, href, field, category }: NoteRef): Connected => ({ id, title, href, field, category });

/**
 * Notes a note links to, then notes that link back to it, each once;
 * then up to `tagLimit` other notes sharing two or more tags, most shared first.
 */
export function noteConnections(id: string, notes: NoteRef[], { tagLimit = 3 }: { tagLimit?: number } = {}) {
  const byId = new Map(notes.map((n) => [n.id, n]));
  const me = byId.get(id);
  const out = (me?.refs ?? []).map((r) => byId.get(r));
  const back = notes.filter((n) => n.refs.includes(id));
  const seen = new Set<string>([id]);
  const linked: Connected[] = [];
  for (const n of [...out, ...back]) {
    if (!n || seen.has(n.id) || isAncestry(id, n.id)) continue;
    seen.add(n.id);
    linked.push(lite(n));
  }
  const myTags = new Set(me?.tags ?? []);
  const tagged = notes
    .filter((n) => !seen.has(n.id) && !isAncestry(id, n.id))
    .map((n) => ({ ...lite(n), shared: n.tags.filter((t) => myTags.has(t)).length }))
    .filter((n) => n.shared >= 2)
    .sort((a, b) => b.shared - a.shared || a.title.localeCompare(b.title, "ko"))
    .slice(0, tagLimit);
  return { linked, tagged };
}
