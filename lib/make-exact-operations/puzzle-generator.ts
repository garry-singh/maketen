import { predefinedExactOpsPuzzles } from "@/app/makeExactOps";
import { getTodayDateString } from "../date-utils";
import { pickForDate } from "../games/daily-puzzle";

export interface ExactOpsPuzzle {
  numbers: number[];
  target: number;
  solution: string;
  date: string;
}

/**
 * Picks today's Make Exact Operations puzzle.
 *
 * The numbers are NOT shuffled here - the operator slots sit between them in a
 * fixed order, so the sequence is part of the puzzle.
 *
 * Server-only: it pulls in the full puzzle catalogue, which must never reach
 * the browser. Pages call this and pass the single puzzle down as a prop.
 */
export const generateDailyExactOpsPuzzle = (): ExactOpsPuzzle => {
  const today = getTodayDateString();

  return { ...pickForDate(predefinedExactOpsPuzzles, today), date: today };
};
