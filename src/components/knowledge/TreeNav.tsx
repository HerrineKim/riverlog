import Link from "next/link";
import { categoryColor, type KNode } from "@/lib/knowledge";

/** Server-rendered collapsible tree. Branches on the path to `currentId` start open. */
export default function TreeNav({ tree, currentId }: { tree: KNode; currentId?: string }) {
  return (
    <nav aria-label="지식 창고 목차" className="text-sm">
      <ul className="space-y-1">
        {tree.children.map((c) => (
          <Branch key={c.id} node={c} currentId={currentId} />
        ))}
      </ul>
    </nav>
  );
}

function Branch({ node, currentId }: { node: KNode; currentId?: string }) {
  const active = node.id === currentId;
  const onPath = !!currentId && (currentId === node.id || currentId.startsWith(`${node.id}/`));
  const linkCls = `block truncate rounded-md px-2 py-1 transition ${
    active ? "bg-accent-soft font-medium text-accent" : "text-muted hover:bg-bg-elev hover:text-fg-strong"
  }`;

  if (node.children.length === 0) {
    return (
      <li>
        <Link href={node.href} className={linkCls} title={node.name} aria-current={active ? "page" : undefined}>
          {node.name}
        </Link>
      </li>
    );
  }

  return (
    <li>
      <details open={onPath || undefined} className="group/branch">
        <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-md px-1 py-1 text-fg hover:bg-bg-elev [&::-webkit-details-marker]:hidden">
          <svg viewBox="0 0 16 16" className="size-3 shrink-0 text-muted transition group-open/branch:rotate-90" fill="currentColor">
            <path d="M6 3.5 10.5 8 6 12.5z" />
          </svg>
          {node.depth === 1 && (
            <span className="size-2 shrink-0 rounded-full" style={{ background: categoryColor(node.category) }} />
          )}
          <span className={`truncate ${node.depth === 1 ? "font-semibold text-fg-strong" : ""} ${active ? "text-accent" : ""}`}>
            {node.name}
          </span>
          <span className="ml-auto pl-2 text-xs text-muted tabular-nums">{node.docCount}</span>
        </summary>
        <ul className="mt-0.5 ml-[0.6rem] space-y-0.5 border-l border-line pl-2">
          <li>
            <Link href={node.href} className={`${linkCls} text-xs`} aria-current={active ? "page" : undefined}>
              {node.doc ? "개요" : "전체 보기"}
            </Link>
          </li>
          {node.children.map((c) => (
            <Branch key={c.id} node={c} currentId={currentId} />
          ))}
        </ul>
      </details>
    </li>
  );
}
