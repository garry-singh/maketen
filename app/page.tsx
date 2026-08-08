import Link from "next/link";
import GameList from "@/components/home/GameList";
import { ModeToggle } from "@/components/mode-toggle";
import { SITE_URL } from "@/lib/constants";
import type { Metadata } from "next";

const DESCRIPTION =
  "Three daily arithmetic puzzles. Pick a mode, beat the clock, keep your streak.";

export const metadata: Metadata = {
  title: "Daily Puzzle Games",
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: "Make Ten - Daily Puzzle Games",
    description: DESCRIPTION,
    url: SITE_URL,
  },
};

export default function Home() {
  return (
    <main className="flex flex-col items-center min-h-screen w-full px-4 py-16 lg:py-24">
      <div className="fixed top-4 right-4">
        <ModeToggle />
      </div>

      <header className="text-center mb-10 lg:mb-14">
        <h1 className="text-4xl font-bold lg:text-6xl">Make Ten</h1>
        <p className="text-lg text-muted-foreground mt-3 lg:text-xl">
          {DESCRIPTION}
        </p>
        <Link
          href="/how-to-play"
          className="inline-block mt-6 px-5 py-2.5 rounded-lg border border-border font-medium hover:bg-accent transition-colors"
        >
          How to play
        </Link>
      </header>

      <GameList />
    </main>
  );
}
