import { tagHref, type TagEntry } from "./knowledge";

export type TagSummary = { tag: string; count: number; href: string };

/** Tags already sorted biggest first, split into the top few, the rest used 3+ times, and the rare tail. */
export function tagGroups(tags: TagEntry[], { top = 24 }: { top?: number } = {}) {
  const summary = (t: TagEntry): TagSummary => ({ tag: t.tag, count: t.notes.length, href: tagHref(t.tag) });
  const head = tags.slice(0, top);
  const rest = tags.slice(top);
  return {
    top: head.map(summary),
    mid: rest.filter((t) => t.notes.length >= 3).map(summary),
    tail: rest.filter((t) => t.notes.length < 3).map(summary),
  };
}

export type TagPanel = TagSummary & {
  related: { tag: string; count: number; href: string }[];
  recent: { title: string; href: string }[];
};

const dateOf = (n: TagEntry["notes"][number]) => n.doc?.date ?? n.doc?.created?.slice(0, 10) ?? "";

/** What the tag page previews for one tag: the tags it most often sits beside and its newest notes. */
export function tagPanel(t: TagEntry): TagPanel {
  return {
    tag: t.tag,
    count: t.notes.length,
    href: tagHref(t.tag),
    related: t.related.slice(0, 5).map((r) => ({ ...r, href: tagHref(r.tag) })),
    recent: [...t.notes]
      .sort((a, b) => dateOf(b).localeCompare(dateOf(a)))
      .slice(0, 4)
      .map((n) => ({ title: n.doc?.title ?? n.name, href: n.href })),
  };
}
