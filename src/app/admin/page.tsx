import Link from "next/link";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/admin/LogoutButton";
import { isAdmin } from "@/lib/admin/auth";

export default async function AdminHome() {
  if (!(await isAdmin())) redirect("/admin/login");
  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-fg-strong">관리</h1>
        </div>
        <LogoutButton />
      </div>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2">
        <li>
          <Link href="/admin/books/new" className="block rounded-2xl border border-line p-6 transition hover:border-accent">
            <p className="font-semibold text-fg-strong">새 책 등록</p>
            <p className="mt-1 text-sm text-muted">책장에 책을 추가하고 독후감을 함께 쓸 수 있습니다.</p>
          </Link>
        </li>
        <li>
          <Link href="/books" className="block rounded-2xl border border-line p-6 transition hover:border-accent">
            <p className="font-semibold text-fg-strong">책장에서 고르기</p>
            <p className="mt-1 text-sm text-muted">책 페이지의 「관리」 상자에서 읽기 상태를 바꾸고 독후감을 쓰거나 고칩니다.</p>
          </Link>
        </li>
      </ul>
      <p className="mt-10 text-sm text-muted">저장한 내용은 GitHub 저장소에 커밋되고, 사이트에는 3~4분 뒤 반영됩니다.</p>
    </>
  );
}
