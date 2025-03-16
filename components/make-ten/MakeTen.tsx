"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "sonner";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/app/components/mode-toggle";
import {
  NUMBERS,
  OPERATORS,
  TARGET_NUMBER,
  DEBUG_MODE,
} from "@/lib/make-ten/constants";
import { usePuzzle } from "@/lib/make-ten/use-puzzle";
import { useSimpleGameState } from "@/lib/make-ten/use-simple-game-state";
import { useSecureTimer } from "@/lib/make-ten/use-secure-timer";
import { getNextPuzzleTime } from "@/lib/make-ten/date-utils";
import {
  validateExpression,
  validateNumbersUsed,
  validateResult,
} from "@/lib/make-ten/validation";
import KeyboardButton from "./KeyboardButton";
import LoadingErrorView from "./LoadingErrorView";
import ShareOptions from "./ShareOptions";
import LocalStorageDebugger from "./LocalStorageDebugger";

/**
 * Main component for the Make Ten game
 * Fixed version with improved localStorage handling and solution persistence
 */
const MakeTen: React.FC = () => {
  const {
    puzzle,
    userInput,
    setUserInput,
    usedNumbers,
    isLoading,
    error,
    handleKeyboardInput,
    handleInputChange,
  } = usePuzzle();

  // Use simplified game state management with lastSolution tracking
  const {
    streaks,
    solved,
    solveTime,
    lastSolution,
    solvePuzzle,
    resetGameState,
    refreshState,
  } = useSimpleGameState();

  // Use secure timer to prevent streak farming
  const { getElapsedTime } = useSecureTimer(solved);

  // State for reset time display
  const [localResetTime, setLocalResetTime] = useState<string>("");

  // Set up reset time display
  useEffect(() => {
    const { formattedString } = getNextPuzzleTime();
    setLocalResetTime(formattedString);
  }, []);

  // Sync userInput with lastSolution when refreshing a solved puzzle
  useEffect(() => {
    if (solved && lastSolution && !userInput) {
      setUserInput(lastSolution);
      if (DEBUG_MODE)
        console.log("Restored solution from localStorage:", lastSolution);
    }
  }, [solved, lastSolution, userInput, setUserInput]);

  /**
   * Handle keyboard input with solution checking
   */
  const handleKey = (key: string) => {
    // Check if the key is Enter/ENTER and call checkSolution directly
    if (key === "Enter" || key === "ENTER") {
      checkSolution();
      return;
    }

    // For all other keys, delegate to the original handler
    handleKeyboardInput(key, solved);
  };

  /**
   * Validate and check the user's solution
   */
  const checkSolution = () => {
    if (solved || !puzzle) return;

    if (!userInput) {
      toast.error("Please enter a solution first!");
      return;
    }

    try {
      // Get elapsed time
      const timeElapsed = getElapsedTime();
      if (DEBUG_MODE)
        console.log(`Solution check - time elapsed: ${timeElapsed}s`);

      // Step 1: Validate expression syntax
      const expressionValidation = validateExpression(userInput);
      if (!expressionValidation.isValid) {
        toast.error(expressionValidation.error);
        return;
      }

      // Step 2: Validate result equals target
      const resultValidation = validateResult(userInput, TARGET_NUMBER);
      if (!resultValidation.isValid) {
        toast.error(resultValidation.error);
        return;
      }

      // Step 3: Validate all required numbers are used
      const numbersValidation = validateNumbersUsed(userInput, puzzle.numbers);
      if (!numbersValidation.isValid) {
        toast.error(numbersValidation.error);
        return;
      }

      // Success! Update streak and get message
      // Pass the current solution input to store it
      const streakMessage = solvePuzzle(timeElapsed, userInput);

      // Show success message
      toast.success(
        `Solved in ${timeElapsed.toFixed(1)} seconds! ${streakMessage}`
      );

      if (DEBUG_MODE) {
        // Force local storage debugger update
        window.dispatchEvent(new Event("storage"));
      }
    } catch (err) {
      console.error("Solution check error:", err);
      toast.error("Invalid equation. Please check your input.");
    }
  };

  /**
   * Reset game for development/testing
   */
  const resetGame = () => {
    // Reset game state (streaks, solved status)
    resetGameState();

    // Reset user input
    setUserInput("");

    // Force refresh state
    refreshState();
  };

  // Handle loading and error states
  if (isLoading) {
    return <LoadingErrorView />;
  }

  if (error) {
    return <LoadingErrorView message={error} showRefresh />;
  }

  if (!puzzle) {
    return (
      <LoadingErrorView
        message="Failed to load puzzle. Please refresh the page."
        showRefresh
      />
    );
  }

  // Determine which solution to use for sharing
  // Use userInput if available, otherwise fall back to lastSolution
  const solutionToShare = userInput || lastSolution;

  return (
    <div className="flex flex-col items-center min-h-screen w-screen bg-background">
      <Toaster
        position="bottom-right"
        closeButton
        richColors
        theme={undefined}
        className="sm:max-w-[420px]"
      />

      {/* Theme Toggle */}
      <div className="fixed top-4 right-4">
        <ModeToggle />
      </div>

      {/* Reset Button - Development Only */}
      {process.env.NODE_ENV === "development" && (
        <div className="fixed top-20 right-4 z-50">
          <button
            onClick={resetGame}
            className="bg-red-500 text-white px-4 py-2 rounded text-sm"
          >
            Reset Game
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center w-full max-w-4xl px-4 mt-12 lg:mt-20">
        {/* Title */}
        <h1 className="text-5xl font-bold mb-8 lg:text-6x lg:mb-12">Make 10</h1>
        {!solved && (
          <p className="text-xl text-muted-foreground text-center lg:text-2xl">
            Use only basic operations and all these numbers exactly once to make
            10:
          </p>
        )}

        {/* Puzzle Numbers */}
        {!solved && (
          <div
            className="text-center text-4xl font-bold space-x-4 my-8 lg:text-5xl"
            role="status"
            aria-live="polite"
          >
            {puzzle.numbers.map((num: number, index: number) => (
              <span
                key={index}
                className={cn(usedNumbers[index] && "text-muted-foreground")}
                aria-label={`Number ${num}${
                  usedNumbers[index] ? " used" : " available"
                }`}
              >
                {num}
              </span>
            ))}
          </div>
        )}

        {/* Input Field */}
        {solved ? (
          <p className="text-center text-lg text-muted-foreground mb-4 lg:mb-8 lg:text-2xl">
            Come back at {localResetTime} for a new puzzle!
          </p>
        ) : (
          <Input
            type="text"
            value={userInput}
            onChange={handleInputChange}
            className="text-center text-xl w-full h-12 mb-6 md:text-2xl md:h-14 lg:mb-12"
            disabled={solved}
            autoFocus
            aria-label="Enter your solution"
            placeholder="Enter your solution"
          />
        )}
      </div>

      {/* Keyboard - Desktop Layout */}
      <div
        className="w-full max-w-4xl mx-auto hidden md:flex flex-col items-center justify-center pb-12"
        role="group"
        aria-label="Calculator keyboard desktop"
      >
        <div className="grid gap-2 w-full max-w-[600px]">
          <div className="grid grid-cols-10 gap-4">
            {NUMBERS.map((num) => (
              <KeyboardButton
                key={num}
                disabled={solved || !puzzle.numbers.includes(parseInt(num))}
                onClick={() => handleKey(num)}
                aria-label={`Number ${num}`}
                active={puzzle.numbers.includes(parseInt(num))}
              >
                {num}
              </KeyboardButton>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-4">
            <div className="col-start-2 col-span-5 grid grid-cols-7 gap-4">
              {OPERATORS.map((op) => (
                <KeyboardButton
                  key={op}
                  disabled={solved}
                  onClick={() => handleKey(op)}
                  aria-label={op === "⌫" ? "Backspace" : `Operator ${op}`}
                  variant="secondary"
                >
                  {op}
                </KeyboardButton>
              ))}
            </div>
          </div>
        </div>
        {!solved && (
          <Button
            className="w-full h-14 text-xl max-w-[600px] mt-16"
            onClick={checkSolution}
            disabled={solved}
            aria-label="Submit solution"
          >
            ENTER
          </Button>
        )}
      </div>

      {/* Mobile Layout - Sticks to Bottom */}
      <div
        className="w-full max-w-sm mx-auto md:hidden p-4"
        role="group"
        aria-label="Calculator keyboard mobile"
      >
        <div className="grid grid-cols-5 gap-2 auto-rows-fr">
          {NUMBERS.slice(0, 10).map((num) => (
            <KeyboardButton
              key={num}
              disabled={solved || !puzzle.numbers.includes(parseInt(num))}
              onClick={() => handleKey(num)}
              aria-label={`Number ${num}`}
              active={puzzle.numbers.includes(parseInt(num))}
              className="w-full"
            >
              {num}
            </KeyboardButton>
          ))}
        </div>
        <div className="grid grid-cols-5 gap-2 mt-2 auto-rows-fr">
          {[...OPERATORS.slice(0, 5), ...OPERATORS.slice(5)].map((op) => (
            <KeyboardButton
              key={op}
              disabled={solved}
              onClick={() => handleKey(op)}
              aria-label={op === "⌫" ? "Backspace" : `Operator ${op}`}
              variant="secondary"
              className="w-full"
            >
              {op}
            </KeyboardButton>
          ))}
        </div>
        {!solved && (
          <Button
            className="w-full h-12 mt-8 lg:mt-2"
            onClick={checkSolution}
            disabled={solved}
            aria-label="Submit solution"
          >
            ENTER
          </Button>
        )}
      </div>

      {/* Message & Streaks */}
      <div className="space-y-3 text-center mt-4">
        <p className="text-lg text-muted-foreground">
          Current Streak (under 45 sec): {streaks.streak}
        </p>
        <p className="text-lg text-muted-foreground">
          Longest Streak (under 45 sec): {streaks.longestStreak}
        </p>
      </div>

      {/* Sharing Options - Pass the correct solution */}
      {solved && (
        <ShareOptions
          userInput={solutionToShare}
          solveTime={solveTime}
          streaks={streaks}
        />
      )}

      {/* Debug component - only shown in development */}
      {process.env.NODE_ENV === "development" && <LocalStorageDebugger />}
    </div>
  );
};

export default MakeTen;
