import { renderHomeOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-image";

// opengraph-image does not cascade into nested segments, so this route needs
// its own or shared links get no preview card at all
export const alt = "How to Play | Make Ten";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpengraphImage() {
  return renderHomeOgImage();
}
