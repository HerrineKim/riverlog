import { site } from "@/lib/site";
import { SOCIAL_LINKS, SocialIcon } from "./SocialLinks";

export default function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line/70">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-8 text-sm text-muted sm:px-6">
        <p>
          © 2026 {site.author}
        </p>
        <ul className="flex items-center gap-1">
          {SOCIAL_LINKS.map((l) => (
            <li key={l.key}>
              <a
                href={l.href}
                aria-label={l.label}
                title={l.label}
                {...(l.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                className="grid size-9 place-items-center rounded-full transition hover:bg-accent-soft hover:text-accent"
              >
                <SocialIcon name={l.key} />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
