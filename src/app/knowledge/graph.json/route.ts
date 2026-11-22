import { placeGraph } from "@/lib/graph-layout";
import { packGraph } from "@/lib/graph-wire";
import { getGraphData } from "@/lib/knowledge-graph";
import { KNOWLEDGE_BASE } from "@/lib/vault";

/**
 * The mind map's nodes and links as a static file. Inlined into /knowledge they were ~1 MB, sent twice
 * (HTML and RSC payload) and prefetched by every page that links to the map; as a file the browser
 * fetches it only when the map opens and can revalidate it with an ETag.
 */
export const dynamic = "force-static";

export function GET() {
  return Response.json(packGraph(placeGraph(getGraphData()), KNOWLEDGE_BASE));
}
