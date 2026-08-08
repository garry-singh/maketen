import { useState } from "react";
import { DEBUG_MODE } from "../constants";
import { getTodayDateString, getYesterdayDateString } from "../date-utils";
import { Streaks } from "../types";
import { useClientValue } from "../use-client-value";
import { GameConfig, GameStorageKeys } from "./config";

export interface GameStats {
  /** Days finished, whether solved or given up on */
  played: number;
  solved: number;
  /** Fastest solve in seconds, or null if never solved */
  bestTime: number | null;
}

interface GameState {
  streak: number;
  longestStreak: number;
  solved: boolean;
  /** The player gave up today and was shown the answer */
  revealed: boolean;
  solveTime: number | null;
  lastSolution: string;
  stats: GameStats;
}

const EMPTY_STATS: GameStats = { played: 0, solved: 0, bestTime: null };

const EMPTY_GAME_STATE: GameState = {
  streak: 0,
  longestStreak: 0,
  solved: false,
  revealed: false,
  solveTime: null,
  lastSolution: "",
  stats: EMPTY_STATS,
};

const readNumber = (key: string): number =>
  parseInt(localStorage.getItem(key) || "0", 10);

const readStats = (keys: GameStorageKeys): GameStats => {
  const best = localStorage.getItem(keys.BEST_TIME);
  return {
    played: readNumber(keys.PLAYED_COUNT),
    solved: readNumber(keys.SOLVED_COUNT),
    bestTime: best ? parseFloat(best) : null,
  };
};

/**
 * Reads today's game state out of localStorage. Browser-only - the server
 * render falls back to EMPTY_GAME_STATE.
 */
const readStoredGameState = (keys: GameStorageKeys): GameState => {
  try {
    const today = getTodayDateString();
    const yesterday = getYesterdayDateString();
    const stats = readStats(keys);

    const savedStreak = readNumber(keys.STREAK);
    const savedLongestStreak = readNumber(keys.LONGEST_STREAK);
    const savedSolvedDate = localStorage.getItem(keys.SOLVED_DATE);
    const savedSolvedToday = localStorage.getItem(keys.SOLVED_TODAY) === "true";
    const savedSolutionInput = localStorage.getItem(keys.SOLUTION_INPUT) || "";
    const savedSolutionTime = localStorage.getItem(keys.SOLUTION_TIME);
    const revealedToday =
      localStorage.getItem(keys.REVEALED_DATE) === today;

    if (DEBUG_MODE) {
      console.log("Loading from storage:", {
        savedStreak,
        savedLongestStreak,
        savedSolvedDate,
        savedSolvedToday,
        revealedToday,
        stats,
      });
    }

    // Already solved today - restore the recorded solution and streak
    if (savedSolvedToday && savedSolvedDate === today) {
      return {
        streak: savedStreak,
        longestStreak: savedLongestStreak,
        solved: true,
        revealed: false,
        solveTime: savedSolutionTime ? parseFloat(savedSolutionTime) : null,
        lastSolution: savedSolutionInput,
        stats,
      };
    }

    // Missed a day (neither today nor yesterday) - the streak is broken
    const streakBroken =
      savedSolvedDate &&
      savedSolvedDate !== today &&
      savedSolvedDate !== yesterday;

    if (streakBroken) {
      if (DEBUG_MODE) console.log("Missed days detected, resetting streak");
      localStorage.setItem(keys.STREAK, "0");
    }

    return {
      ...EMPTY_GAME_STATE,
      streak: streakBroken ? 0 : savedStreak,
      longestStreak: savedLongestStreak,
      revealed: revealedToday,
      stats,
    };
  } catch (error) {
    console.error("localStorage error:", error);
    return EMPTY_GAME_STATE;
  }
};

const write = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error(`Error writing ${key}:`, error);
  }
};

/**
 * Tracks streaks, stats and solve state for one game, persisted in localStorage.
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
  // Anything that happened since (solving, giving up, clearing) takes precedence
  const [updatedState, setUpdatedState] = useState<GameState | null>(null);

  const state = updatedState ?? storedState;
  const { streak, longestStreak, solved, revealed, solveTime, lastSolution } =
    state;

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
    // Giving up already counted the day as played, so don't count it twice
    const newStats: GameStats = {
      played: revealed ? state.stats.played : state.stats.played + 1,
      solved: state.stats.solved + 1,
      bestTime:
        state.stats.bestTime === null
          ? timeElapsed
          : Math.min(state.stats.bestTime, timeElapsed),
    };

    setUpdatedState({
      ...state,
      streak: newStreak,
      longestStreak: newLongestStreak,
      solved: true,
      revealed: false,
      solveTime: timeElapsed,
      lastSolution: solutionInput,
      stats: newStats,
    });

    write(storageKeys.STREAK, String(newStreak));
    write(storageKeys.LONGEST_STREAK, String(newLongestStreak));
    write(storageKeys.SOLVED_TODAY, "true");
    write(storageKeys.SOLVED_DATE, getTodayDateString());
    write(storageKeys.SOLUTION_INPUT, solutionInput);
    write(storageKeys.SOLUTION_TIME, String(timeElapsed));
    write(storageKeys.PLAYED_COUNT, String(newStats.played));
    write(storageKeys.SOLVED_COUNT, String(newStats.solved));
    write(storageKeys.BEST_TIME, String(newStats.bestTime));

    return streakMessage;
  };

  /**
   * Ends today's attempt and shows the answer. The day is not recorded as
   * solved, so the streak lapses the same way skipping a day would.
   */
  const revealAnswer = () => {
    if (solved || revealed) return;

    const newStats: GameStats = {
      ...state.stats,
      played: state.stats.played + 1,
    };

    setUpdatedState({
      ...state,
      revealed: true,
      stats: newStats,
    });

    write(storageKeys.REVEALED_DATE, getTodayDateString());
    write(storageKeys.PLAYED_COUNT, String(newStats.played));
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
    stats: state.stats,
    solved,
    revealed,
    solveTime,
    lastSolution,
    solvePuzzle,
    revealAnswer,
    resetGameState,
  };
}
