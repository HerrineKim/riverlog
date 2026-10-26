import type { Metadata } from "next";
import { site } from "./site";

type Article = { published?: string; modified?: string; tags?: string[] };

// Slugs and tags may be Hangul; encode each segment the same way the sitemap does.
const encodePath = (path: string) => path.split("/").map(encodeURIComponent).join("/");

/**
 * Per-page metadata with a canonical URL and matching Open Graph tags.
 * Next merges metadata shallowly, so a page that sets `openGraph` or `alternates` replaces the layout's;
 * that is why every page goes through here instead of inheriting og:title "riverlog" from the root.
 */
export function pageMeta({
  title,
  description = site.description,
  path,
  article,
}: {
  title?: string;
  description?: string;
  path: string;
  article?: Article;
}): Metadata {
  const url = encodePath(path);
  return {
    ...(title && { title }),
    description,
    alternates: { canonical: url, types: { "application/rss+xml": "/rss.xml" } },
    openGraph: {
      siteName: site.name,
      locale: "ko_KR",
      url,
      title: title ?? site.name,
      description,
      // A page's own openGraph hides app/opengraph-image from it, so point at that route explicitly
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: site.name }],
      ...(article
        ? {
            type: "article",
            publishedTime: article.published || undefined,
            modifiedTime: article.modified || undefined,
            authors: [site.author],
            tags: article.tags,
          }
        : { type: "website" }),
    },
  };
}

/** schema.org BlogPosting for a post or note, rendered with <JsonLd>. */
export function articleLd({ title, description, path, article }: { title: string; description?: string; path: string; article: Article }) {
  const url = `${site.url}${encodePath(path)}`;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    url,
    mainEntityOfPage: url,
    datePublished: article.published || undefined,
    dateModified: article.modified || article.published || undefined,
    keywords: article.tags?.join(", ") || undefined,
    inLanguage: "ko",
    author: { "@type": "Person", name: site.author, url: site.url },
    publisher: { "@type": "Person", name: site.author, url: site.url },
  };
}
