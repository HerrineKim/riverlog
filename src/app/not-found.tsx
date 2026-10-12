import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import { RiverMark } from "@/components/SiteHeader";

export default function NotFound() {
  return (
    <>
      <main className="river-grain flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
        <RiverMark className="size-14 text-accent opacity-80" />
        <p className="mt-6 text-xs font-semibold tracking-[0.24em] text-accent uppercase">404</p>
        <h1 className="mt-3 font-display text-4xl text-fg-strong sm:text-5xl">길을 잃은 것 같아요</h1>
        <p className="mt-4 max-w-md text-muted">찾는 페이지가 없거나 옮겨졌어요. 아래에서 다시 시작해 보세요.</p>
        <ul className="mt-8 flex flex-wrap justify-center gap-2 text-sm">
          {[
            ["/", "홈"],
            ["/blog", "블로그"],
            ["/knowledge/dictionary", "지식 사전"],
            ["/knowledge/tags", "태그"],
            ["/books", "책장"],
          ].map(([href, label]) => (
            <li key={href}>
              <Link href={href} className="block rounded-full border border-line px-4 py-2 text-fg transition hover:border-accent hover:text-accent">
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <SiteFooter />
    </>
  );
}
