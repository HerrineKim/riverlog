import matter from "gray-matter";
import type { BookStatus } from "@/lib/books";

/** What the admin editor can change; every other frontmatter key (notionUrl, pdf, tags …) is kept as is. */
export type BookInput = {
  title: string;
  author: string;
  category: string;
  status: BookStatus;
  rating?: number;
  finished?: string;
  cover?: string;
  review: string;
};

export const STATUSES: BookStatus[] = ["reading", "read", "want"];

/** Checks a request body; returns the cleaned input or an error message. */
export function parseBookInput(body: unknown, partial = false): Partial<BookInput> | string {
  if (!body || typeof body !== "object") return "잘못된 요청입니다.";
  const b = body as Record<string, unknown>;
  const out: Partial<BookInput> = {};
  const text = (k: keyof BookInput, max: number) => {
    if (b[k] === undefined) return;
    if (typeof b[k] !== "string" || (b[k] as string).length > max) throw new Error(`${k} 값이 올바르지 않습니다.`);
    (out as Record<string, unknown>)[k] = (b[k] as string).trim();
  };
  try {
    text("title", 200);
    text("author", 200);
    text("category", 50);
    text("finished", 10);
    text("cover", 1000);
    if (b.review !== undefined) {
      if (typeof b.review !== "string" || b.review.length > 200_000) throw new Error("독후감이 너무 깁니다.");
      out.review = b.review.replace(/\r\n/g, "\n").trim();
    }
  } catch (e) {
    return (e as Error).message;
  }
  if (b.status !== undefined) {
    if (!STATUSES.includes(b.status as BookStatus)) return "상태 값이 올바르지 않습니다.";
    out.status = b.status as BookStatus;
  }
  if (b.rating !== undefined && b.rating !== null && b.rating !== "") {
    const r = Number(b.rating);
    if (!Number.isInteger(r) || r < 1 || r > 5) return "별점은 1~5 사이 정수입니다.";
    out.rating = r;
  }
  if (out.finished && !/^\d{4}-\d{2}-\d{2}$/.test(out.finished)) return "완독일은 YYYY-MM-DD 형식입니다.";
  if (out.cover && !out.cover.startsWith("https://")) return "표지 주소는 https://로 시작해야 합니다.";
  if (!partial && !out.title) return "제목을 입력하세요.";
  return out;
}

/** Frontmatter in the vault's own style: strings double-quoted, lists as inline JSON arrays. */
function yamlValue(v: unknown): string {
  if (v instanceof Date) return JSON.stringify(v.toISOString().slice(0, 10));
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (Array.isArray(v)) return `[${v.map((x) => JSON.stringify(x)).join(", ")}]`;
  return JSON.stringify(v);
}

function serialize(data: Record<string, unknown>, review: string) {
  const lines = Object.entries(data)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${k}: ${yamlValue(v)}`);
  return `---\n${lines.join("\n")}\n---\n${review ? `\n${review}\n` : ""}`;
}

/** Applies `input` to an existing book file (or a blank one) and returns the new file text. */
export function applyBookInput(fileText: string | undefined, input: Partial<BookInput>): string {
  const { data, content } = fileText ? matter(fileText) : { data: {} as Record<string, unknown>, content: "" };
  const next: Record<string, unknown> = { ...data };
  for (const k of ["title", "author", "category", "status", "rating", "finished", "cover"] as const) {
    if (k in input) next[k] = input[k];
  }
  // Clearing an optional field in the form removes it from the file
  if ("rating" in input && input.rating === undefined) delete next.rating;
  for (const k of ["finished", "cover"] as const) if (input[k] === "") delete next[k];
  if (!fileText) next.tags ??= [];
  return serialize(next, "review" in input ? (input.review ?? "") : content.trim());
}

const INITIALS = ["g", "kk", "n", "d", "tt", "r", "m", "b", "pp", "s", "ss", "", "j", "jj", "ch", "k", "t", "p", "h"];
const VOWELS = ["a", "ae", "ya", "yae", "eo", "e", "yeo", "ye", "o", "wa", "wae", "oe", "yo", "u", "wo", "we", "wi", "yu", "eu", "ui", "i"];
const FINALS = ["", "k", "k", "k", "n", "n", "n", "t", "l", "k", "m", "l", "l", "l", "p", "l", "m", "p", "p", "t", "t", "ng", "t", "t", "k", "t", "p", "t"];

/** Revised Romanization, syllable by syllable, like the existing book file names ("0gwa-1ro-sesangeul-…"). */
export function bookSlug(title: string): string {
  let out = "";
  for (const ch of title.normalize("NFC")) {
    const code = ch.charCodeAt(0) - 0xac00;
    if (code >= 0 && code < 11172) {
      out += INITIALS[Math.floor(code / 588)] + VOWELS[Math.floor((code % 588) / 28)] + FINALS[code % 28];
    } else out += /[a-z0-9]/i.test(ch) ? ch.toLowerCase() : "-";
  }
  return out.replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || "book";
}
