"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
import ShareOptions from "@/components/ShareOptions";
import LocalStorageDebugger from "@/components/game/LocalStorageDebugger";
import StatsSummary from "@/components/game/StatsSummary";
import StartGate from "@/components/game/StartGate";
import HomeLink from "@/components/game/HomeLink";
import RevealedAnswer from "@/components/game/RevealedAnswer";
import OtherModes from "@/components/game/OtherModes";
import GiveUpButton from "@/components/game/GiveUpButton";
import InfoDialog from "@/components/game/InfoDialog";
import DragDropBuilder from "./DragDropBuilder";
import { cn } from "@/lib/utils";
import { ExpressionItem } from "@/lib/make-x/interfaces";
import { getNextPuzzleTime } from "@/lib/date-utils";
import { MakeXPuzzle } from "@/lib/types";
import { DEBUG_MODE } from "@/lib/constants";
import { MAKE_X_GAME, MAKE_TEN_GAME, gameUrl } from "@/lib/games/config";
import { useGameState } from "@/lib/games/use-game-state";
import { useSecureTimer } from "@/lib/games/use-secure-timer";
import { buildShareText } from "@/lib/games/share-text";
import { puzzleNumber } from "@/lib/games/daily-puzzle";
import { useClientValue } from "@/lib/use-client-value";
import { tryEvaluateArithmetic } from "@/lib/expression-eval";

interface MakeXProps {
  /** Today's puzzle, resolved on the server */
  puzzle: MakeXPuzzle;
}

