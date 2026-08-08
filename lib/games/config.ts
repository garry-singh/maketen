import {
  STORAGE_KEYS,
  MAKE_X_STORAGE_KEYS,
  MAKE_EXACT_OPS_STORAGE_KEYS,
  STREAK_TIME_LIMIT,
  STREAK_TIME_LIMIT_MAKE_X,
} from "../constants";

export interface GameStorageKeys {
  STREAK: string;
  LONGEST_STREAK: string;
  SOLVED_TODAY: string;
  SOLVED_DATE: string;
  SOLUTION_INPUT: string;
  SOLUTION_TIME: string;
  PUZZLE_START_TIME: string;
  PUZZLE_DATE: string;
  FIRST_LOAD_TIME: string;
}

export interface GameConfig {
  /** Used in share text and the "How to play" dialog */
  name: string;
  storageKeys: GameStorageKeys;
  /** Seconds within which a solve counts toward the streak */
  streakTimeLimit: number;
}

/**
 * Formats a streak limit for display, so the UI and the help dialog can never
 * drift from the value actually enforced in `solvePuzzle`.
 */
export const formatStreakLimit = (seconds: number): string => {
  if (seconds % 60 === 0) {
    const minutes = seconds / 60;
    return minutes === 1 ? "1 min" : `${minutes} mins`;
  }
  return `${seconds} sec`;
};

export const MAKE_TEN_GAME: GameConfig = {
  name: "Make 10",
  storageKeys: STORAGE_KEYS,
  streakTimeLimit: STREAK_TIME_LIMIT,
};

export const MAKE_X_GAME: GameConfig = {
  name: "Make X",
  storageKeys: MAKE_X_STORAGE_KEYS,
  streakTimeLimit: STREAK_TIME_LIMIT_MAKE_X,
};

export const MAKE_EXACT_OPS_GAME: GameConfig = {
  name: "Make Exact Operations",
  storageKeys: MAKE_EXACT_OPS_STORAGE_KEYS,
  streakTimeLimit: STREAK_TIME_LIMIT,
};
