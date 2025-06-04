"use client";

import React, { useState, useEffect } from "react";
import { Toaster, toast } from "sonner";
import { ModeToggle } from "@/app/components/mode-toggle";
import LoadingErrorView from "@/components/LoadingErrorView";
import ShareOptions from "@/components/ShareOptions";
import LocalStorageDebugger from "@/components/make-x/LocalStorageDebugger";
import InfoDialog from "@/components/make-x/InfoDialog";
import DragDropBuilder from "./DragDropBuilder";
import { cn } from "@/lib/utils";
import { ExpressionItem } from "@/lib/make-x/interfaces";
import { getNextPuzzleTime } from "@/lib/date-utils";
import { MakeXPuzzle } from "@/lib/types";
import { useSimpleGameState } from "@/lib/make-x/use-simple-game-state";
import { useSecureTimer } from "@/lib/make-x/use-secure-timer";
import Link from "next/link";
import { generateDailyMakeXPuzzle } from "@/lib/make-x/puzzle-generator";

export default function MakeX() {
  const [puzzle, setPuzzle] = useState<MakeXPuzzle | null>(null);
  const [expression, setExpression] = useState<ExpressionItem[]>([]);
  const [usedNumbers, setUsedNumbers] = useState<boolean[]>([]);
  const [localResetTime, setLocalResetTime] = useState<string>("");
  const [fullExpression, setFullExpression] = useState<string>("");

  const {
    streaks,
    solved,
    solveTime,
    solvePuzzle,
    resetGameState,
    lastSolution,
  } = useSimpleGameState();

  const { getElapsedTime } = useSecureTimer(solved);

  useEffect(() => {
    const newPuzzle = generateDailyMakeXPuzzle();
    setPuzzle(newPuzzle);
    setUsedNumbers(new Array(newPuzzle.numbers.length).fill(false));

    // Set up reset time display
    const { formattedString } = getNextPuzzleTime();
    setLocalResetTime(formattedString);
  }, []);

  // Set fullExpression from lastSolution when loading a solved puzzle
  useEffect(() => {
    if (solved && lastSolution) {
      setFullExpression(lastSolution);
    }
  }, [solved, lastSolution]);

  const handleSolve = (exprStr: string) => {
    if (!puzzle) return;
    const timeElapsed = getElapsedTime();
    const streakMessage = solvePuzzle(timeElapsed, exprStr);
    setFullExpression(exprStr);
    if (streakMessage) {
      toast.success(streakMessage);
    }
  };

  const handleClear = () => {
    console.log("Clear button clicked");
    resetGameState();
    // Reset the expression and used numbers in DragDropBuilder
    setExpression([]);
    if (puzzle) {
      setUsedNumbers(new Array(puzzle.numbers.length).fill(false));
    }
  };

  const calculateCurrentValue = () => {
    const exprStr = expression.map((item) => item.value).join("");
    try {
      return eval(exprStr);
    } catch {
      return null;
    }
  };

  const handleSubmit = () => {
    console.log("Submit button clicked");
    if (!puzzle) return;

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

  const getShareText = () => {
    if (!fullExpression || !solveTime) return "";

    const formattedTime = solveTime.toFixed(2);
    const streakText = streaks.streak > 0 ? `${streaks.streak} day streak` : "";

    const maskedSolution = fullExpression
      .replace(/[0-9]/g, "⬛")
      .replace(/[\(\)]/g, "⬜");

    const coloredOperators = maskedSolution
      .replace(/[+]/g, "➕")
      .replace(/[-]/g, "➖")
      .replace(/[*]/g, "✖️")
      .replace(/[/]/g, "➗");

    return `I solved today's #MakeX in ${formattedTime}s! \n\nMy solution: ${coloredOperators}${
      streakText ? `\n\n🔥 I'm on a ${streakText}!` : ""
    }\n\nPlay now: https://maketen.vercel.app/make-x`;
  };

  if (!puzzle) {
    return <LoadingErrorView />;
  }

  return (
    <div className="flex flex-col items-center min-h-screen w-screen bg-background">
      <Toaster
        position="bottom-right"
        closeButton
        richColors
        theme={undefined}
        className="sm:max-w-[420px]"
      />
      <div className="fixed top-4 right-4 flex items-center gap-2">
        <InfoDialog />
        <ModeToggle />
      </div>

      <div className="flex flex-col items-center justify-center w-full max-w-6xl px-4 mt-20 lg:mt-20">
        <h1 className="text-4xl font-bold mb-6 lg:text-6xl lg:mb-12">
          Make {puzzle.target}
        </h1>
        {!solved && (
          <p className="text-xl text-muted-foreground text-center lg:text-2xl mb-8 lg:mb-12">
            Drag and drop (or click) numbers and operators to build your
            expression:
          </p>
        )}

        {solved ? (
          <p className="text-center text-lg text-muted-foreground mb-4 lg:mb-8 lg:text-2xl">
            Come back at {localResetTime} for a new puzzle!{" "}
            <Link href="/">
              <a className="text-blue-500 hover:underline">Switch to Make 10</a>
            </Link>{" "}
            and try the classic mode!
          </p>
        ) : (
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
        )}
      </div>

      {!solved && (
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

      <div className="space-y-3 text-center mb-8">
        <p className="text-lg text-muted-foreground">
          Current Streak (under 1 min): {streaks.streak}
        </p>
        <p className="text-lg text-muted-foreground">
          Longest Streak (under 1 min): {streaks.longestStreak}
        </p>
      </div>

      {solved && solveTime && (
        <ShareOptions
          userInput={lastSolution}
          solveTime={solveTime}
          shareText={getShareText()}
        />
      )}

      {process.env.NODE_ENV === "development" && <LocalStorageDebugger />}
    </div>
  );
}
