import { useMemo } from "react";
import type { PlacedNode } from "@/lib/graph-layout";
import type { GraphLink } from "@/lib/knowledge-graph";

export type Connection = { node: PlacedNode; kind: "reference" | "related" };

/** Lookups the map UI needs over one graph: nodes by id, neighbors, note-to-note connections and hub members. */
export default function useGraphIndex(data: { nodes: PlacedNode[]; links: GraphLink[] }) {
  const byId = useMemo(() => new Map(data.nodes.map((n) => [n.id, n])), [data]);

  const neighbors = useMemo(() => {
    const m = new Map<string, Set<string>>();
    for (const l of data.links) {
      if (!m.has(l.source)) m.set(l.source, new Set());
      if (!m.has(l.target)) m.set(l.target, new Set());
      m.get(l.source)!.add(l.target);
      m.get(l.target)!.add(l.source);
    }
    return m;
  }, [data]);

  // Note-to-note connections for the info card: explicit links first, then shared tags
  const connectionsOf = useMemo(() => {
    const m = new Map<string, Connection[]>();
    const add = (a: string, b: string, kind: Connection["kind"]) => {
      const node = byId.get(b);
      if (node) m.set(a, [...(m.get(a) ?? []), { node, kind }]);
    };
    for (const l of data.links)
      if (l.kind === "reference" || l.kind === "related") {
        add(l.source, l.target, l.kind);
        add(l.target, l.source, l.kind);
      }
    for (const list of m.values()) list.sort((x, y) => (x.kind === y.kind ? 0 : x.kind === "reference" ? -1 : 1));
    return m;
  }, [data, byId]);

  const childrenOf = useMemo(() => {
    const m = new Map<string, PlacedNode[]>();
    for (const l of data.links)
      if (l.kind === "member") m.set(l.source, [...(m.get(l.source) ?? []), byId.get(l.target)!]);
    return m;
  }, [data, byId]);

  return { byId, neighbors, connectionsOf, childrenOf };
}
