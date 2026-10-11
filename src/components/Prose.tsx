import { renderMarkdown } from "@/lib/markdown";

export default async function Prose({ markdown }: { markdown: string }) {
  const html = await renderMarkdown(markdown);
  return (
    <div
      className="prose prose-river prose-headings:font-semibold prose-h2:mt-12 prose-h3:mt-8 prose-pre:bg-[var(--code-bg)]"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
