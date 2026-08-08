"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";
import { NUMBERS, OPERATORS, TARGET_NUMBER, DEBUG_MODE } from "@/lib/constants";
import { MakeTenPuzzle } from "@/lib/types";
import { MAKE_TEN_GAME } from "@/lib/games/config";
import { useGameState } from "@/lib/games/use-game-state";
import { useSecureTimer } from "@/lib/games/use-secure-timer";
import { buildShareText } from "@/lib/games/share-text";
import {
  checkRateLimit,
  validateInput,
  manageStorageQuota,
} from "@/lib/games/security";
import { usePuzzle } from "@/lib/make-ten/use-puzzle";
import { getNextPuzzleTime } from "@/lib/date-utils";
import { useClientValue } from "@/lib/use-client-value";
import {
  validateExpression,
  validateNumbersUsed,
  validateResult,
} from "@/lib/make-ten/validation";
import KeyboardButton from "./KeyboardButton";
import ShareOptions from "@/components/ShareOptions";
import LocalStorageDebugger from "@/components/game/LocalStorageDebugger";
import StreakSummary from "@/components/game/StreakSummary";
import MakeTenInfoDialog from "./InfoDialog";

interface MakeTenProps {
  /** Today's puzzle, resolved on the server */
  puzzle: MakeTenPuzzle;
}

/**
 * Main component for the Make Ten game
 */
const MakeTen: React.FC<MakeTenProps> = ({ puzzle }) => {
  const {
    userInput,
    setUserInput,
    usedNumbers,
    handleKeyboardInput,
    handleInputChange,
  } = usePuzzle(puzzle);

  // Use simplified game state management with lastSolution tracking
  const { streaks, solved, solveTime, lastSolution, solvePuzzle } =
    useGameState(MAKE_TEN_GAME);

  // Use secure timer to prevent streak farming
  const { getElapsedTime } = useSecureTimer(MAKE_TEN_GAME, solved);

  // Reset time display - depends on the visitor's time zone
  const localResetTime = useClientValue(
    () => getNextPuzzleTime().formattedString,
    ""
  );

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
    if (solved) return;

    if (!userInput) {
      toast.error("Please enter a solution first!");
      return;
    }

    // Check rate limiting
    if (!checkRateLimit()) {
      toast.error("Too many attempts. Please wait a minute.");
      return;
    }

    // Validate input format
    if (!validateInput(userInput)) {
      toast.error("Invalid input format.");
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
      const streakMessage = solvePuzzle(timeElapsed, userInput);

      // Show success message
      toast.success(
        `Solved in ${timeElapsed.toFixed(1)} seconds! ${streakMessage}`
      );

      // Manage storage quota after successful solve
      manageStorageQuota(MAKE_TEN_GAME).catch(console.error);

      if (DEBUG_MODE) {
        // Force local storage debugger update
        window.dispatchEvent(new Event("storage"));
      }
    } catch (err) {
      console.error("Solution check error:", err);
      toast.error("Invalid equation. Please check your input.");
    }
  };

  // Use userInput if available, otherwise fall back to lastSolution
  const solutionToShare = userInput || lastSolution;

  const getShareText = () =>
    solveTime
      ? buildShareText({
          hashtag: "Make10",
          solveTime,
          streak: streaks.streak,
          solution: solutionToShare,
          url: "https://maketen.vercel.app/",
        })
      : "";

  return (
    <div className="flex flex-col items-center min-h-screen w-screen bg-background">
      {/* Theme Toggle and Info */}
      <div className="fixed top-4 right-4 flex items-center gap-2">
        <MakeTenInfoDialog />
        <ModeToggle />
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center w-full max-w-4xl px-4 mt-12 lg:mt-20">
        {/* Title */}
        <h1 className="text-4xl font-bold mb-6 lg:text-6xl lg:mb-12">
          Make 10
        </h1>

        {!solved && (
          <p className="text-xl text-muted-foreground text-center lg:text-2xl">
            Use only basic operations and all these numbers exactly once to make
            10:
          </p>
        )}

        {/* Puzzle Numbers */}
        {!solved && (
          <div
            className="text-center text-4xl font-bold space-x-4 my-6 lg:text-5xl lg:my-8"
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
          <>
            {/* New Game Mode Announcement */}
            <div className="w-full max-w-2xl mb-8 p-4 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎮</span>
                <div>
                  <h3 className="font-semibold text-lg">
                    New Game Mode Available!
                  </h3>
                  <p className="text-muted-foreground">
                    Try our new{" "}
                    <Link
                      href="/make-exact-operations"
                      className="text-primary hover:underline font-medium"
                    >
                      Make Exact Operations
                    </Link>{" "}
                    mode - find the operators to reach the target number!
                  </p>
                </div>
              </div>
            </div>

            <p className="text-center text-lg text-muted-foreground mb-4 lg:mb-8 lg:text-2xl">
              Come back at {localResetTime} for a new puzzle!{" "}
              <Link
                href="/make-exact-operations"
                className="text-primary hover:underline"
              >
                Try Make Exact Operations
              </Link>{" "}
              or{" "}
              <Link href="/make-x" className="text-primary hover:underline">
                Make X
              </Link>{" "}
              until then!
            </p>
          </>
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
      <StreakSummary game={MAKE_TEN_GAME} streaks={streaks} className="mt-4" />

      {/* Sharing Options - Pass the correct solution */}
      {solved && solveTime && (
        <ShareOptions
          userInput={solutionToShare}
          solveTime={solveTime}
          shareText={getShareText()}
        />
      )}

      {/* Debug component - only shown in development */}
      {DEBUG_MODE && <LocalStorageDebugger game={MAKE_TEN_GAME} />}
    </div>
  );
};

export default MakeTen;
