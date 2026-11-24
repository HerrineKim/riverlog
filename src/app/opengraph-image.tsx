import { ImageResponse } from "next/og";
import { riverMark } from "@/lib/river-mark";

// The default font only covers Latin, so the card stays in English
export const alt = "riverlog · River's blog and knowledge base";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", gap: 64, padding: 96, background: "#0a0e13" }}>
        <svg width="360" height="360" viewBox="0 0 256 256" fill="none">
          <path d={riverMark.regular} fill="#5eead4" />
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
