import type { Metadata } from "next";
import BookList from "@/components/BookList";
import BookSectionNav from "@/components/BookSectionNav";
import SiteFooter from "@/components/SiteFooter";
import { getAllBooks, isShelfStatus } from "@/lib/books";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Books",
  description: "River가 다 읽었거나 읽고 있는 책과 독후감",
  path: "/books",
});

export default function BooksPage() {
  const shelf = getAllBooks().filter((b) => isShelfStatus(b.status));
  const read = shelf.filter((b) => b.status === "read").length;
  const reviewed = shelf.filter((b) => b.review).length;
  return (
    <>
      <main className="mx-auto w-full max-w-4xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="font-display text-5xl text-fg-strong sm:text-6xl">책장</h1>
            <p className="mt-4 max-w-xl text-muted">
              다 읽었거나 지금 읽고 있는 책이에요. {read}권을 읽었고, 독후감은 {reviewed}편이에요.
            </p>
          </div>
          <BookSectionNav active="shelf" />
        </div>
        <div className="mt-10">
          <BookList
            statuses={["reading", "read"]}
            books={shelf.map(({ slug, title, author, category, status, rating, finished, cover, review }) => ({
              slug,
              title,
              author,
              category,
              status,
              rating,
              finished,
              cover,
              hasReview: review.length > 0,
            }))}
          />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
