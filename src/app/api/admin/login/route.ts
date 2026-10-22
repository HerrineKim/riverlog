import { NextResponse, type NextRequest } from "next/server";
import { checkCredentials, recordFailure, startSession, tooManyFailures } from "@/lib/admin/auth";
import { fail, sameOrigin } from "@/lib/admin/request";

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return fail("허용되지 않은 요청입니다.", 403);
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (tooManyFailures(ip)) return fail("로그인 시도가 너무 많습니다. 15분 뒤에 다시 시도하세요.", 429);

  const body = await req.json().catch(() => null);
  const username = typeof body?.username === "string" ? body.username : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!username || !password || password.length > 200 || !checkCredentials(username, password)) {
    recordFailure(ip);
    return fail("아이디 또는 비밀번호가 맞지 않습니다.", 401);
  }
  await startSession();
  return NextResponse.json({ ok: true });
}
