import { ImageResponse } from "next/og";
import { riverMark } from "@/lib/river-mark";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0e13" }}>
        <svg width="140" height="140" viewBox="0 0 256 256" fill="none">
          <path d={riverMark.small} fill="#5eead4" />
        </svg>
      </div>
    ),
    size,
  );
}
