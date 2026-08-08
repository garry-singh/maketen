import React from "react";
import { cn } from "@/lib/utils";
import { GameConfig, formatStreakLimit } from "@/lib/games/config";
import { GameStats } from "@/lib/games/use-game-state";
import { Streaks } from "@/lib/types";

interface StatsSummaryProps {
  game: GameConfig;
  streaks: Streaks;
  stats: GameStats;
  className?: string;
}

const Tile = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col items-center min-w-[4.5rem]">
    <span className="text-2xl font-bold tabular-nums">{value}</span>
    <span className="text-xs text-muted-foreground text-center">{label}</span>
  </div>
);

const StatsSummary: React.FC<StatsSummaryProps> = ({
  game,
  streaks,
  stats,
  className,
}) => {
  const winRate =
    stats.played > 0 ? Math.round((stats.solved / stats.played) * 100) : 0;

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-4">
        <Tile label="Played" value={String(stats.played)} />
        <Tile label="Solved" value={String(stats.solved)} />
        <Tile label="Win %" value={`${winRate}`} />
        <Tile label="Current streak" value={String(streaks.streak)} />
        <Tile label="Longest streak" value={String(streaks.longestStreak)} />
        <Tile
          label="Best time"
          value={stats.bestTime === null ? "—" : `${stats.bestTime.toFixed(1)}s`}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Streaks need a solve within {formatStreakLimit(game.streakTimeLimit)}
      </p>
    </div>
  );
};

export default StatsSummary;
