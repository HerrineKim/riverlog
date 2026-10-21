import GithubSlugger from "github-slugger";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema, type Options as Schema } from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkCjkFriendly from "remark-cjk-friendly/parseOnly";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import type { Element, Root as HastRoot } from "hast";
import { unified } from "unified";
import { visit } from "unist-util-visit";
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

/** A paragraph holding only an image becomes <figure> with its alt text as the caption. */
function rehypeFigures() {
  return (tree: HastRoot) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName !== "p") return;
      const kids = node.children.filter((c) => !(c.type === "text" && !c.value.trim()));
      const img = kids[0];
      if (kids.length !== 1 || img.type !== "element" || img.tagName !== "img") return;
      const alt = String(img.properties.alt ?? "").trim();
      node.tagName = "figure";
      node.children = alt ? [img, { type: "element", tagName: "figcaption", properties: {}, children: [{ type: "text", value: alt }] }] : [img];
    });
  };
}

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  // CommonMark drops **bold** when a Korean particle follows punctuation inside the markers (e.g. **「A」**는)
  .use(remarkCjkFriendly)
  .use(remarkObsidian)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  // Notes come from imported TIL/Notion pages; raw HTML keeps its markup but loses scripts, handlers and js: URLs
  .use(rehypeSanitize, sanitizeSchema)
  .use(rehypeSlug)
  .use(rehypeAutolinkHeadings, { behavior: "wrap" })
  .use(rehypePrettyCode, {
    // github-light's comment/string/orange tokens fall below 4.5:1; the high-contrast variant passes
    theme: { dark: "github-dark-dimmed", light: "github-light-high-contrast" },
    keepBackground: false,
    defaultLang: { block: "plaintext" },
  })
  .use(rehypeStringify);

// Same pipeline plus captions; runs after sanitize, so the figure markup is our own
const figureProcessor = processor().use(rehypeFigures);

export async function renderMarkdown(markdown: string, { figures = false }: { figures?: boolean } = {}): Promise<string> {
  return String(await (figures ? figureProcessor : processor).process(markdown));
}

/**
 * Splits off the blockquote(s) a note opens with (source and context lines), unquoted,
 * so the page can tuck them away. `lead` is empty when the body doesn't start with a quote.
 */
export function splitLeadingQuote(markdown: string): { lead: string; rest: string } {
  const m = markdown.match(/^\s*((?:>.*(?:\n|$))+(?:\n*>.*(?:\n|$))*)/);
  if (!m) return { lead: "", rest: markdown };
  const lead = m[1].replace(/^> ?/gm, "").trim();
  return { lead, rest: markdown.slice(m[0].length) };
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
