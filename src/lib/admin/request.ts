import { NextResponse, type NextRequest } from "next/server";
import { isAdmin } from "./auth";
import { GitHubError } from "./github";

/** Mutations must come from this site's own pages (the session cookie is SameSite=Strict as well). */
export function sameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  return !!origin && origin === req.nextUrl.origin;
}

export const fail = (message: string, status: number) => NextResponse.json({ error: message }, { status });

/** Runs `handler` only for a signed-in admin calling from this site; GitHub failures become JSON errors. */
export async function adminOnly(req: NextRequest, handler: () => Promise<Response>): Promise<Response> {
  if (req.method !== "GET" && !sameOrigin(req)) return fail("허용되지 않은 요청입니다.", 403);
  if (!(await isAdmin())) return fail("로그인이 필요합니다.", 401);
  try {
    return await handler();
  } catch (e) {
    if (e instanceof GitHubError) return fail(e.status === 409 ? "다른 곳에서 먼저 수정됐습니다. 새로고침 후 다시 저장하세요." : e.message, e.status);
    throw e;
  }
}

export const BOOK_SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const bookPath = (slug: string) => `content/books/${slug}.md`;
