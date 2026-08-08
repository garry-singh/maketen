import { getTodayDateString } from "../date-utils";
import { useClientValue } from "../use-client-value";
import { GameConfig } from "./config";

export interface GameStatus {
  streak: number;
  /** Solved or given up on today, so there is nothing left to play */
  doneToday: boolean;
}

const NO_STATUSES: Record<string, GameStatus> = {};

const readStatuses = (games: GameConfig[]): Record<string, GameStatus> => {
  const today = getTodayDateString();
  const statuses: Record<string, GameStatus> = {};

  for (const game of games) {
    try {
      const keys = game.storageKeys;
      statuses[game.id] = {
        streak: parseInt(localStorage.getItem(keys.STREAK) || "0", 10),
        doneToday:
          (localStorage.getItem(keys.SOLVED_TODAY) === "true" &&
            localStorage.getItem(keys.SOLVED_DATE) === today) ||
          localStorage.getItem(keys.REVEALED_DATE) === today,
      };
    } catch {
      // localStorage unavailable - fall back to showing no status
    }
  }

  return statuses;
};

/**
 * Each game's streak and whether today's puzzle is already done.
 *
 * Browser-only, so the server render shows the modes without status rather than
 * guessing and then correcting itself.
 */
export const useGameStatuses = (
  games: GameConfig[]
): Record<string, GameStatus> =>
  useClientValue(() => readStatuses(games), NO_STATUSES);
