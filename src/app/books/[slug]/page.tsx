import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Prose from "@/components/Prose";
import SiteFooter from "@/components/SiteFooter";
import { editUrl, getAllBooks, getBook, STATUS_LABEL } from "@/lib/books";
import { formatDate } from "@/lib/format";

// Only the pages generated at build time exist; anything else is a real 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllBooks().map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: PageProps<"/books/[slug]">): Promise<Metadata> {
  const book = getBook((await params).slug);
  return book ? { title: `${book.title} — 독후감` } : {};
}

export default async function BookPage({ params }: PageProps<"/books/[slug]">) {
  const book = getBook((await params).slug);
  if (!book) notFound();

  return (
    <>
      <main className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
        <Link href="/books" className="text-sm text-muted hover:text-accent">
          ← 책장
        </Link>
        <header className="mt-8 flex gap-6 border-b border-line pb-8">
          {book.cover && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={book.cover} alt="" className="hidden h-40 w-28 shrink-0 rounded-md border border-line object-cover sm:block" />
          )}
          <div className="min-w-0">
            <p className="text-sm text-muted">{book.category}</p>
            <h1 className="mt-2 text-3xl leading-tight font-bold text-balance text-fg-strong sm:text-4xl">{book.title}</h1>
            <p className="mt-2 text-lg text-muted">{book.author || "저자 정보 없음"}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              <span className="rounded-full bg-accent-soft px-3 py-1 text-accent">{STATUS_LABEL[book.status]}</span>
              {book.rating && <span className="tracking-tight text-accent">{"★".repeat(book.rating) + "☆".repeat(5 - book.rating)}</span>}
              {book.finished && <span className="text-muted">{formatDate(book.finished)} 완독</span>}
              {book.pdf && (
                <a
                  href={book.pdf}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-line px-3 py-1 text-muted transition hover:border-accent hover:text-accent"
                >
                  PDF 보기 ↗
                </a>
              )}
            </div>
          </div>
        </header>

        <section className="mt-10">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-sm font-semibold tracking-[0.18em] text-muted uppercase">독후감</h2>
            <a
              href={editUrl(book.slug)}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-line px-3.5 py-1.5 text-sm text-muted transition hover:border-accent hover:text-accent"
            >
              ✎ {book.review ? "독후감 수정" : "독후감 쓰기"}
            </a>
          </div>
          {book.review ? (
            <div className="mt-6">
              <Prose markdown={book.review} />
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-line p-8 text-center text-muted">
              <p>아직 독후감이 없어요.</p>
              <p className="mt-1 text-sm">
                「독후감 쓰기」를 누르면 GitHub에서 이 책의 마크다운 파일이 열려요. 본문에 감상을 적고 저장하면 사이트에 반영돼요.
              </p>
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
