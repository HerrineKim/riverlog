import { extractToc } from "./markdown";
import { cachedRead, readSection, resolveAttachment, stringList } from "./vault";

/** Closing sections that are not projects, so the index card leaves them out. */
const NON_PROJECT_HEADINGS = new Set(["돌아보며"]);

/** `career` and `education` run along the career timeline; a `project` (hackathon, side project) stays off it and lists after them. */
export type WorkKind = "career" | "education" | "project";
const WORK_KINDS: WorkKind[] = ["career", "education", "project"];

/** One company (or client engagement); each `##` heading in the body is a project, except a closing "돌아보며". */
export type Work = {
  slug: string;
  kind: WorkKind;
  company: string;
  companyEn?: string;
  role: string;
  period: string; // display text, e.g. "2023.06 – 2026.02"
  start: string; // YYYY-MM, newest first
  end: string; // YYYY-MM; the timeline sizes each company by start → end
  location?: string;
  summary: string;
  about?: string; // what the company does
  stack: string[];
  highlights: { value: string; label: string }[];
  cover?: string; // public URL of an image in content/attachments
  projects: Project[];
  body: string;
};

/** A `##` section; `summary` is the `> one-liner` right under its heading. */
export type Project = { id: string; title: string; summary?: string };

export const getAllWorks = cachedRead((): Work[] =>
  readSection("portfolio")
    .map(
      ({ file, slug, data, content }): Work => ({
        slug,
        kind: WORK_KINDS.includes(data.kind) ? data.kind : "career",
        company: String(data.company ?? file),
        companyEn: data.companyEn ? String(data.companyEn) : undefined,
        role: String(data.role ?? ""),
        period: String(data.period ?? ""),
        start: String(data.start ?? ""),
        end: String(data.end ?? data.start ?? ""),
        location: data.location ? String(data.location) : undefined,
        summary: String(data.summary ?? ""),
        about: data.about ? String(data.about) : undefined,
        stack: stringList(data.stack),
        highlights: Array.isArray(data.highlights)
          ? data.highlights.map((h: Record<string, unknown>) => ({ value: String(h.value ?? ""), label: String(h.label ?? "") }))
          : [],
        cover: typeof data.cover === "string" ? resolveAttachment(data.cover) : undefined,
        projects: readProjects(content),
        body: content,
      }),
    )
    .sort((a, b) => Number(a.kind === "project") - Number(b.kind === "project") || b.start.localeCompare(a.start)),
);

function readProjects(markdown: string): Project[] {
  const headings = extractToc(markdown).filter((t) => t.depth === 2);
  // Pair each `## ` line (outside code fences) with the toc entry of the same index
  const lines = markdown.split("\n");
  const starts: number[] = [];
  let inFence = false;
  lines.forEach((line, i) => {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
    if (!inFence && /^##\s/.test(line)) starts.push(i);
  });
  return headings
    .map((h, i) => {
      const next = lines.slice(starts[i] + 1).find((l) => l.trim());
      const summary = next?.startsWith(">") ? next.replace(/^>\s*/, "").trim() : undefined;
      return { id: h.id, title: h.text, summary };
    })
    .filter((p) => !NON_PROJECT_HEADINGS.has(p.title));
}

/** Months between two YYYY-MM values, counting both ends. */
export function monthSpan(start: string, end: string): number {
  const [sy, sm] = start.split("-").map(Number);
  const [ey, em] = end.split("-").map(Number);
  return Math.max(1, (ey - sy) * 12 + (em - sm) + 1);
}

/** Works that belong on the career timeline, i.e. everything except standalone projects. */
export const onTimeline = (w: Work) => w.kind !== "project";

export function getWork(slug: string): Work | undefined {
  return getAllWorks().find((w) => w.slug === decodeURIComponent(slug));
}
