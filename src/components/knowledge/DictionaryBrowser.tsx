"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import type { LiteNode } from "./types";

const CHO = ["ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
const BASE: Record<string, string> = { ㄲ: "ㄱ", ㄸ: "ㄷ", ㅃ: "ㅂ", ㅆ: "ㅅ", ㅉ: "ㅈ" };

function initialOf(title: string): string {
  const ch = title.trim().replace(/^[^\p{L}\p{N}]+/u, "")[0] ?? "#";
  const code = ch.charCodeAt(0);
  if (code >= 0xac00 && code <= 0xd7a3) {
    const c = CHO[Math.floor((code - 0xac00) / 588)];
    return BASE[c] ?? c;
  }
  if (/[a-z]/i.test(ch)) return ch.toUpperCase();
  return "#";
}

type Flat = { node: LiteNode; trail: string[] };

function flatten(n: LiteNode, trail: string[], out: Flat[]) {
  if (n.isDoc && n.depth > 0) out.push({ node: n, trail });
  n.children.forEach((c) => flatten(c, n.depth > 0 ? [...trail, n.name] : trail, out));
  return out;
}

export default function DictionaryBrowser({ tree }: { tree: LiteNode }) {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"tree" | "index">("tree");
  const q = useDeferredValue(query.trim().toLowerCase());

  const all = useMemo(() => flatten(tree, [], []), [tree]);
  const matches = useMemo(() => {
    if (!q) return null;
    return new Set(
      all
        .filter(({ node, trail }) =>
          [node.name, node.excerpt ?? "", node.tags.join(" "), trail.join(" ")].join(" ").toLowerCase().includes(q),
        )
        .map((f) => f.node.id),
    );
  }, [all, q]);

  const visible = (n: LiteNode): boolean =>
    !matches || matches.has(n.id) || n.children.some((c) => visible(c));

  const index = useMemo(() => {
    const groups = new Map<string, Flat[]>();
    for (const f of all) {
      if (matches && !matches.has(f.node.id)) continue;
      const k = initialOf(f.node.name);
      groups.set(k, [...(groups.get(k) ?? []), f]);
    }
    const order = (k: string) => (CHO.includes(k) ? 0 : /[A-Z]/.test(k) ? 1 : 2);
    return [...groups.entries()]
      .sort(([a], [b]) => order(a) - order(b) || a.localeCompare(b, "ko"))
      .map(([k, v]) => [k, v.sort((x, y) => x.node.name.localeCompare(y.node.name, "ko", { numeric: true }))] as const);
  }, [all, matches]);

  const resultCount = matches ? matches.size : all.length;

  return (
    <div>
      <div className="sticky top-14 z-20 -mx-4 flex flex-wrap items-center gap-3 border-b border-line/70 bg-bg/85 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">노트 검색</span>
          <svg viewBox="0 0 24 24" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="용어, 주제, 태그로 찾기…"
            className="w-full rounded-full border border-line bg-bg-elev py-2 pr-4 pl-9 text-sm text-fg-strong outline-none placeholder:text-muted focus:border-accent"
          />
        </label>
        <div className="inline-flex rounded-full border border-line p-0.5 text-sm" role="tablist">
          {(
            [
              ["tree", "분야별"],
              ["index", "가나다·ABC"],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              role="tab"
              aria-selected={mode === k}
              onClick={() => setMode(k)}
              className={`rounded-full px-3 py-1 transition ${mode === k ? "bg-bg-elev text-fg-strong shadow-sm ring-1 ring-line" : "text-muted hover:text-fg"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <span className="text-xs text-muted tabular-nums">{resultCount}개 항목</span>
      </div>

      {resultCount === 0 && <p className="py-16 text-center text-muted">“{query}”에 해당하는 노트가 없어요.</p>}

      {mode === "tree" ? (
        <div className="mt-8 space-y-14">
          {tree.children.filter(visible).map((cat) => (
            <section key={cat.id} id={`cat-${cat.id}`} className="scroll-mt-32">
              <header className="flex items-baseline gap-3 border-b border-line pb-3">
                <span className="size-2.5 translate-y-[-2px] rounded-full" style={{ background: cat.color, boxShadow: `0 0 12px ${cat.color}` }} />
                <h2 className="text-2xl font-bold text-fg-strong">
                  <Link href={cat.href} className="hover:text-accent">
                    {cat.name}
                  </Link>
                </h2>
                <span className="text-sm text-muted tabular-nums">{cat.docCount}</span>
              </header>
              {cat.excerpt && <p className="mt-3 text-sm text-muted">{cat.excerpt}</p>}
              <Entries nodes={cat.children} visible={visible} level={0} />
            </section>
          ))}
        </div>
      ) : (
        <div className="mt-8">
          <nav className="mb-8 flex flex-wrap gap-1.5">
            {index.map(([k]) => (
              <a key={k} href={`#idx-${k}`} className="grid size-8 place-items-center rounded-md border border-line text-sm text-muted hover:border-accent hover:text-accent">
                {k}
              </a>
            ))}
          </nav>
          <div className="space-y-10">
            {index.map(([k, items]) => (
              <section key={k} id={`idx-${k}`} className="scroll-mt-32">
                <h2 className="mb-3 font-display text-4xl text-accent">{k}</h2>
                <dl className="divide-y divide-line/60">
                  {items.map(({ node, trail }) => (
                    <div key={node.id} className="grid gap-1 py-3 sm:grid-cols-[minmax(0,16rem)_1fr] sm:gap-6">
                      <dt>
                        <Link href={node.href} className="font-medium text-fg-strong hover:text-accent">
                          {node.name}
                        </Link>
                        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
                          <span className="size-1.5 rounded-full" style={{ background: node.color }} />
                          {trail.join(" › ")}
                        </p>
                      </dt>
                      <dd className="line-clamp-2 text-sm text-muted">{node.excerpt}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Entries({ nodes, visible, level }: { nodes: LiteNode[]; visible: (n: LiteNode) => boolean; level: number }) {
  const docs = nodes.filter((n) => n.children.length === 0 && visible(n));
  const groups = nodes.filter((n) => n.children.length > 0 && visible(n));
  return (
    <div className={level === 0 ? "mt-5" : "mt-3"}>
      {docs.length > 0 && (
        <dl className="grid gap-x-8 sm:grid-cols-2">
          {docs.map((d) => (
            <div key={d.id} className="border-b border-line/50 py-3">
              <dt>
                <Link href={d.href} className="font-medium text-fg-strong decoration-accent underline-offset-4 hover:text-accent hover:underline">
                  {d.name}
                </Link>
              </dt>
              {d.excerpt && <dd className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted">{d.excerpt}</dd>}
            </div>
          ))}
        </dl>
      )}
      {groups.map((g) => (
        <div key={g.id} className={`mt-7 ${level > 0 ? "border-l border-line pl-4" : ""}`}>
          <h3 className={`flex items-baseline gap-2 font-semibold text-fg-strong ${level === 0 ? "text-lg" : "text-base"}`}>
            <Link href={g.href} className="hover:text-accent">
              {g.name}
            </Link>
            <span className="text-xs font-normal text-muted tabular-nums">{g.docCount}</span>
          </h3>
          {g.excerpt && <p className="mt-1 line-clamp-2 text-sm text-muted">{g.excerpt}</p>}
          <Entries nodes={g.children} visible={visible} level={level + 1} />
        </div>
      ))}
    </div>
  );
}
