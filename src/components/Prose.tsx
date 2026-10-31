import MermaidDiagrams from "@/components/MermaidDiagrams";
import { renderMarkdown } from "@/lib/markdown";

export default async function Prose({
  markdown,
  figures = false,
  className = "",
}: {
  markdown: string;
  /** Turn image-only paragraphs into captioned figures (alt text → caption) */
  figures?: boolean;
  className?: string;
}) {
  const html = await renderMarkdown(markdown, { figures });
  return (
    <>
      <div
        className={`prose prose-river prose-headings:font-semibold prose-h2:mt-12 prose-h3:mt-8 prose-pre:bg-[var(--code-bg)] ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {html.includes('class="mermaid-diagram"') && <MermaidDiagrams />}
    </>
  );
}
