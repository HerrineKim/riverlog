import { forceCenter, forceLink, forceManyBody, forceSimulation } from "d3-force-3d";
import type { GraphLink, GraphNode } from "@/lib/knowledge";

export type PlacedNode = GraphNode & { x: number; y: number; z: number };

const LINK_DISTANCE: Record<GraphLink["kind"], number> = { hub: 150, related: 60, reference: 50, member: 38 };

/**
 * Settles the force layout once, at build time, so the browser only draws.
 * d3-force-3d seeds its own LCG, so the same notes always land in the same place.
 */
export function placeGraph({ nodes, links }: { nodes: GraphNode[]; links: GraphLink[] }): {
  nodes: PlacedNode[];
  links: GraphLink[];
} {
  const sim = nodes.map((n) => ({ id: n.id }) as { id: string; x?: number; y?: number; z?: number });
  forceSimulation(sim, 3)
    .force(
      "link",
      forceLink(links.map((l) => ({ ...l }))).id((n) => n.id).distance((l) => LINK_DISTANCE[l.kind]),
    )
    .force("charge", forceManyBody().strength(-45))
    .force("center", forceCenter())
    .stop()
    .tick(300);

  const round = (v = 0) => Math.round(v * 10) / 10;
  return { nodes: nodes.map((n, i) => ({ ...n, x: round(sim[i].x), y: round(sim[i].y), z: round(sim[i].z) })), links };
}
