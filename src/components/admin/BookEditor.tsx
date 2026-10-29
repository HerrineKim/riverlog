"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, type MouseEvent, useEffect, useRef, useState } from "react";
import BookCover from "@/components/BookCover";
import { adminFetch, DEPLOY_NOTE } from "@/lib/admin/client";

const CATEGORIES = ["개발", "컴퓨터 과학", "커리어·일", "경제·경영", "인문·사회", "자기계발", "소설·문학", "기타"];
const STATUSES = [
  ["reading", "읽는 중"],
  ["read", "다 읽음"],
  ["want", "안 읽음"],
] as const;

type Form = { title: string; author: string; category: string; status: string; rating: string; finished: string; cover: string; review: string };
const EMPTY: Form = { title: "", author: "", category: "기타", status: "reading", rating: "", finished: "", cover: "", review: "" };

const field = "mt-1.5 w-full rounded-lg min-h-11 border border-control bg-bg-elev px-3 py-2 text-fg-strong focus:border-accent";

/** Writes a new book (no slug) or edits one, reading the current file from GitHub so a pending deploy is not lost. */
export default function BookEditor({ slug: initialSlug }: { slug?: string }) {
  const router = useRouter();
  // A new book becomes an edit once it is registered
  const [slug, setSlug] = useState(initialSlug);
  const [form, setForm] = useState<Form>(EMPTY);
  // What was last loaded or saved; anything else is an unsaved edit
  const [baseline, setBaseline] = useState<Form>(EMPTY);
  const [sha, setSha] = useState<string>();
  const [loading, setLoading] = useState(!!slug);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState<string>();
  const errorRef = useRef<HTMLParagraphElement>(null);
  const dirty = JSON.stringify(form) !== JSON.stringify(baseline);

  // Closing or reloading the tab with unsaved edits asks first
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  // A failed save moves focus to the error, so it is read out and not missed below the long textarea
  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  useEffect(() => {
    if (!initialSlug) return;
    adminFetch<Record<string, unknown> & { sha: string }>(`/api/admin/books/${initialSlug}`, { method: "GET" })
      .then((d) => {
        const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));
        const loaded = {
          title: str(d.title),
          author: str(d.author),
          category: str(d.category) || "기타",
          status: str(d.status) || "want",
          rating: str(d.rating),
          finished: str(d.finished),
          cover: str(d.cover),
          review: str(d.review),
        };
        setForm(loaded);
        setBaseline(loaded);
        setSha(d.sha);
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, [initialSlug]);

  const bind = (k: keyof Form) => ({
    name: k,
    autoComplete: "off",
    value: form[k],
    onChange: (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value })),
  });

  const leave = (e: MouseEvent) => {
    if (dirty && !confirm("저장하지 않은 내용이 있어요. 이 페이지를 떠날까요?")) e.preventDefault();
  };

  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    setError("");
    try {
      const body = { ...form, rating: form.rating ? Number(form.rating) : null };
      if (slug) {
        await adminFetch(`/api/admin/books/${slug}`, { method: "PATCH", body: { ...body, sha } });
        // The next save must build on this commit
        const fresh = await adminFetch<{ sha: string }>(`/api/admin/books/${slug}`, { method: "GET" });
        setSha(fresh.sha);
        setSaved(slug);
      } else {
        const { slug: created } = await adminFetch<{ slug: string }>("/api/admin/books", { method: "POST", body });
        setSha((await adminFetch<{ sha: string }>(`/api/admin/books/${created}`, { method: "GET" })).sha);
        setSlug(created);
        setSaved(created);
        window.history.replaceState(null, "", `/admin/books/${created}`);
      }
      setBaseline(form);
      setMessage(DEPLOY_NOTE);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!slug || !confirm(`「${form.title}」을 책장에서 삭제할까요? 독후감도 함께 사라집니다.`)) return;
    setBusy(true);
    try {
      await adminFetch(`/api/admin/books/${slug}`, { method: "DELETE" });
      router.replace("/admin");
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  if (loading) return <p className="text-muted">불러오는 중…</p>;

  return (
    <form onSubmit={save}>
      <Link href={slug ? `/books/${slug}` : "/admin"} onClick={leave} className="text-sm text-muted hover:text-accent pointer-coarse:inline-flex pointer-coarse:min-h-11 pointer-coarse:items-center">
        <span aria-hidden>←</span> {slug ? "책 페이지" : "관리"}
      </Link>
      <h1 className="mt-6 text-3xl font-bold text-fg-strong">{slug ? "책 · 독후감 편집" : "새 책 등록"}</h1>

      <div className="mt-8 grid gap-6 sm:grid-cols-[8rem_minmax(0,1fr)]">
        <BookCover title={form.title || "제목"} author={form.author} cover={form.cover.startsWith("https://") ? form.cover : undefined} className="w-28 sm:w-full" />
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm text-muted sm:col-span-2">
            제목
            <input {...bind("title")} required maxLength={200} className={field} />
          </label>
          <label className="block text-sm text-muted">
            저자
            <input {...bind("author")} maxLength={200} className={field} />
          </label>
          <label className="block text-sm text-muted">
            분류
            <select {...bind("category")} className={field}>
              {[...new Set([...CATEGORIES, form.category])].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm text-muted">
            읽기 상태
            <select {...bind("status")} className={field}>
              {STATUSES.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm text-muted">
            별점
            <select {...bind("rating")} className={field}>
              <option value="">없음</option>
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {"★".repeat(n)}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm text-muted">
            완독일
            <input type="date" {...bind("finished")} className={field} />
          </label>
          <label className="block text-sm text-muted">
            표지 이미지 주소
            <input type="url" {...bind("cover")} spellCheck={false} placeholder="https://example.com/cover.jpg…" maxLength={1000} className={field} />
          </label>
        </div>
      </div>

      <label className="mt-8 block text-sm text-muted">
        독후감 (마크다운)
        <textarea
          {...bind("review")}
          rows={18}
          placeholder="감상을 적어 주세요. 비워 두면 독후감이 없는 책이 됩니다."
          className={`${field} font-mono text-sm leading-relaxed`}
        />
      </label>

      {error && (
        <p ref={errorRef} role="alert" tabIndex={-1} className="mt-4 text-sm text-red-500">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="mt-4 text-sm text-muted">
          {message}
          {saved && (
            <>
              {" "}
              <Link href={`/books/${saved}`} className="text-accent underline underline-offset-2">
                책 페이지로
              </Link>
            </>
          )}
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <button type="submit" disabled={busy} className="rounded-full bg-accent px-6 py-2.5 font-medium text-accent-ink transition hover:ring-2 hover:ring-accent hover:ring-offset-2 hover:ring-offset-bg disabled:opacity-60 disabled:hover:ring-0">
          {busy ? "저장 중…" : slug ? "저장" : "등록"}
        </button>
        {slug && (
          <button
            type="button"
            onClick={remove}
            disabled={busy}
            className="rounded-full border border-line px-4 py-2 text-sm text-muted transition hover:border-red-500 hover:text-red-500 disabled:opacity-60"
          >
            책 삭제
          </button>
        )}
      </div>
    </form>
  );
}
