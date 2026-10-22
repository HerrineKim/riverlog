import { NextResponse, type NextRequest } from "next/server";
import { endSession } from "@/lib/admin/auth";
import { fail, sameOrigin } from "@/lib/admin/request";

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return fail("허용되지 않은 요청입니다.", 403);
  await endSession();
  return NextResponse.json({ ok: true });
}
