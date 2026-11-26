import { NextResponse, type NextRequest } from "next/server";
import { applyBookInput, bookSlug, parseBookInput } from "@/lib/admin/book-file";
import { readFile, writeFile } from "@/lib/admin/github";
import { adminOnly, bookPath, fail } from "@/lib/admin/request";
import { isReservedBookSlug } from "@/lib/book-categories";

/** Registers a new book: content/books/<romanized title>.md */
export async function POST(req: NextRequest) {
  return adminOnly(req, async () => {
    const input = parseBookInput(await req.json().catch(() => null));
    if (typeof input === "string") return fail(input, 400);
    const base = bookSlug(input.title!);
    let slug = base;
    // `want` is the list page, not a book. A taken file or that reserved slug gets a numeric suffix.
    for (let n = 2; isReservedBookSlug(slug) || (await readFile(bookPath(slug))); n++) slug = `${base}-${n}`;
    await writeFile(bookPath(slug), applyBookInput(undefined, { status: "want", category: "기타", review: "", ...input }), `Add book: ${input.title}`);
    return NextResponse.json({ slug }, { status: 201 });
  });
}
