import { useState, useEffect } from "react";
import { Puzzle } from "./types";
import { generateDailyPuzzle } from "./puzzle-generator";
import { VALID_KEYS } from "./constants";
import { toast } from "sonner";

/**
 * Custom hook to manage puzzle state
 * @returns Puzzle state and related functions
 */
export const usePuzzle = () => {
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [userInput, setUserInput] = useState<string>("");
  const [usedNumbers, setUsedNumbers] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load puzzle
  useEffect(() => {
    try {
      const generatedPuzzle = generateDailyPuzzle();
      setPuzzle(generatedPuzzle);
      setUsedNumbers(new Array(generatedPuzzle.numbers.length).fill(0));
      setIsLoading(false);
      setError(null);
    } catch (err) {
      setError(
        "Failed to generate today's puzzle. Please try refreshing the page."
      );
      setIsLoading(false);
      console.error("Error generating puzzle:", err);
    }
  }, []);

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