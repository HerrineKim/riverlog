import { describe, expect, it } from "vitest";
import type { KNode, TagEntry } from "./knowledge";
import { tagGroups, tagPanel } from "./knowledge-tags";

const note = (title: string, date?: string): KNode => ({
  id: title,
  slug: [title],
  href: `/knowledge/dictionary/${title}`,
  name: title,
  category: "A",
  depth: 2,
  doc: { title, date, source: "other", sources: [], tags: [], excerpt: "", body: "" },
  children: [],
  docCount: 1,
});

const entry = (tag: string, count: number, related: TagEntry["related"] = []): TagEntry => ({
  tag,
  notes: Array.from({ length: count }, (_, i) => note(`${tag}-${i}`)),
  related,
});

describe("tagGroups", () => {
  it("shouldPutTheMostUsedTagsOnTopThenTagsUsedThreeOrMoreTimesThenTheRareTail", () => {
    const tags = [entry("a", 9), entry("b", 7), entry("c", 3), entry("d", 2), entry("e", 1)];

    const groups = tagGroups(tags, { top: 2 });

    expect(groups.top.map((t) => t.tag)).toEqual(["a", "b"]);
    expect(groups.mid.map((t) => t.tag)).toEqual(["c"]);
    expect(groups.tail.map((t) => [t.tag, t.count])).toEqual([
      ["d", 2],
      ["e", 1],
    ]);
  });
});

describe("tagPanel", () => {
  it("shouldShowTheFiveCommonestCoTagsAndTheFourNewestNotes", () => {
    const related = ["r1", "r2", "r3", "r4", "r5", "r6"].map((tag, i) => ({ tag, count: 10 - i }));
    const t: TagEntry = {
      tag: "x",
      notes: [note("old", "2026-01-01"), note("undated"), note("new", "2026-05-01"), note("mid", "2026-03-01"), note("newer", "2026-04-01")],
      related,
    };

    const panel = tagPanel(t);

    expect(panel.related.map((r) => r.tag)).toEqual(["r1", "r2", "r3", "r4", "r5"]);
    expect(panel.recent.map((n) => n.title)).toEqual(["new", "newer", "mid", "old"]);
  });
});
