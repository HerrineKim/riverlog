import type { KNode } from "./knowledge";

/** One step of a field's suggested reading order, as written in frontmatter: a label and topic folder names. */
export type ReadingStep = { label: string; topics: string[] };

/** The `readingOrder` frontmatter list with malformed steps dropped; undefined when nothing usable is left. */
export function readingOrderOf(raw: unknown): ReadingStep[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const steps = raw.flatMap((s): ReadingStep[] => {
    if (!s || typeof s !== "object") return [];
    const { label, topics } = s as { label?: unknown; topics?: unknown };
    const names = Array.isArray(topics) ? topics.filter((t): t is string => typeof t === "string" && t.trim() !== "") : [];
    return typeof label === "string" && label.trim() && names.length ? [{ label: label.trim(), topics: names }] : [];
  });
  return steps.length ? steps : undefined;
}

export type ResolvedStep = { label: string; topics: { name: string; href: string; count: number }[] };

const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, "-");

/** Steps pointed at the field's real topic folders, matched by folder or display name; unknown names are dropped. */
export function resolveReadingOrder(steps: ReadingStep[], children: KNode[]): ResolvedStep[] {
  const topics = children.filter((c) => c.children.length > 0);
  const find = (name: string) => topics.find((c) => norm(c.name) === norm(name) || c.slug.at(-1) === norm(name));
  return steps
    .map((s) => ({
      label: s.label,
      topics: s.topics.flatMap((t) => {
        const c = find(t);
        return c ? [{ name: c.name, href: c.href, count: c.docCount }] : [];
      }),
    }))
    .filter((s) => s.topics.length > 0);
}
