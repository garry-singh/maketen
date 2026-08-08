import React from "react";
import { cn } from "@/lib/utils";
import { GameConfig, formatStreakLimit } from "@/lib/games/config";
import { Streaks } from "@/lib/types";

interface StreakSummaryProps {
  game: GameConfig;
  streaks: Streaks;
  className?: string;
}

const StreakSummary: React.FC<StreakSummaryProps> = ({
  game,
  streaks,
  className,
}) => {
  const limit = formatStreakLimit(game.streakTimeLimit);

  return (
    <div className={cn("space-y-3 text-center", className)}>
      <p className="text-lg text-muted-foreground">
        Current Streak (under {limit}): {streaks.streak}
      </p>
      <p className="text-lg text-muted-foreground">
        Longest Streak (under {limit}): {streaks.longestStreak}
      </p>
    </div>
  );
};

export default StreakSummary;
