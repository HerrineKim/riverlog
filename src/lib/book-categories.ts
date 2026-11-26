export type BookStatus = "read" | "reading" | "want";

/** Static segment under /books. A card must not use it, or its detail URL is the list page. */
export const BOOK_LIST_SLUGS = ["want"] as const;

export function isReservedBookSlug(slug: string): boolean {
  return (BOOK_LIST_SLUGS as readonly string[]).includes(slug);
}

/** Same order as the book template and the admin editor. Unknown labels sort after these. */
export const CATEGORY_ORDER = ["개발", "컴퓨터 과학", "커리어·일", "경제·경영", "인문·사회", "자기계발", "소설·문학", "기타"] as const;

const categoryRank = (category: string) => {
  const i = (CATEGORY_ORDER as readonly string[]).indexOf(category);
  return i === -1 ? CATEGORY_ORDER.length : i;
};

export function compareCategory(a: string, b: string): number {
  return categoryRank(a) - categoryRank(b) || a.localeCompare(b, "ko");
}

/** The bookshelf is books actually read or being read. `want` is a separate list. */
export function isShelfStatus(status: BookStatus): boolean {
  return status === "read" || status === "reading";
}

/**
 * A book page is worth indexing only when it has a review body.
 * Empty cards (almost all want-to-read, plus read books without a write-up) stay reachable but noindex.
 */
export function bookIsIndexable(review: string): boolean {
  return review.trim().length > 0;
}
