import { describe, expect, it } from "vitest";
import type { KNode } from "./knowledge";
import { readingOrderOf, resolveReadingOrder } from "./knowledge-reading-order";

describe("readingOrderOf", () => {
  it("shouldKeepStepsWithALabelAndTopicsAndDropAnythingElse", () => {
    const raw = [
      { label: "웹 기초", topics: ["Web"] },
      { label: "언어", topics: ["JavaScript", 3, "CSS"] },
      { label: "", topics: ["React"] },
      { label: "빈 단계", topics: [] },
      "not a step",
    ];

    expect(readingOrderOf(raw)).toEqual([
      { label: "웹 기초", topics: ["Web"] },
      { label: "언어", topics: ["JavaScript", "CSS"] },
    ]);
    expect(readingOrderOf("웹 → 언어")).toBeUndefined();
    expect(readingOrderOf(undefined)).toBeUndefined();
  });
});

const leaf: KNode = { id: "F/x", slug: ["f", "x"], href: "", name: "x", category: "F", depth: 3, children: [], docCount: 1 };

const topic = (folder: string, name: string, docCount: number): KNode => ({
  id: `F/${folder}`,
  slug: ["f", folder.toLowerCase()],
  href: `/knowledge/dictionary/f/${folder.toLowerCase()}`,
  name,
  category: "F",
  depth: 2,
  children: [leaf],
  docCount,
});

describe("resolveReadingOrder", () => {
  it("shouldMatchTopicFoldersByFolderOrDisplayNameAndDropUnknownTopicsAndEmptySteps", () => {
    const children = [topic("UI-Design", "UI Design", 22), topic("Next.js", "Next.js", 7), topic("React", "React", 35)];
    const steps = [
      { label: "라이브러리", topics: ["react", "Next.js", "Vue"] },
      { label: "디자인", topics: ["UI-Design"] },
      { label: "없는 주제", topics: ["Svelte"] },
    ];

    expect(resolveReadingOrder(steps, children)).toEqual([
      {
        label: "라이브러리",
        topics: [
          { name: "React", href: "/knowledge/dictionary/f/react", count: 35 },
          { name: "Next.js", href: "/knowledge/dictionary/f/next.js", count: 7 },
        ],
      },
      { label: "디자인", topics: [{ name: "UI Design", href: "/knowledge/dictionary/f/ui-design", count: 22 }] },
    ]);
  });
});
