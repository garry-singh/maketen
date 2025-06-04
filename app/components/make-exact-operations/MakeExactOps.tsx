"use client";

import React, { useState, useEffect } from "react";
import { Toaster, toast } from "sonner";
import { ModeToggle } from "@/app/components/mode-toggle";
import { useSimpleGameState } from "@/lib/make-exact-operations/use-simple-game-state";
import { useSecureTimer } from "@/lib/make-exact-operations/use-secure-timer";
import InfoDialog from "@/app/components/make-exact-operations/InfoDialog";
import { getNextPuzzleTime } from "@/lib/date-utils";
import Link from "next/link";
import ShareOptions from "@/components/ShareOptions";
import { generateDailyExactOpsPuzzle } from "@/lib/make-exact-operations/puzzle-generator";
import ExpressionBuilder from "./ExpressionBuilder";

export default function MakeExactOps() {
  const [currentPuzzle, setCurrentPuzzle] = useState<ReturnType<
    typeof generateDailyExactOpsPuzzle
  > | null>(null);
  const [selectedOperators, setSelectedOperators] = useState<string[]>([]);
  const [localResetTime, setLocalResetTime] = useState<string>("");

  const {
    streaks,
    solved,
    solveTime,
    lastSolution,
    solvePuzzle,
    resetGameState,
  } = useSimpleGameState();

  const { getElapsedTime } = useSecureTimer(solved);

  useEffect(() => {
    // Generate today's puzzle
    const puzzle = generateDailyExactOpsPuzzle();
    setCurrentPuzzle(puzzle);
    setSelectedOperators(new Array(puzzle.numbers.length - 1).fill(""));

    // Set up reset time display
    const { formattedString } = getNextPuzzleTime();
    setLocalResetTime(formattedString);
  }, []);

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
    if (!currentPuzzle) return;

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
      const result = eval(expression);
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
    setSelectedOperators(new Array(currentPuzzle!.numbers.length - 1).fill(""));
    resetGameState();
  };

  const getShareText = () => {
    if (!currentPuzzle || !solveTime) return "";
    return `Make Exact Operations ${new Date().toLocaleDateString()}\nTarget: ${
      currentPuzzle.target
    }\nNumbers: ${currentPuzzle.numbers.join(", ")}\nTime: ${solveTime.toFixed(
      2
    )}s\n${window.location.origin}/make-exact-operations`;
  };

  if (!currentPuzzle) return null;

  return (
    <div className="flex flex-col items-center min-h-screen w-screen bg-background">
      <Toaster
        position="bottom-right"
        closeButton
        richColors
        theme={undefined}
        className="sm:max-w-[420px]"
      />

      {/* Theme Toggle and Info */}
      <div className="fixed top-4 right-4 flex items-center gap-2">
        <InfoDialog />
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
        <div className="space-y-3 text-center mt-4">
          <p className="text-lg text-muted-foreground">
            Current Streak (under 1 min): {streaks.streak}
          </p>
          <p className="text-lg text-muted-foreground">
            Longest Streak (under 1 min): {streaks.longestStreak}
          </p>
        </div>

        {/* Share Options */}
        {solved && solveTime && (
          <ShareOptions
            userInput={lastSolution}
            solveTime={solveTime}
            shareText={getShareText()}
          />
        )}
      </div>
    </div>
  );
}
