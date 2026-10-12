// Records when each knowledge note was first added and last changed, from git history, in content/.knowledge-dates.json.
// Deploy builds may get a shallow clone; then it tries to unshallow and otherwise keeps the committed file as is.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = "content/knowledge";
const OUT = "content/.knowledge-dates.json";
const env = { ...process.env, TZ: "Asia/Seoul" };
const git = (...args) => execFileSync("git", ["-c", "core.quotepath=off", ...args], { encoding: "utf8", env, maxBuffer: 64 << 20 });

function hasFullHistory() {
  try {
    if (git("rev-parse", "--is-shallow-repository").trim() === "false") return true;
    git("fetch", "--unshallow", "--quiet");
    return true;
  } catch {
    return false;
  }
}

/** ISO time in KST, same shape as git's iso-strict-local output so strings sort chronologically. */
function kst(ms) {
  const d = new Date(ms + 9 * 3600 * 1000);
  return `${d.toISOString().slice(0, 19)}+09:00`;
}

function current(dir = ROOT, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.posix.join(dir, e.name);
    if (e.isDirectory()) current(full, out);
    else if (e.name.endsWith(".md")) out.push(full.normalize("NFC"));
  }
  return out;
}

if (!hasFullHistory()) {
  console.log(`knowledge-dates: no full git history, keeping ${OUT}`);
  process.exit(0);
}

const files = current();
const dates = Object.fromEntries(files.map((f) => [f, {}]));
const alias = new Map(files.map((f) => [f, f])); // path at some point in history → path today

// Newest commit first. A rename carries the note's identity back to its old path; a pure move is not an edit.
const log = git("log", "-M", "--name-status", "--date=iso-strict-local", "--format=%x00%ad", "--", ROOT);
for (const chunk of log.split("\0").slice(1)) {
  const [when, ...lines] = chunk.trim().split("\n");
  for (const line of lines) {
    const [status, a, b] = line.split("\t").map((s) => s?.normalize("NFC"));
    const now = status.startsWith("R") ? b : a;
    const id = alias.get(now);
    if (!id) continue;
    const d = dates[id];
    if (status === "D") {
      alias.delete(now); // an older file at this path is a different note
      continue;
    }
    if (status !== "R100") d.updated ??= when;
    d.created = when;
    if (status.startsWith("R")) {
      alias.delete(now);
      alias.set(a, id);
    } else if (status === "A") alias.delete(now);
  }
}

// Work not committed yet counts from the file's own modification time
for (const line of git("status", "--porcelain", "-uall", "--", ROOT).split("\n").filter(Boolean)) {
  const file = line.slice(3).split(" -> ").pop().replace(/^"|"$/g, "").normalize("NFC");
  if (!dates[file]) continue;
  const mtime = kst(fs.statSync(file).mtimeMs);
  dates[file].updated = mtime;
  if (line.startsWith("??") || line.startsWith("A")) dates[file].created = mtime;
}

const out = {};
for (const f of files.sort()) {
  const d = dates[f];
  if (d.created) out[path.posix.relative(ROOT, f)] = { created: d.created, updated: d.updated ?? d.created };
}
const json = `${JSON.stringify(out, null, 1)}\n`;
if (!fs.existsSync(OUT) || fs.readFileSync(OUT, "utf8") !== json) fs.writeFileSync(OUT, json);
console.log(`knowledge-dates: ${Object.keys(out).length} notes`);
