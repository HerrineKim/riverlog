import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { extractToc } from "./markdown";
import { isFresh, isPublished, resolveAttachment } from "./vault";

const PORTFOLIO_DIR = path.join(process.cwd(), "content/portfolio");
/** Closing sections that are not projects, so the index card leaves them out. */
const NON_PROJECT_HEADINGS = new Set(["돌아보며"]);

/** One company (or client engagement); each `##` heading in the body is a project, except a closing "돌아보며". */
export type Work = {
  slug: string;
  company: string;
  companyEn?: string;
  role: string;
  period: string; // display text, e.g. "2023.06 – 2026.02"
  start: string; // YYYY-MM, newest first
  location?: string;
  summary: string;
  about?: string; // what the company does
  stack: string[];
  highlights: { value: string; label: string }[];
  cover?: string; // public URL of an image in content/attachments
  projects: string[];
  body: string;
};

let cached: { list: Work[]; at: number } | undefined;

export function getAllWorks(): Work[] {
  if (cached && isFresh(cached.at)) return cached.list;
  cached = { list: readWorks(), at: Date.now() };
  return cached.list;
}

function readWorks(): Work[] {
  if (!fs.existsSync(PORTFOLIO_DIR)) return [];
  return fs
    .readdirSync(PORTFOLIO_DIR)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
    .map((file): Work | undefined => {
      const { data, content } = matter(fs.readFileSync(path.join(PORTFOLIO_DIR, file), "utf8"));
      if (!isPublished(data)) return undefined;
      const list = (v: unknown) => (Array.isArray(v) ? v.map(String) : []);
      return {
        slug: file.replace(/\.md$/, ""),
        company: String(data.company ?? file),
        companyEn: data.companyEn ? String(data.companyEn) : undefined,
        role: String(data.role ?? ""),
        period: String(data.period ?? ""),
        start: String(data.start ?? ""),
        location: data.location ? String(data.location) : undefined,
        summary: String(data.summary ?? ""),
        about: data.about ? String(data.about) : undefined,
        stack: list(data.stack),
        highlights: Array.isArray(data.highlights)
          ? data.highlights.map((h: Record<string, unknown>) => ({ value: String(h.value ?? ""), label: String(h.label ?? "") }))
          : [],
        cover: typeof data.cover === "string" ? resolveAttachment(data.cover) : undefined,
        projects: extractToc(content)
          .filter((t) => t.depth === 2 && !NON_PROJECT_HEADINGS.has(t.text))
          .map((t) => t.text),
        body: content,
      };
    })
    .filter((w): w is Work => !!w)
    .sort((a, b) => b.start.localeCompare(a.start));
}

export function getWork(slug: string): Work | undefined {
  return getAllWorks().find((w) => w.slug === decodeURIComponent(slug));
}
