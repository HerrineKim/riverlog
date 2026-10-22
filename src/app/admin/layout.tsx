import type { Metadata } from "next";

export const metadata: Metadata = { title: "관리", robots: { index: false, follow: false } };

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return <main className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6 sm:py-20">{children}</main>;
}
