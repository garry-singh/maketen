import { MakeTenPuzzle } from "../types";
import { predefinedPuzzles } from "../../app/makeTenPuzzles";
import { getTodayDateString } from "../date-utils";
import { pickForDate, shuffleForDate } from "../games/daily-puzzle";

/**
 * Picks today's Make Ten puzzle.
 *
 * Server-only: it pulls in the full puzzle catalogue, which must never reach
 * the browser. Pages call this and pass the single puzzle down as a prop.
 */
export const generateDailyPuzzle = (): MakeTenPuzzle => {
  const today = getTodayDateString();
  const puzzle = pickForDate(predefinedPuzzles, today);

  return {
    numbers: shuffleForDate(puzzle.numbers, today),
    solution: puzzle.solution,
    date: today,
  };
};
