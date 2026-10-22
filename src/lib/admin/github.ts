/**
 * The site is built from the repo's markdown, so admin edits are commits: saving a book writes its file
 * through the GitHub contents API, and the push redeploys the site a few minutes later.
 * Needs GITHUB_TOKEN (a fine-grained token with Contents: read and write on this repo).
 */
const REPO = process.env.GITHUB_REPO ?? "HerrineKim/riverlog";
const BRANCH = process.env.GITHUB_BRANCH ?? "main";

export class GitHubError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function api(path: string, init: RequestInit = {}, query = "") {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new GitHubError("GITHUB_TOKEN이 설정되지 않았습니다.", 500);
  const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${path.split("/").map(encodeURIComponent).join("/")}${query}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...init.headers,
    },
    cache: "no-store",
  });
  if (!res.ok && res.status !== 404) {
    const detail = await res.text().catch(() => "");
    throw new GitHubError(`GitHub API ${res.status}: ${detail.slice(0, 200)}`, res.status === 409 ? 409 : 502);
  }
  return res;
}

export type RepoFile = { text: string; sha: string };

export async function readFile(path: string): Promise<RepoFile | undefined> {
  const res = await api(path, {}, `?ref=${BRANCH}`);
  if (res.status === 404) return undefined;
  const json = (await res.json()) as { content: string; sha: string };
  return { text: Buffer.from(json.content, "base64").toString("utf8"), sha: json.sha };
}

/** Creates the file when `sha` is undefined; otherwise updates it, failing with 409 if it changed meanwhile. */
export async function writeFile(path: string, text: string, message: string, sha?: string) {
  await api(path, {
    method: "PUT",
    body: JSON.stringify({ message, content: Buffer.from(text, "utf8").toString("base64"), branch: BRANCH, ...(sha ? { sha } : {}) }),
  });
}

export async function deleteFile(path: string, message: string, sha: string) {
  await api(path, { method: "DELETE", body: JSON.stringify({ message, sha, branch: BRANCH }) });
}
