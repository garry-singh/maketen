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
import ExpressionBuilder from "./ExpressionBuilder";
import { getNextPuzzleTime } from "@/lib/date-utils";
import { DEBUG_MODE } from "@/lib/constants";
import {
  MAKE_EXACT_OPS_GAME,
  MAKE_TEN_GAME,
  MAKE_X_GAME,
  gameUrl,
} from "@/lib/games/config";
import { useGameState } from "@/lib/games/use-game-state";
import { useSecureTimer } from "@/lib/games/use-secure-timer";
import { buildShareText } from "@/lib/games/share-text";
import { puzzleNumber } from "@/lib/games/daily-puzzle";
import { useClientValue } from "@/lib/use-client-value";
import { evaluateArithmetic } from "@/lib/expression-eval";
import type { ExactOpsPuzzle } from "@/lib/make-exact-operations/puzzle-generator";

interface MakeExactOpsProps {
  /** Today's puzzle, resolved on the server */
  puzzle: ExactOpsPuzzle;
}

export default function MakeExactOps({
  puzzle: currentPuzzle,
}: MakeExactOpsProps) {
  // Depends on the visitor's time zone, so it can only be resolved in the browser
  const localResetTime = useClientValue(
    () => getNextPuzzleTime().formattedString,
    ""
  );

  const [chosenOperators, setSelectedOperators] = useState<string[]>([]);

  const {
    streaks,
    stats,
    solved,
    revealed,
    solveTime,
    lastSolution,
    solvePuzzle,
    revealAnswer,
    resetGameState,
  } = useGameState(MAKE_EXACT_OPS_GAME);

  const { hasStarted, startTimer, getElapsedTime } = useSecureTimer(MAKE_EXACT_OPS_GAME, solved);

  // The day is over once the puzzle is solved or the answer has been revealed
  const finished = solved || revealed;
  const playing = hasStarted && !finished;

  const showBuilder = finished || hasStarted;

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
          hashtag: MAKE_EXACT_OPS_GAME.hashtag,
          puzzleNumber: puzzleNumber(currentPuzzle.date),
          solveTime,
          streak: streaks.streak,
          url: gameUrl(MAKE_EXACT_OPS_GAME),
        })
      : "";

  return (
    <div className="flex flex-col items-center min-h-screen w-screen bg-background">
      {/* Theme Toggle and Info */}
      <HomeLink />

      <div className="fixed top-4 right-4 flex items-center gap-2">
        <InfoDialog game={MAKE_EXACT_OPS_GAME} />
        <ModeToggle />
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center w-full max-w-4xl px-4 mt-12 lg:mt-20">
        {/* Title */}
        <h1 className="text-4xl font-bold mb-6 lg:text-6xl lg:mb-12">
          Make {currentPuzzle.target}
        </h1>
        {playing && (
          <p className="text-xl text-muted-foreground text-center lg:text-2xl mb-8 lg:mb-12">
            Drag and drop operators between the numbers to reach the target
            value:
          </p>
        )}

        {!finished && !hasStarted && (
          <StartGate
            game={MAKE_EXACT_OPS_GAME}
            reveals="today's numbers and the operators"
            onStart={startTimer}
          />
        )}

        {/* Expression Builder */}
        {showBuilder && (
        <ExpressionBuilder
          numbers={currentPuzzle.numbers}
          selectedOperators={selectedOperators}
          onOperatorSelect={handleOperatorSelect}
          onOperatorRemove={handleOperatorRemove}
          solved={solved}
          target={currentPuzzle.target}
        />
        )}

        {/* Solved Message */}
        {solved ? (
          <p className="text-center text-lg text-muted-foreground mb-4 lg:mb-8 lg:text-2xl">
            Come back at {localResetTime} for a new puzzle!{" "}
            <Link
              href={MAKE_TEN_GAME.path}
              className="text-blue-500 hover:underline"
            >
              Try {MAKE_TEN_GAME.name}
            </Link>{" "}
            or{" "}
            <Link
              href={MAKE_X_GAME.path}
              className="text-blue-500 hover:underline"
            >
              {MAKE_X_GAME.name}
            </Link>{" "}
            until then!
          </p>
        ) : playing ? (
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
        ) : null}

        {revealed && (
          <RevealedAnswer
            solution={currentPuzzle.solution}
           
          />
        )}

        {playing && (
          <div className="mt-6">
            <GiveUpButton onReveal={revealAnswer} />
          </div>
        )}

        {/* Share Options */}
        {solved && solveTime && (
          <ShareOptions
            userInput={lastSolution}
            solveTime={solveTime}
            shareText={getShareText()}
          />
        )}

          <StatsSummary
            game={MAKE_EXACT_OPS_GAME}
            streaks={streaks}
            stats={stats}
            className="mt-8 mb-8"
          />
          <OtherModes current={MAKE_EXACT_OPS_GAME} />
      </div>

      {DEBUG_MODE && <LocalStorageDebugger game={MAKE_EXACT_OPS_GAME} />}
    </div>
  );
}
