import Link from "next/link";
import { redirect } from "next/navigation";
import IntentLink from "@/components/IntentLink";
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
            <p className="mt-1 text-sm text-muted">다 읽은 책과 읽는 중인 책입니다. 「관리」에서 상태와 독후감을 고칩니다.</p>
          </Link>
        </li>
        <li>
          <IntentLink href="/books/want" className="block rounded-2xl border border-line p-6 transition hover:border-accent">
            <p className="font-semibold text-fg-strong">읽고 싶은 책에서 고르기</p>
            <p className="mt-1 text-sm text-muted">아직 안 읽은 책입니다. 책 페이지의 「관리」에서 읽기 상태로 바꾸거나 독후감을 씁니다.</p>
          </IntentLink>
        </li>
      </ul>
      <p className="mt-10 text-sm text-muted">저장한 내용은 GitHub 저장소에 커밋되고, 사이트에는 3~4분 뒤 반영됩니다.</p>
    </>
  );
}
