import { describe, expect, it } from "vitest";
import type { KDoc, KNode } from "./knowledge";
import { fieldSummaries, recentNotes } from "./knowledge-overview";

const doc = (over: Partial<KDoc> = {}): KDoc => ({ title: "t", source: "other", sources: [], tags: [], excerpt: "", body: "", ...over });

/** A node whose docCount follows its children, like buildNode makes it. */
function node(id: string, children: KNode[] = [], d?: KDoc): KNode {
  const slug = id.split("/");
  return {
    id,
    slug,
    href: `/knowledge/dictionary/${id}`,
    name: slug[slug.length - 1],
    category: slug[0],
    depth: slug.length,
    doc: d ?? (children.length ? undefined : doc({ title: slug[slug.length - 1] })),
    children,
    docCount: children.reduce((a, c) => a + c.docCount, d || !children.length ? 1 : 0),
  };
}

function root(children: KNode[]): KNode {
  return { ...node("x", children), id: "", slug: [], depth: 0, category: "", doc: undefined, docCount: children.reduce((a, c) => a + c.docCount, 0) };
}

describe("fieldSummaries", () => {
  it("shouldGiveEachFieldItsNoteCountAndRoundedShareOfAllNotes", () => {
    const tree = root([
      node("A", [node("A/one"), node("A/two"), node("A/three")]),
      node("B", [node("B/one")]),
    ]);

    const fields = fieldSummaries(tree);

    expect(fields.map((f) => [f.id, f.count, f.share])).toEqual([
      ["A", 3, 75],
      ["B", 1, 25],
    ]);
  });

  it("shouldListSubTopicFoldersBiggestFirstAndSkipLooseNotes", () => {
    const tree = root([
      node("A", [
        node("A/Small", [node("A/Small/one")]),
        node("A/Big", [node("A/Big/one"), node("A/Big/two")]),
        node("A/loose"),
      ]),
    ]);

    const [a] = fieldSummaries(tree);

    expect(a.topics.map((t) => [t.name, t.count])).toEqual([
      ["Big", 2],
      ["Small", 1],
    ]);
  });
});

describe("recentNotes", () => {
  it("shouldReturnNotesNewestFirstByDateWithoutFieldOverviewsUpToTheLimit", () => {
    const tree = root([
      node("A", [node("A/old", [], doc({ title: "old", date: "2026-01-01" })), node("A/new", [], doc({ title: "new", date: "2026-03-01" }))], doc({ title: "A overview", date: "2026-12-31" })),
      node("B", [node("B/mid", [], doc({ title: "mid", date: "2026-02-01" }))]),
    ]);

    const notes = recentNotes(tree, 2);

    expect(notes.map((n) => [n.title, n.date, n.category])).toEqual([
      ["new", "2026-03-01", "A"],
      ["mid", "2026-02-01", "B"],
    ]);
  });
});
