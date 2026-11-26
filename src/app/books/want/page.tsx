import type { Metadata } from "next";
import BookSectionNav from "@/components/BookSectionNav";
import SiteFooter from "@/components/SiteFooter";
import WantList from "@/components/WantList";
import { getAllBooks } from "@/lib/books";
import { pageMeta } from "@/lib/seo";

export function generateMetadata(): Metadata {
  const count = getAllBooks().filter((b) => b.status === "want").length;
  return pageMeta({
    title: "읽고 싶은 책",
    description: `River가 읽고 싶은 책 ${count.toLocaleString("ko-KR")}권`,
    path: "/books/want",
  });
}

export default function WantBooksPage() {
  const books = getAllBooks()
    .filter((b) => b.status === "want")
    .map(({ slug, title, author, category, cover, review }) => ({
      slug,
      title,
      author,
      category,
      cover,
      hasNote: review.length > 0,
    }));

  return (
    <>
      <main className="mx-auto w-full max-w-4xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="font-display text-5xl text-fg-strong sm:text-6xl">읽고 싶은 책</h1>
            <p className="mt-4 max-w-xl text-muted">
              아직 읽지 않은 책 {books.length.toLocaleString("ko-KR")}권이에요. 분류로 모아 두었고, 제목이나 저자로 찾을 수 있어요.
            </p>
          </div>
          <BookSectionNav active="want" />
        </div>
        <div className="mt-8">
          <WantList books={books} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
