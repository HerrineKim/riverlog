import { describe, expect, it } from "vitest";
import { noteConnections, type NoteRef } from "./knowledge-connections";

const ref = (id: string, over: Partial<NoteRef> = {}): NoteRef => ({
  id,
  title: id,
  href: `/knowledge/dictionary/${id}`,
  field: "A",
  category: "A",
  tags: [],
  refs: [],
  ...over,
});

describe("noteConnections", () => {
  it("shouldListNotesItLinksToThenNotesLinkingBackOnceEachWithoutItself", () => {
    const notes = [
      ref("A/me", { refs: ["A/out", "A/both", "A/me"] }),
      ref("A/out"),
      ref("A/both", { refs: ["A/me"] }),
      ref("A/back", { refs: ["A/me"] }),
      ref("A/stranger"),
    ];

    const { linked } = noteConnections("A/me", notes);

    expect(linked.map((n) => n.id)).toEqual(["A/out", "A/both", "A/back"]);
  });

  it("shouldSkipLinksBetweenATopicOverviewAndItsOwnNotes", () => {
    const notes = [ref("A/Topic", { refs: ["A/Topic/child", "B/other"] }), ref("A/Topic/child", { refs: ["A/Topic"] }), ref("B/other")];

    expect(noteConnections("A/Topic", notes).linked.map((n) => n.id)).toEqual(["B/other"]);
    expect(noteConnections("A/Topic/child", notes).linked).toEqual([]);
  });

  it("shouldSuggestUpToThreeUnlinkedNotesSharingTwoOrMoreTagsMostSharedFirst", () => {
    const notes = [
      ref("A/me", { tags: ["a", "b", "c", "d"], refs: ["A/linked"] }),
      ref("A/linked", { tags: ["a", "b", "c", "d"] }),
      ref("A/two", { tags: ["a", "b"] }),
      ref("A/four", { tags: ["a", "b", "c", "d"] }),
      ref("A/three", { tags: ["b", "c", "d", "z"] }),
      ref("A/one", { tags: ["a"] }),
      ref("A/also-two", { tags: ["c", "d"] }),
    ];

    const { tagged } = noteConnections("A/me", notes);

    expect(tagged.map((n) => [n.id, n.shared])).toEqual([
      ["A/four", 4],
      ["A/three", 3],
      ["A/also-two", 2],
    ]);
  });
});
