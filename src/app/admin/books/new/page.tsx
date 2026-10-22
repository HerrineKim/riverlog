import { redirect } from "next/navigation";
import BookEditor from "@/components/admin/BookEditor";
import { isAdmin } from "@/lib/admin/auth";

export default async function NewBookPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  return <BookEditor />;
}
