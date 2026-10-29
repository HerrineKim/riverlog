"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { adminFetch } from "@/lib/admin/client";

const input = "mt-1.5 w-full rounded-lg min-h-11 border border-control bg-bg-elev px-3 py-2 text-fg-strong focus:border-accent";

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    try {
      await adminFetch("/api/admin/login", { method: "POST", body: { username: form.get("username"), password: form.get("password") } });
      router.replace("/admin");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-4">
      <label className="block text-sm text-muted">
        아이디
        <input name="username" autoComplete="username" autoCapitalize="none" spellCheck={false} required className={input} />
      </label>
      <label className="block text-sm text-muted">
        비밀번호
        <input name="password" type="password" autoComplete="current-password" required className={input} />
      </label>
      {error && (
        <p role="alert" className="text-sm text-red-500">
          {error}
        </p>
      )}
      <button type="submit" disabled={busy} className="w-full rounded-full bg-accent py-2.5 font-medium text-accent-ink transition hover:ring-2 hover:ring-accent hover:ring-offset-2 hover:ring-offset-bg disabled:opacity-60 disabled:hover:ring-0">
        {busy ? "확인 중…" : "로그인"}
      </button>
    </form>
  );
}
