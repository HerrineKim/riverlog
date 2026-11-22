"use client";

import dynamic from "next/dynamic";
import IntentLink from "@/components/IntentLink";
import { useEffect, useState, type ComponentProps, type ReactNode } from "react";
import { GRAPH_URL, unpackGraph, type PackedGraph } from "@/lib/graph-wire";

const Status = ({ children }: { children: ReactNode }) => (
  <div role="status" className="grid h-full place-items-center text-sm text-muted">
    {children}
  </div>
);

const Drawing = () => (
  <Status>
    <span className="animate-pulse">지식의 별자리를 그리는 중…</span>
  </Status>
);

const loadCanvas = () => import("./MindMapCanvas");
const MindMapCanvas = dynamic(loadCanvas, { ssr: false, loading: Drawing });

type Graph = ComponentProps<typeof import("./MindMapCanvas").default>["data"];
type Props = Omit<ComponentProps<typeof import("./MindMapCanvas").default>, "data">;

/** Loads the map data (see app/knowledge/graph.json) alongside the three.js chunk, then draws. */
export default function MindMap(props: Props) {
  const [graph, setGraph] = useState<Graph | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    // Start the three.js chunk now so it downloads alongside the data instead of after it
    void loadCanvas();
    const ctrl = new AbortController();
    fetch(GRAPH_URL, { signal: ctrl.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`${GRAPH_URL} ${r.status}`);
        return r.json() as Promise<PackedGraph>;
      })
      .then((data) => setGraph(unpackGraph(data)))
      .catch((e) => {
        if (!ctrl.signal.aborted) {
          console.error(e);
          setFailed(true);
        }
      });
    return () => ctrl.abort();
  }, []);

  if (failed)
    return (
      <Status>
        <span>
          지도를 불러오지 못했어요. 새로 고치거나 <IntentLink href="/knowledge/dictionary" className="text-accent underline">계층형 사전</IntentLink>에서 같은 노트를 보세요.
        </span>
      </Status>
    );
  if (!graph) return <Drawing />;
  return <MindMapCanvas data={graph} {...props} />;
}
