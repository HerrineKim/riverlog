import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const wave = (y: number) => `M30 ${y}c14-14 28 14 60 0s46 14 60 0`;

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#0a0e13" }}>
        <svg width="180" height="180" viewBox="0 0 180 180" fill="none">
          {[64, 92, 120].map((y, i) => (
            <path key={y} d={wave(y)} stroke="#5eead4" strokeWidth="13" strokeLinecap="round" opacity={[1, 0.65, 0.35][i]} />
          ))}
        </svg>
      </div>
    ),
    size,
  );
}
