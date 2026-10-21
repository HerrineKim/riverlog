import type { PlacedNode } from "./graph-layout";
import type { GraphLink } from "./knowledge";

/**
 * The map has ~20k links, so spelling each one as two note paths made /knowledge a 3 MB page.
 * On the wire a link is [source index, target index, kind index] into the node list.
 */
const KINDS: GraphLink["kind"][] = ["member", "related", "hub", "reference"];

export type PackedGraph = { nodes: PlacedNode[]; links: [number, number, number][] };

export function packGraph({ nodes, links }: { nodes: PlacedNode[]; links: GraphLink[] }): PackedGraph {
  const index = new Map(nodes.map((n, i) => [n.id, i]));
  return { nodes, links: links.map((l) => [index.get(l.source)!, index.get(l.target)!, KINDS.indexOf(l.kind)]) };
}

export function unpackGraph({ nodes, links }: PackedGraph): { nodes: PlacedNode[]; links: GraphLink[] } {
  return { nodes, links: links.map(([s, t, k]) => ({ source: nodes[s].id, target: nodes[t].id, kind: KINDS[k] })) };
}
