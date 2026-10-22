import { redirect } from "next/navigation";
import BookEditor from "@/components/admin/BookEditor";
import { isAdmin } from "@/lib/admin/auth";

export default async function EditBookPage({ params }: PageProps<"/admin/books/[slug]">) {
  if (!(await isAdmin())) redirect("/admin/login");
  return <BookEditor slug={(await params).slug} />;
}
