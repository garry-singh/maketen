import { ImageResponse } from "next/og";

// iOS home-screen icons must be raster, so this one is generated rather than
// reusing public/icon.svg
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          color: "#fafafa",
          fontSize: 88,
          fontWeight: 700,
          fontFamily: "sans-serif",
        }}
      >
        10
      </div>
    ),
    size
  );
}
