import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
import HomeLink from "@/components/game/HomeLink";
import { ALL_GAMES, formatStreakLimit } from "@/lib/games/config";
import { rulesFor, SHARED_RULES } from "@/lib/games/rules";
import { SITE_URL } from "@/lib/constants";
import type { Metadata } from "next";

const DESCRIPTION =
  "Rules for all three Make Ten puzzle modes, plus how the timer, streaks and stats work.";

export const metadata: Metadata = {
  title: "How to Play",
  description: DESCRIPTION,
  alternates: { canonical: "/how-to-play" },
  openGraph: {
    title: "How to Play | Make Ten",
    description: DESCRIPTION,
    url: `${SITE_URL}/how-to-play`,
  },
};

export default function HowToPlayPage() {
  return (
    <main className="flex flex-col items-center min-h-screen w-full px-4 py-16 lg:py-20">
      <HomeLink />
      <div className="fixed top-4 right-4">
        <ModeToggle />
      </div>

      <div className="w-full max-w-2xl">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold lg:text-5xl">How to play</h1>
          <p className="text-lg text-muted-foreground mt-3">{DESCRIPTION}</p>
        </header>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">The basics</h2>
          <dl className="space-y-5">
            {SHARED_RULES.map(({ title, body }) => (
              <div key={title}>
                <dt className="font-semibold">{title}</dt>
                <dd className="text-muted-foreground mt-1">{body}</dd>
              </div>
            ))}
          </dl>
        </section>

        <nav className="mb-12" aria-label="Jump to a mode">
          <h2 className="text-sm uppercase tracking-wide text-muted-foreground mb-3">
            The modes
          </h2>
          <ul className="flex flex-wrap gap-2">
            {ALL_GAMES.map((game) => (
              <li key={game.id}>
                <Link
                  href={`#${game.id}`}
                  className="inline-block px-3 py-1.5 rounded-lg border border-border text-sm hover:bg-accent transition-colors"
                >
                  {game.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {ALL_GAMES.map((game) => {
          const { objective, rules, example } = rulesFor(game);

          return (
            <section
              key={game.id}
              id={game.id}
              className="mb-12 scroll-mt-6 border-t border-border pt-8"
            >
              <h2 className="text-2xl font-semibold lg:text-3xl">
                {game.name}
              </h2>
              <p className="text-muted-foreground mt-2">{objective}</p>

              <h3 className="font-semibold mt-6 mb-2">Rules</h3>
              <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
                {rules.map((rule) => (
                  <li key={rule}>{rule}</li>
                ))}
              </ul>

              <h3 className="font-semibold mt-6 mb-2">Example</h3>
              <div className="p-4 rounded-lg bg-muted/50 font-mono text-sm space-y-1">
                {example.map((line) => (
                  <div key={line}>{line}</div>
                ))}
              </div>

              <h3 className="font-semibold mt-6 mb-2">Streak</h3>
              <p className="text-muted-foreground">
                Solve within {formatStreakLimit(game.streakTimeLimit)} to extend
                your {game.name} streak.
              </p>

              <Link
                href={game.path}
                className="inline-block mt-6 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
              >
                Play {game.name}
              </Link>
            </section>
          );
        })}

        <p className="text-center">
          <Link
            href="/"
            className="text-primary underline underline-offset-4"
          >
            Back to all games
          </Link>
        </p>
      </div>
    </main>
  );
}
