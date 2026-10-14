/**
 * Knowledge search: "#react" matches that tag exactly; anything else is a case-insensitive
 * substring of the item's text (title, summary, tags, path). Returns null for an empty query.
 */
export function makeMatcher(raw: string): ((text: string, tags: string[]) => boolean) | null {
  const q = raw.trim().toLowerCase();
  if (!q) return null;
  const tag = q.startsWith("#") ? q.slice(1) : undefined;
  if (tag === "") return null;
  return (text, tags) =>
    tag !== undefined ? tags.some((t) => t.toLowerCase() === tag) : `${text} ${tags.join(" ")}`.toLowerCase().includes(q);
}
