import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { excerptOf } from "./markdown";
import { isFresh, isPublished } from "./vault";

const BLOG_DIR = path.join(process.cwd(), "content/blog");

export type Post = {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  body: string;
  readingMinutes: number;
};

let cached: { list: Post[]; at: number } | undefined;

export function getAllPosts(): Post[] {
  if (cached && isFresh(cached.at)) return cached.list;
  cached = { list: readPosts(), at: Date.now() };
  return cached.list;
}

function readPosts(): Post[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((file): Post | undefined => {
      const { data, content } = matter(fs.readFileSync(path.join(BLOG_DIR, file), "utf8"));
      if (!isPublished(data)) return undefined;
      return {
        slug: file.replace(/\.md$/, ""),
        title: String(data.title ?? file),
        date: String(data.date ?? ""),
        description: String(data.description ?? excerptOf(content)),
        tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
        body: content,
        readingMinutes: Math.max(1, Math.round(content.length / 600)),
      };
    })
    .filter((p): p is Post => !!p && !p.slug.startsWith("_"))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getPost(slug: string): Post | undefined {
  return getAllPosts().find((p) => p.slug === decodeURIComponent(slug));
}
