import { ImageResponse } from "next/og";

// The default font only covers Latin, so the card stays in English
export const alt = "riverlog — River's blog and knowledge base";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const wave = (y: number) => `M60 ${y}c60-60 120 60 240 0s180 60 240 0`;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", gap: 64, padding: 96, background: "#0a0e13" }}>
        <svg width="360" height="360" viewBox="0 0 600 360" fill="none">
          {[100, 180, 260].map((y, i) => (
            <path key={y} d={wave(y)} stroke="#5eead4" strokeWidth="28" strokeLinecap="round" opacity={[1, 0.65, 0.35][i]} />
          ))}
        </svg>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 112, color: "#f8fafc", letterSpacing: -2 }}>riverlog</div>
          <div style={{ fontSize: 40, color: "#8a9aad" }}>River&apos;s blog &amp; knowledge base</div>
        </div>
      </div>
    ),
    size,
  );
}
