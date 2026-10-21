"use client";

import dynamic from "next/dynamic";
import { useMemo, type ComponentProps } from "react";
import { unpackGraph, type PackedGraph } from "@/lib/graph-wire";

const MindMapCanvas = dynamic(() => import("./MindMapCanvas"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full place-items-center text-sm text-muted">
      <span className="animate-pulse">지식의 별자리를 그리는 중…</span>
    </div>
  ),
});

type Props = Omit<ComponentProps<typeof import("./MindMapCanvas").default>, "data"> & { data: PackedGraph };

export default function MindMap({ data, ...rest }: Props) {
  const graph = useMemo(() => unpackGraph(data), [data]);
  return <MindMapCanvas data={graph} {...rest} />;
}
