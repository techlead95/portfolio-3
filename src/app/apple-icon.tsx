import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Home-screen icon: the favicon's LR monogram, full-bleed (iOS rounds the corners). */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#c8f560" }}>
        <svg width="180" height="180" viewBox="0 0 64 64">
          <path fill="#0a0b0d" d="M12 16h7v25h11v7H12z" />
          <path
            fill="#0a0b0d"
            fillRule="evenodd"
            d="M33 16h11c5.5 0 9 3.6 9 8.8 0 4.1-2.2 7.1-5.7 8.3L53.5 48h-7.7l-5.4-14H40v14h-7zm7 6.4v5.2h3.6c1.7 0 2.6-1 2.6-2.6s-.9-2.6-2.6-2.6z"
          />
        </svg>
      </div>
    ),
    size,
  );
}
