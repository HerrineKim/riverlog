import type { Metadata, Viewport } from "next";
import { Instrument_Serif, JetBrains_Mono } from "next/font/google";
// Self-hosted Pretendard, split by unicode-range so a page only fetches the Hangul it shows
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import ScrollReset from "@/components/ScrollReset";
import SiteHeader from "@/components/SiteHeader";
import { site } from "@/lib/site";
import "./globals.css";

const display = Instrument_Serif({
  variable: "--font-display",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
});
// Only code blocks use it, so it should not compete with the body font for the first paint
const code = JetBrains_Mono({ variable: "--font-code", subsets: ["latin"], preload: false });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.name, template: `%s · ${site.name}` },
  description: site.description,
  authors: [{ name: site.author, url: site.url }],
  // Pages set their own canonical and og tags through pageMeta(); these cover the rest (404 etc.)
  alternates: { types: { "application/rss+xml": "/rss.xml" } },
  openGraph: { type: "website", siteName: site.name, locale: "ko_KR", title: site.name, description: site.description },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0e13" },
    { media: "(prefers-color-scheme: light)", color: "#f6f7f4" },
  ],
};

// A saved toggle choice wins; a first visit follows the OS, matching the browser bar color set by themeColor
const themeScript = `(function(){var t;try{t=localStorage.getItem("theme")}catch(e){}if(t!=="light"&&t!=="dark")t=matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";document.documentElement.setAttribute("data-theme",t)})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      data-theme="dark"
      suppressHydrationWarning
      className={`${display.variable} ${code.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col">
        <a
          href="#main-content"
          className="sr-only z-50 rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-ink focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
        >
          본문으로 건너뛰기
        </a>
        <ScrollReset />
        <SiteHeader />
        <div id="main-content" tabIndex={-1} className="flex flex-1 flex-col outline-none">
          {children}
        </div>
      </body>
    </html>
  );
}