export default function MakeX({ puzzle }: MakeXProps) {
  // Depends on the visitor's time zone, so it can only be resolved in the browser
  const localResetTime = useClientValue(
    () => getNextPuzzleTime().formattedString,
    ""
  );

  const [expression, setExpression] = useState<ExpressionItem[]>([]);
  const [trackedUsage, setUsedNumbers] = useState<boolean[]>([]);
  const [enteredExpression, setFullExpression] = useState<string | null>(null);

  const {
    streaks,
    stats,
    solved,
    revealed,
    solveTime,
    solvePuzzle,
    revealAnswer,
    resetGameState,
    lastSolution,
  } = useGameState(MAKE_X_GAME);

  const { hasStarted, startTimer, getElapsedTime } = useSecureTimer(MAKE_X_GAME, solved);

  // The day is over once the puzzle is solved or the answer has been revealed
  const finished = solved || revealed;
  const playing = hasStarted && !finished;

  // Until the player uses a number, every slot in today's puzzle is unused
  const usedNumbers =
    trackedUsage.length === puzzle.numbers.length
      ? trackedUsage
      : new Array<boolean>(puzzle.numbers.length).fill(false);

  // A solved puzzle falls back to the solution stored from an earlier visit
  const fullExpression = enteredExpression ?? (solved ? lastSolution : "");

  const handleSolve = (exprStr: string) => {
    const timeElapsed = getElapsedTime();
    const streakMessage = solvePuzzle(timeElapsed, exprStr);
    setFullExpression(exprStr);
    if (streakMessage) {
      toast.success(streakMessage);
    }
  };

  const handleClear = () => {
    resetGameState();
    // Reset the expression and used numbers in DragDropBuilder
    setExpression([]);
    setFullExpression(null);
    setUsedNumbers(new Array(puzzle.numbers.length).fill(false));
  };

  const calculateCurrentValue = () =>
    tryEvaluateArithmetic(expression.map((item) => item.value).join(""));

  const handleSubmit = () => {
    const exprStr = expression.map((item) => item.value).join("");

    if (expression.length === 0) {
      toast.error("Please build an expression first");
      return;
    }

    // Check if all numbers are used
    const unusedNumbers = usedNumbers.filter((used) => !used).length;
    if (unusedNumbers > 0) {
      toast.error(`Please use all numbers (${unusedNumbers} remaining)`);
      return;
    }

    // Check if the expression evaluates to a valid number
    const value = calculateCurrentValue();
    if (value === null) {
      toast.error("Invalid expression");
      return;
    }

    // Check if the result matches the target
    if (value !== puzzle.target) {
      toast.error(`Expression equals ${value}, but we need ${puzzle.target}`);
      return;
    }

    // Set the full expression before solving
    setFullExpression(exprStr);
    handleSolve(exprStr);
  };

  const getShareText = () =>
    fullExpression && solveTime
      ? buildShareText({
          hashtag: MAKE_X_GAME.hashtag,
          puzzleNumber: puzzleNumber(puzzle.date),
          solveTime,
          streak: streaks.streak,
          solution: fullExpression,
          url: gameUrl(MAKE_X_GAME),
        })
      : "";

  return (
    <div className="flex flex-col items-center min-h-screen w-screen bg-background">
      <HomeLink />

      <div className="fixed top-4 right-4 flex items-center gap-2">
        <InfoDialog game={MAKE_X_GAME} />
        <ModeToggle />
      </div>

      <div className="flex flex-col items-center justify-center w-full max-w-6xl px-4 mt-20 lg:mt-20">
        <h1 className="text-4xl font-bold mb-6 lg:text-6xl lg:mb-12">
          Make {puzzle.target}
        </h1>
        {playing && (
          <p className="text-xl text-muted-foreground text-center lg:text-2xl mb-8 lg:mb-12">
            Drag and drop (or click) numbers and operators to build your
            expression:
          </p>
        )}

        {!finished && !hasStarted && (
          <StartGate
            game={MAKE_X_GAME}
            reveals="today's numbers and operators"
            onStart={startTimer}
          />
        )}

        {revealed && (
          <RevealedAnswer solution={puzzle.solution} />
        )}

        {solved ? (
          <p className="text-center text-lg text-muted-foreground mb-4 lg:mb-8 lg:text-2xl">
            Come back at {localResetTime} for a new puzzle!{" "}
            <Link
              href={MAKE_TEN_GAME.path}
              className="text-blue-500 hover:underline"
            >
              Switch to {MAKE_TEN_GAME.name}
            </Link>{" "}
            and try the classic mode!
          </p>
        ) : playing ? (
          <DragDropBuilder
            numbers={puzzle.numbers}
            target={puzzle.target}
            onSolve={handleSolve}
            solved={solved}
            expression={expression}
            usedNumbers={usedNumbers}
            onExpressionChange={setExpression}
            onUsedNumbersChange={setUsedNumbers}
            onFullExpressionChange={setFullExpression}
          />
        ) : null}
      </div>

      {playing && (
        <div className="w-full max-w-xl flex flex-col gap-2 md:gap-4 mt-8 px-4 mb-8">
          <button
            onClick={handleClear}
            className="w-full h-12 md:h-[60px] bg-secondary text-secondary-foreground rounded-lg text-base md:text-lg font-bold hover:bg-secondary/90 transition-colors uppercase"
          >
            Clear
          </button>
          <button
            onClick={handleSubmit}
            disabled={solved}
            className={cn(
              "w-full h-12 md:h-[60px] rounded-lg text-base md:text-lg font-bold transition-colors uppercase",
              solved
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
          >
            Enter
          </button>
        </div>
      )}

      {playing && (
        <div className="mb-8">
          <GiveUpButton onReveal={revealAnswer} />
        </div>
      )}

      {solved && solveTime && (
        <ShareOptions
          userInput={lastSolution}
          solveTime={solveTime}
          shareText={getShareText()}
        />
      )}

        <StatsSummary
          game={MAKE_X_GAME}
          streaks={streaks}
          stats={stats}
          className="mb-8"
        />
        <OtherModes current={MAKE_X_GAME} />

      {DEBUG_MODE && <LocalStorageDebugger game={MAKE_X_GAME} />}
    </div>
  );
}
