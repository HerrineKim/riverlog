import { slug } from "github-slugger";
import type { Image, Link, PhrasingContent, Root } from "mdast";
import { findAndReplace } from "mdast-util-find-and-replace";
import { visit } from "unist-util-visit";
import { resolveAttachment, resolveNote, safeDecode } from "./vault";

// [[note]], [[note|label]], [[note#heading]], ![[image.png]], ![[file.pdf]]. `\|` is how Obsidian escapes the pipe inside tables.
const WIKILINK = /(!?)\[\[([^\]|\n]+?)(?:\\?\|([^\]\n]+))?\]\]/g;
const IMAGE_EXT = /\.(png|jpe?g|gif|webp|svg|avif)$/i;

function wikiNode(bang: string, rawTarget: string, alias?: string): PhrasingContent {
  const [name, heading] = rawTarget.replace(/\\$/, "").trim().split("#");
  const fallback = heading && !name ? heading : name.split("/").pop()!.replace(/\.md$/, "");
  const text = (value: string): Link["children"] => [{ type: "text", value }];

  const file = resolveAttachment(name);
  if (file) {
    if (bang && IMAGE_EXT.test(name)) return { type: "image", url: file, alt: alias?.trim() ?? "" } satisfies Image;
    return { type: "link", url: file, children: text(alias?.trim() || fallback) } satisfies Link;
  }

  const hash = heading ? `#${slug(heading)}` : "";
  if (!name) return { type: "link", url: hash, children: text(alias?.trim() || fallback) } satisfies Link;
  const note = resolveNote(name);
  // Unpublished or missing notes render as plain text, the way Obsidian greys out unresolved links
  if (!note) return { type: "text", value: alias?.trim() || fallback };
  const label = alias?.trim() || (heading ? `${note.title} › ${heading}` : note.title);
  return { type: "link", url: `${note.href}${hash}`, children: text(label) } satisfies Link;
}

/** Renders Obsidian wikilinks and points relative attachment paths at /attachments. Code blocks are left alone. */
export function remarkObsidian() {
  return (tree: Root) => {
    findAndReplace(tree, [[WIKILINK, (_: string, bang: string, target: string, alias?: string) => wikiNode(bang, target, alias)]]);
    visit(tree, ["link", "image"], (node) => {
      const n = node as Link | Image;
      if (/^[a-z]+:|^\/|^#/i.test(n.url) || !/(^|\/)attachments\//.test(n.url)) return;
      const url = safeDecode(n.url);
      const resolved = resolveAttachment(url.slice(url.indexOf("attachments/")));
      if (resolved) n.url = resolved;
    });
  };
}
