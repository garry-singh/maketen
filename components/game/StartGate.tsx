import React from "react";
import { Button } from "@/components/ui/button";
import { GameConfig, formatStreakLimit } from "@/lib/games/config";

interface StartGateProps {
  game: GameConfig;
  /** What the player will be shown once the clock is running */
  reveals: string;
  onStart: () => void;
}

/**
 * Holds the puzzle back until the player is ready.
 *
 * The puzzle is not rendered at all behind this gate - if it were merely
 * hidden, a player could read it off the page and solve it before starting the
 * clock, which would time their typing rather than their thinking.
 */
const StartGate: React.FC<StartGateProps> = ({ game, reveals, onStart }) => (
  <div className="flex flex-col items-center text-center gap-6 my-10 lg:my-16">
    <div className="space-y-2">
      <p className="text-xl text-muted-foreground lg:text-2xl">
        Ready? The clock starts as soon as you press Start.
      </p>
      <p className="text-base text-muted-foreground">
        You&apos;ll see {reveals}. Solve within{" "}
        {formatStreakLimit(game.streakTimeLimit)} to keep your streak.
      </p>
    </div>
    <Button
      size="lg"
      onClick={onStart}
      autoFocus
      className="h-14 px-12 text-xl"
    >
      Start
    </Button>
  </div>
);

export default StartGate;
