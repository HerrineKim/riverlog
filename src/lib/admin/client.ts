/** Browser-side calls to the admin API; throws the server's message on failure. */
export async function adminFetch<T = unknown>(url: string, init: { method: string; body?: unknown }): Promise<T> {
  const res = await fetch(url, {
    method: init.method,
    headers: init.body === undefined ? undefined : { "Content-Type": "application/json" },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? `요청에 실패했습니다 (${res.status}).`);
  return data as T;
}

export const DEPLOY_NOTE = "저장했습니다. 사이트에 반영되기까지 3~4분 걸립니다.";
