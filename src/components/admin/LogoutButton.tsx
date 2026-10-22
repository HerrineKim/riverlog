"use client";

import { useRouter } from "next/navigation";
import { adminFetch } from "@/lib/admin/client";

export default function LogoutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await adminFetch("/api/admin/logout", { method: "POST" }).catch(() => {});
        router.replace("/");
        router.refresh();
      }}
      className="rounded-full border border-line px-4 py-2 text-sm text-muted transition hover:border-accent hover:text-accent"
    >
      로그아웃
    </button>
  );
}
