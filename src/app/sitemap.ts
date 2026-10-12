import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";
import { getAllBooks } from "@/lib/books";
import { getAllWorks } from "@/lib/portfolio";
import { getAllNodes, getTags, tagHref } from "@/lib/knowledge";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const url = (p: string) => `${site.url}${p}`;
  return [
    ...["/", "/blog", "/knowledge", "/knowledge/dictionary", "/knowledge/tags", "/books", "/portfolio"].map((p) => ({ url: url(p) })),
    ...getAllPosts().map((p) => ({ url: url(`/blog/${encodeURIComponent(p.slug)}`), lastModified: p.date || undefined })),
    ...getAllNodes().map((n) => ({ url: url(n.href.split("/").map(encodeURIComponent).join("/")), lastModified: n.doc?.date })),
    ...getTags().map((t) => ({ url: url(tagHref(t.tag)) })),
    ...getAllBooks()
      .filter((b) => b.review)
      .map((b) => ({ url: url(`/books/${encodeURIComponent(b.slug)}`) })),
    ...getAllWorks().map((w) => ({ url: url(`/portfolio/${encodeURIComponent(w.slug)}`) })),
  ];
}
