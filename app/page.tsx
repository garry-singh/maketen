import MakeTen from "@/components/make-ten/MakeTen";
import { generateDailyPuzzle } from "@/lib/make-ten/puzzle-generator";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Make Ten",
  description: "A daily number puzzle game where you make 10",
};

// Puzzles roll over at midnight UTC; revalidating keeps the static page in step
// without rebuilding, and keeps the puzzle catalogue out of the client bundle.
export const revalidate = 60;

export default function Home() {
  return <MakeTen puzzle={generateDailyPuzzle()} />;
}
