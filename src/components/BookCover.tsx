/**
 * A book's cover thumbnail. Most books have no cover image yet, so those get a typeset card instead:
 * title and author on a color picked from the title, so the same book always looks the same.
 */
export default function BookCover({ title, author, cover, className = "" }: { title: string; author?: string; cover?: string; className?: string }) {
  const base = `relative aspect-[2/3] overflow-hidden rounded-md border border-line shadow-sm ${className}`;
  if (cover) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={cover} alt="" loading="lazy" decoding="async" className={`${base} object-cover`} />;
  }
  let hash = 0;
  for (const ch of title) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  const hue = hash % 360;
  return (
    // The card is its own size container, so padding and type scale with the card (cqw), not the page
    <div aria-hidden className={`${base} [container-type:inline-size]`} style={{ background: `linear-gradient(160deg, hsl(${hue} 38% 30%), hsl(${(hue + 40) % 360} 42% 22%))` }}>
      <span className="absolute inset-y-0 left-[6%] w-px bg-white/15" />
      <div className="absolute inset-0 flex flex-col justify-between p-[9cqw] pl-[13cqw] text-white">
        <p className="line-clamp-5 text-[max(0.6rem,9cqw)] leading-snug font-semibold break-keep">{title}</p>
        {author && <p className="line-clamp-2 text-[max(0.55rem,6.5cqw)] leading-snug text-white/90">{author}</p>}
      </div>
    </div>
  );
}
