import { site } from "@/lib/site";

const ICONS = {
  rss: <path d="M5 4a15 15 0 0 1 15 15M5 10a9 9 0 0 1 9 9M6 19a1 1 0 1 0 0-.01" strokeLinecap="round" />,
  github: (
    <path d="M9 19c-4 1.3-4-2-6-2.5m12 4.5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1-.3-3.4 1.3a11.6 11.6 0 0 0-6 0C6.8 2.8 5.8 3.1 5.8 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4.4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" strokeLinecap="round" strokeLinejoin="round" />
  ),
  linkedin: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7" strokeLinecap="round" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" strokeLinejoin="round" />
    </>
  ),
};

export const SOCIAL_LINKS = [
  { key: "rss", label: "RSS 구독", value: "/rss.xml", href: "/rss.xml" },
  { key: "linkedin", label: "LinkedIn", value: "in/aprilhyerinkim", href: site.linkedin },
  { key: "github", label: "GitHub", value: "@HerrineKim", href: site.github },
  { key: "mail", label: "Email", value: site.email, href: `mailto:${site.email}` },
] as const;

export function SocialIcon({ name, className = "size-4" }: { name: keyof typeof ICONS; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      {ICONS[name]}
    </svg>
  );
}

export default function SocialLinks() {
  return (
    <ul className="flex flex-wrap gap-2 lg:flex-col">
      {SOCIAL_LINKS.map((l) => (
        <li key={l.key}>
          <a
            href={l.href}
            title={l.value}
            {...(l.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
            className="group flex items-center gap-2.5 rounded-full border border-line bg-bg-elev py-1.5 pr-4 pl-1.5 text-sm text-fg transition hover:border-accent hover:text-accent lg:w-full"
          >
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
              <SocialIcon name={l.key} className="size-3.5" />
            </span>
            <span className="truncate">{l.label}</span>
            <span className="ml-auto hidden truncate pl-2 text-xs text-muted lg:inline">{l.value}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
