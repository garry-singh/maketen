import { MAKE_EXACT_OPS_GAME } from "@/lib/games/config";
import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-image";

export const alt = `${MAKE_EXACT_OPS_GAME.name} - ${MAKE_EXACT_OPS_GAME.tagline}`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpengraphImage() {
  return renderOgImage(MAKE_EXACT_OPS_GAME);
}
