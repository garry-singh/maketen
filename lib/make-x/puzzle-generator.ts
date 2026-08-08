import { predefinedMakeXPuzzles } from "@/app/makeXPuzzles";
import { getTodayDateString } from "../date-utils";
import { MakeXPuzzle } from "../types";
import { pickForDate, shuffleForDate } from "../games/daily-puzzle";

/**
 * Picks today's Make X puzzle.
 *
 * Server-only: it pulls in the full puzzle catalogue, which must never reach
 * the browser. Pages call this and pass the single puzzle down as a prop.
 */
export const generateDailyMakeXPuzzle = (): MakeXPuzzle => {
  const today = getTodayDateString();
  const puzzle = pickForDate(predefinedMakeXPuzzles, today);

  return {
    ...puzzle,
    numbers: shuffleForDate(puzzle.numbers, today),
    date: today,
  };
};
