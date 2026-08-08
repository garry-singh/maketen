"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
import ShareOptions from "@/components/ShareOptions";
import LocalStorageDebugger from "@/components/game/LocalStorageDebugger";
import StreakSummary from "@/components/game/StreakSummary";
import MakeExactOpsInfoDialog from "./InfoDialog";
import ExpressionBuilder from "./ExpressionBuilder";
import { getNextPuzzleTime } from "@/lib/date-utils";
import { DEBUG_MODE } from "@/lib/constants";
import { MAKE_EXACT_OPS_GAME } from "@/lib/games/config";
import { useGameState } from "@/lib/games/use-game-state";
import { useSecureTimer } from "@/lib/games/use-secure-timer";
import { buildShareText } from "@/lib/games/share-text";
import { useClientValue } from "@/lib/use-client-value";
import { evaluateArithmetic } from "@/lib/expression-eval";
import type { ExactOpsPuzzle } from "@/lib/make-exact-operations/puzzle-generator";

interface MakeExactOpsProps {
  /** Today's puzzle, resolved on the server */
  puzzle: ExactOpsPuzzle;
}

export default function MakeExactOps({ puzzle: currentPuzzle }: MakeExactOpsProps) {
  // Depends on the visitor's time zone, so it can only be resolved in the browser
  const localResetTime = useClientValue(
    () => getNextPuzzleTime().formattedString,
    ""
  );

  const [chosenOperators, setSelectedOperators] = useState<string[]>([]);

  const {
    streaks,
    solved,
    solveTime,
    lastSolution,
    solvePuzzle,
    resetGameState,
  } = useGameState(MAKE_EXACT_OPS_GAME);

  const { getElapsedTime } = useSecureTimer(MAKE_EXACT_OPS_GAME, solved);

  // One slot between each pair of numbers, all empty until the player fills them
  const slotCount = currentPuzzle.numbers.length - 1;
  const selectedOperators =
    chosenOperators.length === slotCount
      ? chosenOperators
      : new Array<string>(slotCount).fill("");

  const handleOperatorSelect = (operator: string, index: number) => {
    if (solved) return;
    const newOperators = [...selectedOperators];
    newOperators[index] = operator;
    setSelectedOperators(newOperators);
  };

  const handleOperatorRemove = (index: number) => {
    if (solved) return;
    const newOperators = [...selectedOperators];
    newOperators[index] = "";
    setSelectedOperators(newOperators);
  };

  const checkSolution = () => {
    // Check if all operators are placed
    if (selectedOperators.some((op) => !op)) {
      toast.error("Please place all operators");
      return;
    }

    let expression = "";
    for (let i = 0; i < currentPuzzle.numbers.length; i++) {
      expression += currentPuzzle.numbers[i];
      if (i < selectedOperators.length) {
        expression += selectedOperators[i];
      }
    }

    try {
      const result = evaluateArithmetic(expression);
      if (result === currentPuzzle.target) {
        const timeElapsed = getElapsedTime();
        const message = solvePuzzle(timeElapsed, expression);
        if (message) {
          toast.success(message);
        }
      } else {
        toast.error(
          `Not quite right. Current result: ${result}, Target: ${currentPuzzle.target}`
        );
      }
    } catch {
      toast.error("Invalid expression. Try again!");
    }
  };

  const resetPuzzle = () => {
    setSelectedOperators(new Array(slotCount).fill(""));
    resetGameState();
  };

  const getShareText = () =>
    solveTime
      ? buildShareText({
          hashtag: "MakeExactOperations",
          solveTime,
          streak: streaks.streak,
          url: "https://maketen.vercel.app/make-exact-operations",
        })
      : "";

  return (
    <div className="flex flex-col items-center min-h-screen w-screen bg-background">
      {/* Theme Toggle and Info */}
      <div className="fixed top-4 right-4 flex items-center gap-2">
        <MakeExactOpsInfoDialog />
        <ModeToggle />
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center w-full max-w-4xl px-4 mt-12 lg:mt-20">
        {/* Title */}
        <h1 className="text-4xl font-bold mb-6 lg:text-6xl lg:mb-12">
          Make {currentPuzzle.target}
        </h1>
        {!solved && (
          <p className="text-xl text-muted-foreground text-center lg:text-2xl mb-8 lg:mb-12">
            Drag and drop operators between the numbers to reach the target
            value:
          </p>
        )}

        {/* Expression Builder */}
        <ExpressionBuilder
          numbers={currentPuzzle.numbers}
          selectedOperators={selectedOperators}
          onOperatorSelect={handleOperatorSelect}
          onOperatorRemove={handleOperatorRemove}
          solved={solved}
          target={currentPuzzle.target}
        />

        {/* Solved Message */}
        {solved ? (
          <p className="text-center text-lg text-muted-foreground mb-4 lg:mb-8 lg:text-2xl">
            Come back at {localResetTime} for a new puzzle!{" "}
            <Link href="/" className="text-blue-500 hover:underline">
              Try Make 10
            </Link>{" "}
            or{" "}
            <Link href="/make-x" className="text-blue-500 hover:underline">
              Make X
            </Link>{" "}
            until then!
          </p>
        ) : (
          <div className="w-full max-w-xl flex flex-col gap-2 md:gap-4 mt-8 px-4 mb-8">
            <button
              onClick={resetPuzzle}
              className="w-full h-12 md:h-[60px] bg-secondary text-secondary-foreground rounded-lg text-base md:text-lg font-bold hover:bg-secondary/90 transition-colors uppercase"
            >
              Clear
            </button>
            <button
              onClick={checkSolution}
              disabled={solved}
              className="w-full h-12 md:h-[60px] bg-primary text-primary-foreground rounded-lg text-base md:text-lg font-bold hover:bg-primary/90 transition-colors uppercase"
            >
              Enter
            </button>
          </div>
        )}

        {/* Streaks */}
        <StreakSummary
          game={MAKE_EXACT_OPS_GAME}
          streaks={streaks}
          className="mt-4"
        />

        {/* Share Options */}
        {solved && solveTime && (
          <ShareOptions
            userInput={lastSolution}
            solveTime={solveTime}
            shareText={getShareText()}
          />
        )}
      </div>

      {DEBUG_MODE && <LocalStorageDebugger game={MAKE_EXACT_OPS_GAME} />}
    </div>
  );
}
