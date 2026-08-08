import MakeExactOps from "@/components/make-exact-operations/MakeExactOps";
import { generateDailyExactOpsPuzzle } from "@/lib/make-exact-operations/puzzle-generator";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Make Exact Operations",
  description:
    "A daily arithmetic puzzle game where you need to find the correct operators",
};

// Puzzles roll over at midnight UTC; revalidating keeps the static page in step
// without rebuilding, and keeps the puzzle catalogue out of the client bundle.
export const revalidate = 60;

export default function MakeExactOpsPage() {
  return <MakeExactOps puzzle={generateDailyExactOpsPuzzle()} />;
}
