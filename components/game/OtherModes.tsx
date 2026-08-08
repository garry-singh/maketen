"use client";

import React from "react";
import Link from "next/link";
import { ALL_GAMES, GameConfig } from "@/lib/games/config";
import { useGameStatuses } from "@/lib/games/use-game-statuses";

interface OtherModesProps {
  /** The mode the player is currently on, which is left out of the list */
  current: GameConfig;
}

const OtherModes: React.FC<OtherModesProps> = ({ current }) => {
  const others = ALL_GAMES.filter((game) => game.id !== current.id);
  const statuses = useGameStatuses(others);

  return (
    <nav className="w-full max-w-2xl px-4 pb-12" aria-label="Other game modes">
      <h2 className="text-sm uppercase tracking-wide text-muted-foreground mb-3 text-center">
        Other modes
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {others.map((game) => {
          const status = statuses[game.id];
          return (
            <Link
              key={game.id}
              href={game.path}
              className="p-4 rounded-lg border border-border bg-background hover:bg-accent transition-colors"
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-semibold">{game.name}</span>
                {status?.doneToday && (
                  <span className="text-xs text-green-600 dark:text-green-500">
                    done today
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{game.tagline}</p>
              {status && status.streak > 0 && (
                <p className="text-sm mt-1">🔥 {status.streak} day streak</p>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default OtherModes;
