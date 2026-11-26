import { describe, expect, it } from "vitest";
import { bookIsIndexable, compareCategory, isReservedBookSlug, isShelfStatus } from "./book-categories";
import { getAllBooks } from "./books";

describe("book lists", () => {
  it("shouldTreatOnlyReadAndReadingAsTheShelf", () => {
    expect(isShelfStatus("read")).toBe(true);
    expect(isShelfStatus("reading")).toBe(true);
    expect(isShelfStatus("want")).toBe(false);
  });

  it("shouldIndexABookPageOnlyWhenItHasAReview", () => {
    expect(bookIsIndexable("한 줄 메모")).toBe(true);
    expect(bookIsIndexable("")).toBe(false);
    expect(bookIsIndexable("   \n")).toBe(false);
  });

  it("shouldOrderKnownCategoriesBeforeUnknownOnes", () => {
    expect(["기타", "개발", "없는 분류", "컴퓨터 과학"].sort(compareCategory)).toEqual(["개발", "컴퓨터 과학", "기타", "없는 분류"]);
  });

  it("shouldKeepTheWantListRouteFromCollidingWithABook", () => {
    const books = getAllBooks();
    const shelf = books.filter((b) => isShelfStatus(b.status));
    const want = books.filter((b) => b.status === "want");

    expect(books.some((b) => isReservedBookSlug(b.slug))).toBe(false);
    expect(new Set(books.map((b) => b.slug)).size).toBe(books.length);
    expect(shelf.length + want.length).toBe(books.length);
    expect(shelf.every((b) => b.status === "read" || b.status === "reading")).toBe(true);
    expect(want.length).toBeGreaterThan(shelf.length);
  });
});
