"use client";

import Link from "next/link";
import { useState } from "react";
import type { NavNode } from "./types";

const isOnPath = (node: NavNode, currentHref?: string) =>
  !!currentHref && (currentHref === node.href || currentHref.startsWith(`${node.href}/`));

/**
 * Collapsible tree. Branches on the path to `currentHref` start open, and a closed branch renders
 * none of its children, so every note page doesn't carry 800 hidden links.
 */
export default function TreeNav({ tree, currentHref }: { tree: NavNode; currentHref?: string }) {
  return (
    <nav aria-label="지식 창고 목차" className="text-sm">
      <ul className="space-y-1">
        {tree.children?.map((c) => (
          <Branch key={c.href} node={c} depth={1} currentHref={currentHref} />
        ))}
      </ul>
    </nav>
  );
}

function Branch({ node, depth, currentHref }: { node: NavNode; depth: number; currentHref?: string }) {
  const active = node.href === currentHref;
  const onPath = isOnPath(node, currentHref);
  const [open, setOpen] = useState(onPath);
  // Navigating to a note inside a closed branch opens it; branches the reader opened stay open
  const [wasOnPath, setWasOnPath] = useState(onPath);
  if (onPath !== wasOnPath) {
    setWasOnPath(onPath);
    if (onPath) setOpen(true);
  }

  const linkCls = `block truncate rounded-md px-2 py-1 transition ${
    active ? "bg-accent-soft font-medium text-accent" : "text-muted hover:bg-bg-elev hover:text-fg-strong"
  }`;

  if (!node.children) {
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
      <details open={open} onToggle={(e) => setOpen(e.currentTarget.open)} className="group/branch">
        <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-md px-1 py-1 text-fg hover:bg-bg-elev [&::-webkit-details-marker]:hidden">
          <svg viewBox="0 0 16 16" className="size-3 shrink-0 text-muted transition group-open/branch:rotate-90" fill="currentColor">
            <path d="M6 3.5 10.5 8 6 12.5z" />
          </svg>
          {node.color && <span className="size-2 shrink-0 rounded-full" style={{ background: node.color }} />}
          <span className={`truncate ${depth === 1 ? "font-semibold text-fg-strong" : ""} ${active ? "text-accent" : ""}`}>
            {node.name}
          </span>
          <span className="ml-auto pl-2 text-xs text-muted tabular-nums">{node.docCount}</span>
        </summary>
        {open && (
          <ul className="mt-0.5 ml-[0.6rem] space-y-0.5 border-l border-line pl-2">
            <li>
              <Link href={node.href} className={`${linkCls} text-xs`} aria-current={active ? "page" : undefined}>
                {node.isDoc ? "개요" : "전체 보기"}
              </Link>
            </li>
            {node.children.map((c) => (
              <Branch key={c.href} node={c} depth={depth + 1} currentHref={currentHref} />
            ))}
          </ul>
        )}
      </details>
    </li>
  );
}
