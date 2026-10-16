import { excerptOf } from "./markdown";
import { cachedRead, readSection, stringList } from "./vault";

export type Post = {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  body: string;
  readingMinutes: number;
};

export const getAllPosts = cachedRead((): Post[] =>
  readSection("blog")
    .map(({ file, slug, data, content }) => ({
      slug,
      title: String(data.title ?? file),
      date: String(data.date ?? ""),
      description: String(data.description ?? excerptOf(content)),
      tags: stringList(data.tags),
      body: content,
      readingMinutes: Math.max(1, Math.round(content.length / 600)),
    }))
    .sort((a, b) => b.date.localeCompare(a.date)),
);

export function getPost(slug: string): Post | undefined {
  return getAllPosts().find((p) => p.slug === decodeURIComponent(slug));
}
