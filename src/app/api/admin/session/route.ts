import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/auth";

/** Static pages ask this to decide whether to show the owner's edit controls. */
export async function GET() {
  return NextResponse.json({ admin: await isAdmin() }, { headers: { "Cache-Control": "private, no-store" } });
}
