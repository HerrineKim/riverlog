"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminFetch } from "@/lib/admin/client";

export default function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await adminFetch("/api/admin/logout", { method: "POST" }).catch(() => {});
        router.replace("/");
        router.refresh();
      }}
      className="rounded-full border border-line px-4 py-2 text-sm text-muted transition hover:border-accent hover:text-accent disabled:opacity-60"
    >
      {busy ? "로그아웃 중…" : "로그아웃"}
    </button>
  );
}
