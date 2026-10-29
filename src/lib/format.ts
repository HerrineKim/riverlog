// UTC on both sides, so a date-only string never shifts a day between the build server and the browser
const dateFormat = new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "numeric", day: "numeric", timeZone: "UTC" });

export function formatDate(iso?: string): string {
  if (!iso) return "";
  const day = iso.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(day) ? dateFormat.format(new Date(`${day}T00:00:00Z`)) : iso;
}
