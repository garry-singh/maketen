import { MakeTenPuzzle } from "../types";
import { predefinedPuzzles } from "../../app/makeTenPuzzles";
import { getTodayDateString } from "../date-utils";
import { evaluateArithmetic } from "../expression-eval";

/**
 * Permutes an array of numbers
 * @param arr - The array to permute
 * @returns All possible permutations
 */
function permute(arr: number[]): number[][] {
  if (arr.length === 1) return [arr];
  const result: number[][] = [];
  for (let i = 0; i < arr.length; i++) {
    const rest = permute(arr.slice(0, i).concat(arr.slice(i + 1)));
    for (const r of rest) {
      result.push([arr[i]].concat(r));
    }
  }
  return result;
}

/**
 * Gets a deterministic random number based on a seed
 * @param seed - The seed value
 * @returns A pseudo-random number between 0 and 1
 */
function getSeededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * Attempts to generate a puzzle with the provided seed
 * @param seed - The seed value for randomness
 * @returns A puzzle object or null if generation fails
 */
function attemptGeneratePuzzle(
  seed: number
): { numbers: number[]; solution: string } | null {
  const numCount = Math.floor(getSeededRandom(seed) * 3) + 4;
  const numbers = Array.from(
    { length: numCount },
    () => Math.floor(getSeededRandom(seed * 2) * 10) + 1
  );

  if (new Set(numbers).size < 2) return null; // Ensure at least 2 unique numbers

  const numberPermutations = permute(numbers);
  const operators = ["+", "-", "*", "/"];

  for (const numSet of numberPermutations) {
    for (const opSet of operators.map((op) => [op, op, op])) {
      const expr = `(${numSet[0]} ${opSet[0]} ${numSet[1]}) ${opSet[1]} ${numSet[2]} ${opSet[2]} ${numSet[3]}`;
      try {
        if (evaluateArithmetic(expr) === 10) {
          return { numbers: numSet, solution: expr };
        }
      } catch {
        continue;
      }
    }
  }
  return null;
}

/**
 * Generates a daily puzzle based on the current date
 * @returns A puzzle object
 */
export const generateDailyPuzzle = (): MakeTenPuzzle => {
  const today = getTodayDateString();
  const seed = parseInt(today.replace(/-/g, ""));
  let puzzle = attemptGeneratePuzzle(seed);

  if (!puzzle) {
    const fallbackPuzzle = predefinedPuzzles[seed % predefinedPuzzles.length];
    puzzle = {
      numbers: [...fallbackPuzzle.numbers].sort(() => Math.random() - 0.5), // Shuffle numbers
      solution: fallbackPuzzle.solution,
    };
  }

  return { ...puzzle, date: today };
};