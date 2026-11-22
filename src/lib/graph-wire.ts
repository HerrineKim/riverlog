import type { PlacedNode } from "./graph-layout";
import type { GraphLink } from "./knowledge-graph";

/**
 * The map has ~27k links, so spelling each one as two note paths made /knowledge a 3 MB page.
 * On the wire a link is [source index, target index, kind index] into the node list.
 * A node's href is always `base/id` and its color is its category's, so both are rebuilt
 * in the browser instead of repeated on ~1,000 nodes. This module runs on both sides,
 * so the base URL travels in the payload rather than being imported from the server-only vault.
 */
/** Served by app/knowledge/graph.json/route.ts. */
export const GRAPH_URL = "/knowledge/graph.json";

const KINDS: GraphLink["kind"][] = ["member", "related", "hub", "reference"];

type WireNode = Omit<PlacedNode, "href" | "color">;

export type PackedGraph = {
  base: string;
  colors: Record<string, string>;
  nodes: WireNode[];
  links: [number, number, number][];
};

export function packGraph({ nodes, links }: { nodes: PlacedNode[]; links: GraphLink[] }, base: string): PackedGraph {
  const index = new Map(nodes.map((n, i) => [n.id, i]));
  const colors: Record<string, string> = {};
  const wire = nodes.map(({ href, color, ...n }) => {
    if (href !== `${base}/${n.id}`) throw new Error(`graph-wire: ${n.id} has href ${href}, not ${base}/${n.id}`);
    if ((colors[n.category] ??= color) !== color) throw new Error(`graph-wire: category ${n.category} has two colors`);
    return n;
  });
  return { base, colors, nodes: wire, links: links.map((l) => [index.get(l.source)!, index.get(l.target)!, KINDS.indexOf(l.kind)]) };
}

export function unpackGraph({ base, colors, nodes: wire, links }: PackedGraph): { nodes: PlacedNode[]; links: GraphLink[] } {
  const nodes = wire.map((n) => ({ ...n, href: `${base}/${n.id}`, color: colors[n.category] }));
  return { nodes, links: links.map(([s, t, k]) => ({ source: nodes[s].id, target: nodes[t].id, kind: KINDS[k] })) };
}
