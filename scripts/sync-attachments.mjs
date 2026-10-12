// Copies the Obsidian vault's attachments (content/attachments) to public/attachments so Next serves them.
import fs from "node:fs";

const from = "content/attachments";
const to = "public/attachments";

fs.rmSync(to, { recursive: true, force: true });
if (fs.existsSync(from)) fs.cpSync(from, to, { recursive: true, filter: (src) => !src.split("/").pop().startsWith(".") });
