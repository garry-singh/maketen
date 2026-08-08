import MakeX from "@/components/make-x/MakeX";
import { generateDailyMakeXPuzzle } from "@/lib/make-x/puzzle-generator";
import { MAKE_X_GAME, gameUrl } from "@/lib/games/config";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Make X",
  description: "A daily arithmetic puzzle game",
  alternates: { canonical: MAKE_X_GAME.path },
  openGraph: {
    title: `${MAKE_X_GAME.name} - ${MAKE_X_GAME.tagline}`,
    description: "A daily arithmetic puzzle game",
    url: gameUrl(MAKE_X_GAME),
  },
};

// Puzzles roll over at midnight UTC; revalidating keeps the static page in step
// without rebuilding, and keeps the puzzle catalogue out of the client bundle.
export const revalidate = 60;

export default function MakeXPage() {
  return <MakeX puzzle={generateDailyMakeXPuzzle()} />;
}
