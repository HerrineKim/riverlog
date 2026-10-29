import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BookCover from "@/components/BookCover";
import Prose from "@/components/Prose";
import SiteFooter from "@/components/SiteFooter";
import BookAdminControls from "@/components/admin/BookAdminControls";
import { getAllBooks, getBook, STATUS_LABEL } from "@/lib/books";
import { formatDate } from "@/lib/format";
import { pageMeta } from "@/lib/seo";

// Only the pages generated at build time exist; anything else is a real 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllBooks().map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: PageProps<"/books/[slug]">): Promise<Metadata> {
  const book = getBook((await params).slug);
  return book
    ? pageMeta({ title: `${book.title} 독후감`, description: `${book.author}의 『${book.title}』를 읽고 남긴 기록`, path: `/books/${book.slug}` })
    : {};
}

export default async function BookPage({ params }: PageProps<"/books/[slug]">) {
  const book = getBook((await params).slug);
  if (!book) notFound();

  return (
    <>
      <main className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
        <Link href="/books" className="text-sm text-muted hover:text-accent pointer-coarse:inline-flex pointer-coarse:min-h-11 pointer-coarse:items-center">
          <span aria-hidden>←</span> 책장
        </Link>
        <header className="mt-8 flex gap-6 border-b border-line pb-8">
          <BookCover title={book.title} author={book.author} cover={book.cover} className="w-24 shrink-0 sm:w-32" />
          <div className="min-w-0">
            <p className="text-sm text-muted">{book.category}</p>
            <h1 className="mt-2 text-3xl leading-tight font-bold text-balance text-fg-strong sm:text-4xl">{book.title}</h1>
            <p className="mt-2 text-lg text-muted">{book.author || "저자 정보 없음"}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              <span className="rounded-full bg-accent-soft px-3 py-1 text-accent">{STATUS_LABEL[book.status]}</span>
              {book.rating && (
                <span role="img" aria-label={`별점 5점 중 ${book.rating}점`} className="tracking-tight text-accent">
                  {"★".repeat(book.rating) + "☆".repeat(5 - book.rating)}
                </span>
              )}
              {book.finished && <span className="text-muted">{formatDate(book.finished)} 완독</span>}
              {book.pdf && (
                <a
                  href={book.pdf}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center gap-1 rounded-lg border border-line px-4 text-muted transition hover:border-accent hover:text-accent"
                >
                  PDF 보기 <span aria-hidden>↗</span>
                  <span className="sr-only">(새 창)</span>
                </a>
              )}
            </div>
          </div>
        </header>
        <BookAdminControls slug={book.slug} status={book.status} hasReview={book.review.length > 0} />

        <section className="mt-10">
          <h2 className="text-sm font-semibold text-muted">독후감</h2>
          {book.review ? (
            <div className="mt-6">
              <Prose markdown={book.review} />
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-line p-8 text-center text-muted">
              <p>아직 독후감이 없어요.</p>
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
