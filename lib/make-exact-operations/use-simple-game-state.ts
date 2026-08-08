import { useState } from "react";
import { MAKE_EXACT_OPS_STORAGE_KEYS, STREAK_TIME_LIMIT, DEBUG_MODE } from "../constants";
import { getTodayDateString, getYesterdayDateString } from "../date-utils";
import { Streaks } from "../types";
import { useClientValue } from "../use-client-value";

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
function readStoredGameState(): GameState {
  try {
    // Test basic functionality
    localStorage.setItem('__test', 'working');
    const testValue = localStorage.getItem('__test');
    if (DEBUG_MODE) console.log('localStorage test:', testValue);
    localStorage.removeItem('__test');

    const today = getTodayDateString();
    const yesterday = getYesterdayDateString();

    // Get stored values (handle null/undefined cases)
    const savedStreak = parseInt(localStorage.getItem(MAKE_EXACT_OPS_STORAGE_KEYS.STREAK) || '0', 10);
    const savedLongestStreak = parseInt(localStorage.getItem(MAKE_EXACT_OPS_STORAGE_KEYS.LONGEST_STREAK) || '0', 10);
    const savedSolvedDate = localStorage.getItem(MAKE_EXACT_OPS_STORAGE_KEYS.SOLVED_DATE);
    const savedSolvedToday = localStorage.getItem(MAKE_EXACT_OPS_STORAGE_KEYS.SOLVED_TODAY) === "true";

    // Get saved solution details
    const savedSolutionInput = localStorage.getItem(MAKE_EXACT_OPS_STORAGE_KEYS.SOLUTION_INPUT) || "";
    const savedSolutionTime = localStorage.getItem(MAKE_EXACT_OPS_STORAGE_KEYS.SOLUTION_TIME);

    if (DEBUG_MODE) {
      console.log('Loading from storage:', {
        savedStreak,
        savedLongestStreak,
        savedSolvedDate,
        savedSolvedToday,
        savedSolutionInput,
        savedSolutionTime,
        today,
        yesterday
      });
    }

    // If we've solved today, just mark as solved and use stored streak values
    if (savedSolvedToday && savedSolvedDate === today) {
      return {
        streak: savedStreak,
        longestStreak: savedLongestStreak,
        solved: true,
        solveTime: savedSolutionTime ? parseFloat(savedSolutionTime) : null,
        lastSolution: savedSolutionInput,
      };
    }

    // If we missed a day (not yesterday and not today), reset streak
    if (savedSolvedDate && savedSolvedDate !== today && savedSolvedDate !== yesterday) {
      if (DEBUG_MODE) console.log('Missed days detected, resetting streak');
      localStorage.setItem(MAKE_EXACT_OPS_STORAGE_KEYS.STREAK, '0');
      return { ...EMPTY_GAME_STATE, longestStreak: savedLongestStreak };
    }

    // Otherwise, use the stored streak values and start the day unsolved
    return {
      ...EMPTY_GAME_STATE,
      streak: savedStreak,
      longestStreak: savedLongestStreak,
    };
  } catch (error) {
    console.error('localStorage error:', error);
    return EMPTY_GAME_STATE;
  }
}

/**
 * Simple, direct approach to managing game state with localStorage
 */
export function useSimpleGameState() {
  // What was persisted when the page loaded
  const storedState = useClientValue(readStoredGameState, EMPTY_GAME_STATE);
  // Anything that happened since (solving, clearing) takes precedence
  const [updatedState, setUpdatedState] = useState<GameState | null>(null);

  const { streak, longestStreak, solved, solveTime, lastSolution } =
    updatedState ?? storedState;

  const solvePuzzle = (timeElapsed: number, solutionInput: string): string => {
    if (solved) return ""; // Already solved today

    const today = getTodayDateString();
    let newStreak = streak;
    let streakMessage = "";

    // Calculate new streak value
    if (timeElapsed <= STREAK_TIME_LIMIT) {
      // Fast enough - increment streak
      newStreak = streak + 1;

      if (newStreak === 1) {
        streakMessage = "🎯 Streak started! Come back tomorrow to continue!";
      } else if (newStreak > longestStreak) {
        streakMessage = `🏆 New record! ${newStreak} day streak!`;
      } else {
        streakMessage = `🔥 ${newStreak} day streak!`;
      }
    } else {
      // Too slow - reset streak
      newStreak = 0;
      streakMessage = `⏱️ Solve within ${STREAK_TIME_LIMIT} seconds to maintain your streak!`;
    }

    // Calculate new longest streak
    const newLongestStreak = Math.max(newStreak, longestStreak);

    // Update UI state
    setUpdatedState({
      streak: newStreak,
      longestStreak: newLongestStreak,
      solved: true,
      solveTime: timeElapsed,
      lastSolution: solutionInput,
    });

    // Update localStorage
    try {
      localStorage.setItem(MAKE_EXACT_OPS_STORAGE_KEYS.STREAK, String(newStreak));
      localStorage.setItem(MAKE_EXACT_OPS_STORAGE_KEYS.LONGEST_STREAK, String(newLongestStreak));
      localStorage.setItem(MAKE_EXACT_OPS_STORAGE_KEYS.SOLVED_TODAY, "true");
      localStorage.setItem(MAKE_EXACT_OPS_STORAGE_KEYS.SOLVED_DATE, today);
      localStorage.setItem(MAKE_EXACT_OPS_STORAGE_KEYS.SOLUTION_INPUT, solutionInput);
      localStorage.setItem(MAKE_EXACT_OPS_STORAGE_KEYS.SOLUTION_TIME, String(timeElapsed));
    } catch (error) {
      console.error('Error updating localStorage:', error);
    }

    return streakMessage;
  };

  const resetGameState = () => {
    if (typeof window === "undefined") return;

    // Reset all localStorage values
    Object.values(MAKE_EXACT_OPS_STORAGE_KEYS).forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.error(`Error removing ${key}:`, e);
      }
    });

    // Reset state
    setUpdatedState(EMPTY_GAME_STATE);
  };

  return {
    streaks: { streak, longestStreak } as Streaks,
    solved,
    solveTime,
    lastSolution,
    solvePuzzle,
    resetGameState
  };
}
