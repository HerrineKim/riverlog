import type { Metadata } from "next";
import BookList from "@/components/BookList";
import SiteFooter from "@/components/SiteFooter";
import { getAllBooks } from "@/lib/books";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({ title: "Books", description: "River가 읽었고, 읽는 중이고, 읽고 싶은 책과 독후감", path: "/books" });

export default function BooksPage() {
  const books = getAllBooks();
  const read = books.filter((b) => b.status === "read").length;
  const reviewed = books.filter((b) => b.review).length;
  return (
    <>
      <main className="mx-auto w-full max-w-4xl px-4 py-14 sm:px-6 sm:py-20">
        <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">Books</p>
        <h1 className="mt-3 font-display text-5xl text-fg-strong sm:text-6xl">책장</h1>
        <p className="mt-4 text-muted">
          다 읽은 책, 읽는 중인 책, 아직 안 읽은 책. 지금까지 {read}권을 읽었고 {reviewed}편의 독후감을 남겼어요.
        </p>
        <div className="mt-10">
          <BookList
            books={books.map(({ review, tags, pdf, ...b }) => ({ ...b, hasReview: review.length > 0 }))}
          />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
