import matter from "gray-matter";
import { NextResponse, type NextRequest } from "next/server";
import { applyBookInput, parseBookInput } from "@/lib/admin/book-file";
import { deleteFile, readFile, writeFile } from "@/lib/admin/github";
import { adminOnly, BOOK_SLUG, bookPath, fail } from "@/lib/admin/request";

type Ctx = { params: Promise<{ slug: string }> };

async function load(slug: string) {
  return BOOK_SLUG.test(slug) ? readFile(bookPath(slug)) : undefined;
}

/** The book as it is on GitHub right now, which may be newer than the deployed site. */
export async function GET(req: NextRequest, { params }: Ctx) {
  return adminOnly(req, async () => {
    const file = await load((await params).slug);
    if (!file) return fail("책을 찾을 수 없습니다.", 404);
    const { data, content } = matter(file.text);
    const finished = data.finished instanceof Date ? data.finished.toISOString().slice(0, 10) : data.finished;
    return NextResponse.json({ ...data, finished, review: content.trim(), sha: file.sha }, { headers: { "Cache-Control": "private, no-store" } });
  });
}

/** Updates any of the editable fields; `sha` guards against overwriting a newer edit. */
export async function PATCH(req: NextRequest, { params }: Ctx) {
  return adminOnly(req, async () => {
    const slug = (await params).slug;
    const body = await req.json().catch(() => null);
    const input = parseBookInput(body, true);
    if (typeof input === "string") return fail(input, 400);
    if (body && "rating" in body && (body.rating === null || body.rating === "")) input.rating = undefined;
    const file = await load(slug);
    if (!file) return fail("책을 찾을 수 없습니다.", 404);
    if (typeof body?.sha === "string" && body.sha !== file.sha) return fail("다른 곳에서 먼저 수정됐습니다. 새로고침 후 다시 저장하세요.", 409);
    const title = String(matter(file.text).data.title ?? slug);
    const what = Object.keys(input).length === 1 && input.status ? "status" : "review" in input && !input.review ? "remove review" : "update";
    await writeFile(bookPath(slug), applyBookInput(file.text, input), `Book ${what}: ${title}`, file.sha);
    return NextResponse.json({ ok: true });
  });
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  return adminOnly(req, async () => {
    const slug = (await params).slug;
    const file = await load(slug);
    if (!file) return fail("책을 찾을 수 없습니다.", 404);
    await deleteFile(bookPath(slug), `Remove book: ${String(matter(file.text).data.title ?? slug)}`, file.sha);
    return NextResponse.json({ ok: true });
  });
}
