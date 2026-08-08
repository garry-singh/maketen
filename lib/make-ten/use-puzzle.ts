import { useState } from "react";
import { MakeTenPuzzle } from "../types";
import { generateDailyPuzzle } from "./puzzle-generator";
import { VALID_KEYS } from "../constants";
import { useClientValue } from "../use-client-value";
import { toast } from "sonner";

interface PuzzleLoad {
  puzzle: MakeTenPuzzle | null;
  error: string | null;
}

// Nothing is loaded during the server render, so the UI starts out loading
const PENDING_PUZZLE: PuzzleLoad = { puzzle: null, error: null };

const loadDailyPuzzle = (): PuzzleLoad => {
  try {
    return { puzzle: generateDailyPuzzle(), error: null };
  } catch (err) {
    console.error("Error generating puzzle:", err);
    return {
      puzzle: null,
      error:
        "Failed to generate today's puzzle. Please try refreshing the page.",
    };
  }
};

/**
 * Custom hook to manage puzzle state
 * @returns Puzzle state and related functions
 */
export const usePuzzle = () => {
  // The puzzle depends on the current date, so it can only be built in the
  // browser - the pages are prerendered at build time.
  const { puzzle, error } = useClientValue(loadDailyPuzzle, PENDING_PUZZLE);
  const isLoading = puzzle === null && error === null;

  const [userInput, setUserInput] = useState<string>("");
  const [trackedUsage, setUsedNumbers] = useState<number[]>([]);

  // Until the player touches a number, every slot in today's puzzle is unused
  const numberCount = puzzle?.numbers.length ?? 0;
  const usedNumbers =
    trackedUsage.length === numberCount
      ? trackedUsage
      : new Array<number>(numberCount).fill(0);

  /**
   * Handle keyboard input
   * @param key - Key that was pressed
   * @param puzzleSolved - Whether the puzzle is already solved
   */
  const handleKeyboardInput = (key: string, puzzleSolved: boolean) => {
    if (puzzleSolved) return;

    if (key === "ENTER" || key === "Enter") {
      return; // This will be handled separately
    } else if (key === "⌫" || key === "Backspace") {
      if (userInput.length === 0) {
        toast.info("Nothing to delete!");
        return;
      }
      removeLastUsedNumber();
      setUserInput((prev) => prev.slice(0, -1));
      return;
    } else if (VALID_KEYS.has(key)) {
      if (key.match(/\d/) && !puzzle?.numbers.includes(parseInt(key))) {
        toast.error("That number isn't available!");
        return;
      }
      setUserInput((prev) => prev + key);
      if (key.match(/\d/)) {
        markNumberUsed(parseInt(key));
      }
    }
  };

  /**
   * Mark a number as used in the input
   * @param num - Number to mark as used
   */
  const markNumberUsed = (num: number) => {
    if (!puzzle) return;

    const numIndex = puzzle.numbers.findIndex(
      (n, index) => n === num && usedNumbers[index] === 0
    );

    if (numIndex !== -1) {
      const updatedUsage = [...usedNumbers];
      updatedUsage[numIndex] = 1; // Mark as used
      setUsedNumbers(updatedUsage);
    }
  };

  /**
   * Remove the last used number when backspace is pressed
   */
  const removeLastUsedNumber = () => {
    if (!puzzle) return;

    const lastNum = parseInt(userInput[userInput.length - 1]);
    if (!isNaN(lastNum)) {
      const lastUsedIndex = usedNumbers.lastIndexOf(1);

      if (lastUsedIndex !== -1) {
        const updatedUsage = [...usedNumbers];
        updatedUsage[lastUsedIndex] = 0; // Mark as unused
        setUsedNumbers(updatedUsage);
      }
    }
  };

  /**
   * Handle input changes from text input
   * @param e - Input change event
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const filteredValue = e.target.value
      .split("")
      .filter((char) => VALID_KEYS.has(char))
      .join("");
    setUserInput(filteredValue);
  };

  return {
    puzzle,
    userInput,
    setUserInput,
    usedNumbers,
    isLoading,
    error,
    handleKeyboardInput,
    handleInputChange,
  };
};