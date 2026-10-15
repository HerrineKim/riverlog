#!/usr/bin/env node
// Checks a knowledge note against riverlog conventions.
// Usage: node .claude/skills/note/scripts/check-note.mjs content/knowledge/<path>.md [...more]
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const CONTENT = path.resolve("content");
const KNOWLEDGE = path.join(CONTENT, "knowledge");
const REQUIRED = ["title", "concept", "summary", "tags", "source", "date"];
const SOURCES = ["til", "notion", "mixed", "other"];

const files = process.argv.slice(2);
if (!files.length) {
  console.error("usage: check-note.mjs <note.md> [...]");
  process.exit(2);
}

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith(".") || e.name.startsWith("_")) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const all = walk(CONTENT);
const key = (s) => s.normalize("NFC").replace(/\.md$/i, "").toLowerCase();
const noteKeys = new Set();
for (const f of all.filter((f) => f.endsWith(".md"))) {
  const rel = path.relative(CONTENT, f).split(path.sep).join("/");
  noteKeys.add(key(rel));
  if (rel.startsWith("knowledge/")) noteKeys.add(key(rel.slice("knowledge/".length)));
  noteKeys.add(key(path.basename(f)));
}
const attachmentNames = new Set(
  all.filter((f) => f.includes(`${path.sep}attachments${path.sep}`)).map((f) => path.basename(f).toLowerCase()),
);

let failed = false;
for (const arg of files) {
  const file = path.resolve(arg);
  const errors = [];
  const warns = [];
  if (!fs.existsSync(file)) {
    console.log(`✗ ${arg}: file not found`);
    failed = true;
    continue;
  }
  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  const relToKnowledge = path.relative(KNOWLEDGE, file).split(path.sep).join("/");

  if (relToKnowledge.startsWith("..")) errors.push("not under content/knowledge");
  for (const k of REQUIRED) if (data[k] === undefined || data[k] === "") errors.push(`missing frontmatter: ${k}`);
  if (data.source && !SOURCES.includes(data.source)) errors.push(`source must be one of ${SOURCES.join("|")}`);
  if (data.tags && (!Array.isArray(data.tags) || data.tags.length < 2)) errors.push("tags must be an array with 2+ entries");
  if (Array.isArray(data.tags))
    for (const t of data.tags) if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(String(t))) warns.push(`tag not lowercase kebab-case: ${t}`);
  if (data.date && !/^\d{4}-\d{2}-\d{2}$/.test(String(data.date instanceof Date ? data.date.toISOString().slice(0, 10) : data.date)))
    errors.push("date must be YYYY-MM-DD");
  if (/^#\s/m.test(content.replace(/```[\s\S]*?```/g, ""))) warns.push("body has an h1; title comes from frontmatter");

  // Notes are written in plain 평서체 "~다"; quoted text (「」, "", `code`) may stay polite
  const prose = content.replace(/```[\s\S]*?```/g, "").replace(/`[^`]*`|「[^」]*」|"[^"]*"|“[^”]*”/g, "");
  const polite = prose.match(/[^\s]*(습니다|입니다|세요|해요|예요|이에요)[.!?]?(?=\s|$)/gm);
  if (polite) warns.push(`polite speech (use 평서체 "~다"): ${[...new Set(polite)].slice(0, 3).join(" / ")}`);

  // Log-shaped notes: headings or title organized by date/session instead of topic
  const LOG = /\d{4}[.\-/]\d{1,2}[.\-/]\d{1,2}|\bday\s*\d+|\d+\s*(일차|주차|회차)|\bpjt\s*\d+|오늘|회고/i;
  const logHeads = [String(data.title ?? ""), ...[...content.replace(/```[\s\S]*?```/g, "").matchAll(/^#{2,3}\s+(.+)$/gm)].map((m) => m[1])]
    .filter((h) => LOG.test(h));
  if (logHeads.length)
    warns.push(`looks like a log, not a topic note (organize by concept): ${logHeads.slice(0, 3).join(" / ")}`);

  // Unique file name (wikilinks resolve by bare name)
  const base = path.basename(file).toLowerCase();
  const dupes = all.filter((f) => f !== file && path.basename(f).toLowerCase() === base && f.endsWith(".md"));
  if (dupes.length) errors.push(`file name also used by: ${dupes.map((d) => path.relative(CONTENT, d)).join(", ")}`);

  // Wikilinks
  const body = content.replace(/```[\s\S]*?```/g, "").replace(/`[^`\n]*`/g, "");
  for (const m of body.matchAll(/(!?)\[\[([^\]|\n]+?)(?:\\?\|[^\]\n]+)?\]\]/g)) {
    const target = m[2].split("#")[0].trim();
    if (!target) continue;
    const ok = m[1] || /\.[a-z0-9]+$/i.test(target) && !target.endsWith(".md")
      ? attachmentNames.has(path.basename(target).toLowerCase()) || noteKeys.has(key(target))
      : noteKeys.has(key(target));
    if (!ok) errors.push(`broken wikilink: [[${m[2]}]]`);
  }
  // Relative markdown links
  for (const m of body.matchAll(/\]\((?!https?:|\/|#|mailto:)([^)\s#]+)(#[^)\s]*)?\)/g)) {
    const t = decodeURIComponent(m[1]).replace(/\/$/, "");
    const cands = [path.join(path.dirname(file), t), path.join(KNOWLEDGE, t)];
    if (!cands.some((c) => fs.existsSync(c) || fs.existsSync(`${c}.md`))) errors.push(`broken link: (${m[1]})`);
  }

  // Listed in a parent index note
  const parts = relToKnowledge.split("/");
  let indexed = false;
  for (let i = parts.length - 1; i >= 1 && !indexed; i--) {
    const idx = path.join(KNOWLEDGE, ...parts.slice(0, i)) + ".md";
    if (!fs.existsSync(idx)) continue;
    const text = fs.readFileSync(idx, "utf8");
    const slug = parts.at(-1).replace(/\.md$/, "");
    if (text.includes(`${slug}.md`) || text.includes(`[[${slug}`) || text.includes(`/${slug})`)) indexed = true;
  }
  if (!indexed) warns.push("not listed in any parent index note (<분야>.md / <주제>.md)");

  const status = errors.length ? "✗" : "✓";
  console.log(`${status} ${path.relative(process.cwd(), file)}`);
  for (const e of errors) console.log(`  error: ${e}`);
  for (const w of warns) console.log(`  warn:  ${w}`);
  if (errors.length) failed = true;
}
process.exit(failed ? 1 : 0);
