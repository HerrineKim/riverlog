import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

/**
 * content/ is an Obsidian vault. This module knows the vault-wide conventions:
 * which notes are public, where attachments live, and how [[wikilinks]] resolve to site URLs.
 */
const CONTENT_DIR = path.join(process.cwd(), "content");
const ATTACHMENTS_DIR = path.join(CONTENT_DIR, "attachments");
const ATTACHMENTS_URL = "/attachments"; // content/attachments is copied to public/attachments before dev/build
export const KNOWLEDGE_BASE = "/knowledge/dictionary";

/** Files and folders starting with "_" or "." (templates, drafts, .obsidian) never reach the site. */
export const isHiddenName = (name: string) => name.startsWith("_") || name.startsWith(".");

/** A note is public unless its frontmatter says `publish: false`. */
export const isPublished = (data: Record<string, unknown>) => data.publish !== false;

/** A frontmatter list (`tags`, `stack`) as strings; anything else is empty. */
export const stringList = (v: unknown): string[] => (Array.isArray(v) ? v.map(String) : []);

/** decodeURIComponent that leaves malformed input as is. */
export function safeDecode(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

export function slugify(segment: string): string {
  return segment
    .normalize("NFC")
    .replace(/\.md$/, "")
    .replace(/[[\]()&!,+'"?#%:;{}<>|^`=@$*\\/]/g, " ")
    .trim()
    .replace(/[\s_.]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

const key = (s: string) => s.normalize("NFC").replace(/\.md$/i, "").replace(/^\/+|\/+$/g, "").toLowerCase();

function walk(dir: string, onFile: (file: string, rel: string) => void, rel = "") {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (isHiddenName(e.name)) continue;
    const childRel = rel ? `${rel}/${e.name}` : e.name;
    if (e.isDirectory()) walk(path.join(dir, e.name), onFile, childRel);
    else onFile(path.join(dir, e.name), childRel.normalize("NFC"));
  }
}

/**
 * Production builds read the vault once. In dev the cache lives for a moment, so one render reuses it
 * but an edit in Obsidian shows up on the next refresh.
 */
const isFresh = (at: number) => process.env.NODE_ENV === "production" || Date.now() - at < 2000;

/** `read`, cached for as long as the vault counts as unchanged (see isFresh). */
export function cachedRead<T>(read: () => T): () => T {
  let cached: { value: T; at: number } | undefined;
  return () => {
    if (!cached || !isFresh(cached.at)) cached = { value: read(), at: Date.now() };
    return cached.value;
  };
}

/** Published notes directly in content/<section> (blog, books, portfolio), with their frontmatter. */
export function readSection(section: string) {
  const dir = path.join(CONTENT_DIR, section);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md") && !isHiddenName(f))
    .flatMap((file) => {
      const { data, content } = matter(fs.readFileSync(path.join(dir, file), "utf8"));
      return isPublished(data) ? [{ file, slug: file.replace(/\.md$/, ""), data, content }] : [];
    });
}

type NoteRef = { href: string; title: string };

/** Note name/path → site URL, and attachment name/path → public URL. First match wins, like Obsidian's shortest-path links. */
const index = cachedRead(() => {
  const notes = new Map<string, NoteRef>();
  const add = (keys: string[], ref: NoteRef) => keys.forEach((k) => notes.has(key(k)) || notes.set(key(k), ref));
  /** Title of a published note, undefined for non-notes and `publish: false`. */
  const published = (file: string) => {
    if (!file.endsWith(".md")) return undefined;
    const { data } = matter(fs.readFileSync(file, "utf8"));
    return isPublished(data) ? String(data.title ?? path.basename(file, ".md")).normalize("NFC") : undefined;
  };

  walk(path.join(CONTENT_DIR, "knowledge"), (file, rel) => {
    const title = published(file);
    if (!title) return;
    const href = `${KNOWLEDGE_BASE}/${rel.replace(/\.md$/, "").split("/").map(slugify).join("/")}`;
    add([`knowledge/${rel}`, rel, path.posix.basename(rel)], { href, title });
  });
  for (const [section, base] of [
    ["books", "/books"],
    ["blog", "/blog"],
    ["portfolio", "/portfolio"],
  ]) {
    walk(path.join(CONTENT_DIR, section), (file, rel) => {
      const title = published(file);
      if (rel.includes("/") || !title) return;
      const href = `${base}/${encodeURIComponent(rel.replace(/\.md$/, ""))}`;
      add([`${section}/${rel}`, rel], { href, title });
    });
  }

  const attachments = new Map<string, string>();
  walk(ATTACHMENTS_DIR, (_file, rel) => {
    const url = `${ATTACHMENTS_URL}/${rel.split("/").map(encodeURIComponent).join("/")}`;
    for (const k of [`attachments/${rel}`, rel, path.posix.basename(rel)]) if (!attachments.has(k.toLowerCase())) attachments.set(k.toLowerCase(), url);
  });

  return { notes, attachments };
});

/** `note`, `folder/note`, `note.md` → URL and title of a published note. */
export function resolveNote(target: string): NoteRef | undefined {
  return index().notes.get(key(target));
}

/** `file.pdf`, `[[file.pdf]]`, `attachments/file.pdf`, `../../attachments/file.pdf` → `/attachments/file.pdf`. */
export function resolveAttachment(ref: string): string | undefined {
  const bare = ref
    .trim()
    .replace(/^!?\[\[|\]\]$/g, "")
    .split("|")[0]
    .replace(/^(\.\.?\/)+/, "")
    .normalize("NFC");
  return index().attachments.get(bare.toLowerCase());
}
