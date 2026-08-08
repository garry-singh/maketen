"use client";

import React from "react";
import Link from "next/link";
import { ALL_GAMES, formatStreakLimit } from "@/lib/games/config";
import { useGameStatuses } from "@/lib/games/use-game-statuses";

/**
 * The homepage list of modes, annotated with each one's streak and whether
 * today's puzzle is still outstanding.
 */
const GameList = () => {
  const statuses = useGameStatuses(ALL_GAMES);

  return (
    <ul className="w-full max-w-2xl grid gap-4">
      {ALL_GAMES.map((game) => {
        const status = statuses[game.id];

        return (
          <li key={game.id}>
            <Link
              href={game.path}
              className="block p-5 rounded-xl border border-border bg-background hover:bg-accent hover:border-accent transition-colors"
            >
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-xl font-semibold lg:text-2xl">
                  {game.name}
                </h2>
                {status?.doneToday ? (
                  <span className="text-sm text-green-600 dark:text-green-500 shrink-0">
                    ✓ done today
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground shrink-0">
                    Play today&apos;s
                  </span>
                )}
              </div>
              <p className="text-muted-foreground mt-1">{game.tagline}</p>
              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                {status && status.streak > 0 && (
                  <span className="text-foreground">
                    🔥 {status.streak} day streak
                  </span>
                )}
                <span>
                  Streak needs a solve under{" "}
                  {formatStreakLimit(game.streakTimeLimit)}
                </span>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
};

export default GameList;
