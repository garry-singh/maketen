import MakeX from "@/components/make-x/MakeX";
import { generateDailyMakeXPuzzle } from "@/lib/make-x/puzzle-generator";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Make X",
  description: "A daily arithmetic puzzle game",
};

// Puzzles roll over at midnight UTC; revalidating keeps the static page in step
// without rebuilding, and keeps the puzzle catalogue out of the client bundle.
export const revalidate = 60;

export default function MakeXPage() {
  return <MakeX puzzle={generateDailyMakeXPuzzle()} />;
}
