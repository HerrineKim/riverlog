import GithubSlugger from "github-slugger";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema, type Options as Schema } from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { remarkObsidian } from "./wikilinks";

/** [[target|alias]] in plain-text contexts (TOC, excerpts); group 1 is the target, group 2 the alias. */
const WIKILINK_TEXT = /\[\[([^\]|\n]+?)(?:\\?\|([^\]\n]+))?\]\]/g;

export type TocItem = { id: string; text: string; depth: 2 | 3 };

// GitHub's schema, minus the `user-content-` id prefix (rehype-slug adds heading ids afterwards anyway),
// plus free `class` on every element: per-element rules override "*", so it is added to each list
const sanitizeSchema: Schema = {
  ...defaultSchema,
  clobberPrefix: "",
  attributes: Object.fromEntries(
    Object.entries({ "*": [], ...defaultSchema.attributes }).map(([tag, attrs]) => [
      tag,
      [...attrs.filter((a) => (Array.isArray(a) ? a[0] : a) !== "className"), "className"],
    ]),
  ),
};

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkObsidian)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  // Notes come from imported TIL/Notion pages; raw HTML keeps its markup but loses scripts, handlers and js: URLs
  .use(rehypeSanitize, sanitizeSchema)
  .use(rehypeSlug)
  .use(rehypeAutolinkHeadings, { behavior: "wrap" })
  .use(rehypePrettyCode, {
    theme: { dark: "github-dark-dimmed", light: "github-light" },
    keepBackground: false,
    defaultLang: { block: "plaintext" },
  })
  .use(rehypeStringify);

export async function renderMarkdown(markdown: string): Promise<string> {
  return String(await processor.process(markdown));
}

/** h2/h3 headings with the same ids rehype-slug generates. */
export function extractToc(markdown: string): TocItem[] {
  const slugger = new GithubSlugger();
  const toc: TocItem[] = [];
  let inFence = false;
  for (const line of markdown.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
    if (inFence) continue;
    const m = line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (!m) continue;
    const text = stripInline(m[2]);
    const id = slugger.slug(text);
    if (m[1].length === 2 || m[1].length === 3) toc.push({ id, text, depth: m[1].length as 2 | 3 });
  }
  return toc;
}

function stripInline(s: string) {
  return s
    .replace(/<[^>]+>/g, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(WIKILINK_TEXT, (_, t: string, a?: string) => a ?? t.split("#")[0].split("/").pop()!)
    .replace(/[`*_~]/g, "")
    .trim();
}

export function excerptOf(markdown: string, length = 140): string {
  const text = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/!\[\[[^\]]*\]\]/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(WIKILINK_TEXT, (_, t: string, a?: string) => a ?? t.split("#")[0].split("/").pop()!)
    .replace(/^\s*(#{1,6}|>|[-*+]|\d+\.|\|)\s?/gm, "")
    .replace(/[`*_~|]/g, "")
    .replace(/-{3,}/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > length ? `${text.slice(0, length).trimEnd()}…` : text;
}
