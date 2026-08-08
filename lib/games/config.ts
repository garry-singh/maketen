import {
  STORAGE_KEYS,
  MAKE_X_STORAGE_KEYS,
  MAKE_EXACT_OPS_STORAGE_KEYS,
  STREAK_TIME_LIMIT,
  STREAK_TIME_LIMIT_MAKE_X,
  SITE_URL,
} from "../constants";

export interface GameStorageKeys {
  STREAK: string;
  LONGEST_STREAK: string;
  SOLVED_TODAY: string;
  SOLVED_DATE: string;
  SOLUTION_INPUT: string;
  SOLUTION_TIME: string;
  /** Prefix for "<key>_<date>" - when the player pressed Start that day */
  PUZZLE_START_TIME: string;
  PUZZLE_DATE: string;
  /** Legacy prefix, no longer written. Kept so old entries still get cleaned up. */
  FIRST_LOAD_TIME: string;
  /** The day the player gave up and revealed the answer */
  REVEALED_DATE: string;
  PLAYED_COUNT: string;
  SOLVED_COUNT: string;
  BEST_TIME: string;
}

export interface GameConfig {
  /** Stable identifier, also used as the React key in lists */
  id: string;
  /** Used in headings, share text and the "How to play" dialog */
  name: string;
  /** One-line summary for navigation and link previews */
  tagline: string;
  /** Route for the daily puzzle */
  path: string;
  /** Hashtag used when sharing a result */
  hashtag: string;
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

export const gameUrl = (game: GameConfig): string => `${SITE_URL}${game.path}`;

export const MAKE_TEN_GAME: GameConfig = {
  id: "make-ten",
  name: "Make 10",
  tagline: "Use every number once to make 10",
  path: "/make-ten",
  hashtag: "Make10",
  storageKeys: STORAGE_KEYS,
  streakTimeLimit: STREAK_TIME_LIMIT,
};

export const MAKE_X_GAME: GameConfig = {
  id: "make-x",
  name: "Make X",
  tagline: "Build an expression that hits the target",
  path: "/make-x",
  hashtag: "MakeX",
  storageKeys: MAKE_X_STORAGE_KEYS,
  streakTimeLimit: STREAK_TIME_LIMIT_MAKE_X,
};

export const MAKE_EXACT_OPS_GAME: GameConfig = {
  id: "make-exact-operations",
  name: "Make Exact Operations",
  tagline: "Find the operators that reach the target",
  path: "/make-exact-operations",
  hashtag: "MakeExactOperations",
  storageKeys: MAKE_EXACT_OPS_STORAGE_KEYS,
  streakTimeLimit: STREAK_TIME_LIMIT,
};

export const ALL_GAMES: GameConfig[] = [
  MAKE_TEN_GAME,
  MAKE_X_GAME,
  MAKE_EXACT_OPS_GAME,
];
