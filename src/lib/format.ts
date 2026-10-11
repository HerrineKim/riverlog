export function formatDate(iso?: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.slice(0, 10).split("-");
  return d ? `${y}. ${Number(m)}. ${Number(d)}.` : iso;
}
