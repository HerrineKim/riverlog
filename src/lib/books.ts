import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { site } from "./site";

const BOOKS_DIR = path.join(process.cwd(), "content/books");

export type BookStatus = "read" | "reading" | "want";
export type Book = {
  slug: string;
  title: string;
  author: string;
  category: string;
  status: BookStatus;
  rating?: number;
  finished?: string;
  cover?: string;
  pdf?: string; // path under public/, e.g. "/books/foo.pdf"
  tags: string[];
  review: string; // markdown 독후감, may be empty
};

export const STATUS_LABEL: Record<BookStatus, string> = { reading: "읽는 중", read: "다 읽음", want: "읽고 싶음" };
const STATUS_ORDER: BookStatus[] = ["reading", "read", "want"];

export function getAllBooks(): Book[] {
  if (!fs.existsSync(BOOKS_DIR)) return [];
  const collator = new Intl.Collator("ko", { numeric: true });
  return fs
    .readdirSync(BOOKS_DIR)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
    .map((file) => {
      const { data, content } = matter(fs.readFileSync(path.join(BOOKS_DIR, file), "utf8"));
      const status: BookStatus = ["read", "reading", "want"].includes(data.status) ? data.status : "want";
      const rating = Number(data.rating);
      return {
        slug: file.replace(/\.md$/, ""),
        title: String(data.title ?? file),
        author: String(data.author ?? ""),
        category: String(data.category ?? "기타"),
        status,
        rating: rating >= 1 && rating <= 5 ? Math.round(rating) : undefined,
        finished: data.finished ? String(data.finished) : undefined,
        cover: typeof data.cover === "string" && data.cover.startsWith("https://") ? data.cover : undefined,
        pdf: typeof data.pdf === "string" && data.pdf.startsWith("/books/") ? data.pdf : undefined,
        tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
        review: content.trim(),
      };
    })
    .sort(
      (a, b) =>
        STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status) ||
        (b.finished ?? "").localeCompare(a.finished ?? "") ||
        collator.compare(a.title, b.title),
    );
}

export function getBook(slug: string): Book | undefined {
  return getAllBooks().find((b) => b.slug === decodeURIComponent(slug));
}

/** Opens the book's markdown file in GitHub's web editor; saving it triggers a redeploy. */
export function editUrl(slug: string) {
  return `${site.repo}/edit/main/content/books/${encodeURIComponent(slug)}.md`;
}
