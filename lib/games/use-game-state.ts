import { useState } from "react";
import { DEBUG_MODE } from "../constants";
import { getTodayDateString, getYesterdayDateString } from "../date-utils";
import { Streaks } from "../types";
import { useClientValue } from "../use-client-value";
import { GameConfig, GameStorageKeys } from "./config";

interface GameState {
  streak: number;
  longestStreak: number;
  solved: boolean;
  solveTime: number | null;
  lastSolution: string;
}

const EMPTY_GAME_STATE: GameState = {
  streak: 0,
  longestStreak: 0,
  solved: false,
  solveTime: null,
  lastSolution: "",
};

/**
 * Reads today's game state out of localStorage. Browser-only - the server
 * render falls back to EMPTY_GAME_STATE.
 */
const readStoredGameState = (keys: GameStorageKeys): GameState => {
  try {
    const today = getTodayDateString();
    const yesterday = getYesterdayDateString();

    const savedStreak = parseInt(localStorage.getItem(keys.STREAK) || "0", 10);
    const savedLongestStreak = parseInt(
      localStorage.getItem(keys.LONGEST_STREAK) || "0",
      10
    );
    const savedSolvedDate = localStorage.getItem(keys.SOLVED_DATE);
    const savedSolvedToday = localStorage.getItem(keys.SOLVED_TODAY) === "true";
    const savedSolutionInput = localStorage.getItem(keys.SOLUTION_INPUT) || "";
    const savedSolutionTime = localStorage.getItem(keys.SOLUTION_TIME);

    if (DEBUG_MODE) {
      console.log("Loading from storage:", {
        savedStreak,
        savedLongestStreak,
        savedSolvedDate,
        savedSolvedToday,
        savedSolutionInput,
        savedSolutionTime,
        today,
        yesterday,
      });
    }

    // Already solved today - restore the recorded solution and streak
    if (savedSolvedToday && savedSolvedDate === today) {
      return {
        streak: savedStreak,
        longestStreak: savedLongestStreak,
        solved: true,
        solveTime: savedSolutionTime ? parseFloat(savedSolutionTime) : null,
        lastSolution: savedSolutionInput,
      };
    }

    // Missed a day (neither today nor yesterday) - the streak is broken
    if (
      savedSolvedDate &&
      savedSolvedDate !== today &&
      savedSolvedDate !== yesterday
    ) {
      if (DEBUG_MODE) console.log("Missed days detected, resetting streak");
      localStorage.setItem(keys.STREAK, "0");
      return { ...EMPTY_GAME_STATE, longestStreak: savedLongestStreak };
    }

    // Streak intact, today not solved yet
    return {
      ...EMPTY_GAME_STATE,
      streak: savedStreak,
      longestStreak: savedLongestStreak,
    };
  } catch (error) {
    console.error("localStorage error:", error);
    return EMPTY_GAME_STATE;
  }
};

/**
 * Tracks streaks and solve state for one game, persisted in localStorage.
 *
 * @param config - Identifies which game's storage keys and streak limit to use
 */
export function useGameState(config: GameConfig) {
  const { storageKeys, streakTimeLimit } = config;

  // What was persisted when the page loaded
  const storedState = useClientValue(
    () => readStoredGameState(storageKeys),
    EMPTY_GAME_STATE
  );
  // Anything that happened since (solving, clearing) takes precedence
  const [updatedState, setUpdatedState] = useState<GameState | null>(null);

  const { streak, longestStreak, solved, solveTime, lastSolution } =
    updatedState ?? storedState;

  const solvePuzzle = (timeElapsed: number, solutionInput: string): string => {
    if (solved) return ""; // Already solved today

    let newStreak = streak;
    let streakMessage = "";

    if (timeElapsed <= streakTimeLimit) {
      newStreak = streak + 1;

      if (newStreak === 1) {
        streakMessage = "🎯 Streak started! Come back tomorrow to continue!";
      } else if (newStreak > longestStreak) {
        streakMessage = `🏆 New record! ${newStreak} day streak!`;
      } else {
        streakMessage = `🔥 ${newStreak} day streak!`;
      }
    } else {
      newStreak = 0;
      streakMessage = `⏱️ Solve within ${streakTimeLimit} seconds to maintain your streak!`;
    }

    const newLongestStreak = Math.max(newStreak, longestStreak);

    setUpdatedState({
      streak: newStreak,
      longestStreak: newLongestStreak,
      solved: true,
      solveTime: timeElapsed,
      lastSolution: solutionInput,
    });

    try {
      localStorage.setItem(storageKeys.STREAK, String(newStreak));
      localStorage.setItem(
        storageKeys.LONGEST_STREAK,
        String(newLongestStreak)
      );
      localStorage.setItem(storageKeys.SOLVED_TODAY, "true");
      localStorage.setItem(storageKeys.SOLVED_DATE, getTodayDateString());
      localStorage.setItem(storageKeys.SOLUTION_INPUT, solutionInput);
      localStorage.setItem(storageKeys.SOLUTION_TIME, String(timeElapsed));
    } catch (error) {
      console.error("Error updating localStorage:", error);
    }

    return streakMessage;
  };

  const resetGameState = () => {
    if (typeof window === "undefined") return;

    Object.values(storageKeys).forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.error(`Error removing ${key}:`, e);
      }
    });

    setUpdatedState(EMPTY_GAME_STATE);
  };

  return {
    streaks: { streak, longestStreak } as Streaks,
    solved,
    solveTime,
    lastSolution,
    solvePuzzle,
    resetGameState,
  };
}
