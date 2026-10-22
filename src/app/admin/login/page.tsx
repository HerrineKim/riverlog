import { redirect } from "next/navigation";
import LoginForm from "@/components/admin/LoginForm";
import { isAdmin } from "@/lib/admin/auth";

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-3xl font-bold text-fg-strong">관리자 로그인</h1>
      <p className="mt-2 text-sm text-muted">블로그 주인만 들어갈 수 있습니다.</p>
      <LoginForm />
    </div>
  );
}
