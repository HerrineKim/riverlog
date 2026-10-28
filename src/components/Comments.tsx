"use client";

import Giscus from "@giscus/react";
import useTheme from "@/hooks/useTheme";
import { site } from "@/lib/site";

/**
 * GitHub Discussions comments. `term` is a stable key such as `blog/<slug>`, matched strictly,
 * so threads survive domain changes and never fuzzy-match a similar title.
 */
export default function Comments({ term }: { term: string }) {
  const theme = useTheme();
  return (
    <section aria-labelledby="comments-heading" className="mt-16 border-t border-line pt-10 [overflow-anchor:none]">
      <h2 id="comments-heading" className="mb-6 text-sm font-semibold text-muted">
        댓글
      </h2>
      <Giscus
        repo={site.giscus.repo}
        repoId={site.giscus.repoId}
        category={site.giscus.category}
        categoryId={site.giscus.categoryId}
        mapping="specific"
        term={term}
        strict="1"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme={theme === "dark" ? "transparent_dark" : "light"}
        lang="ko"
        loading="lazy"
      />
      <p className="mt-3 text-xs text-muted">GitHub 계정으로 댓글을 남길 수 있어요.</p>
    </section>
  );
}
