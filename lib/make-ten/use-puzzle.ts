import { useState } from "react";
import { MakeTenPuzzle } from "../types";
import { VALID_KEYS } from "../constants";
import { toast } from "sonner";

/**
 * Tracks the player's input for today's puzzle and which of the puzzle's
 * numbers it has consumed.
 *
 * @param puzzle - Today's puzzle, resolved on the server
 */
export const usePuzzle = (puzzle: MakeTenPuzzle) => {
  const [userInput, setUserInput] = useState<string>("");
  const [trackedUsage, setUsedNumbers] = useState<number[]>([]);

  // Until the player types a number, every slot in today's puzzle is unused
  const usedNumbers =
    trackedUsage.length === puzzle.numbers.length
      ? trackedUsage
      : new Array<number>(puzzle.numbers.length).fill(0);

  /**
   * Mark a number as used in the input
   * @param num - Number to mark as used
   */
  const markNumberUsed = (num: number) => {
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
   * Release the number that backspace just deleted.
   *
   * Has to match on the deleted digit's value: releasing whichever slot was
   * marked last instead greys out the wrong number whenever the player types
   * them in an order that differs from the puzzle's own.
   */
  const removeLastUsedNumber = () => {
    const deleted = parseInt(userInput[userInput.length - 1]);
    if (isNaN(deleted)) return;

    for (let i = usedNumbers.length - 1; i >= 0; i--) {
      if (puzzle.numbers[i] === deleted && usedNumbers[i] === 1) {
        const updatedUsage = [...usedNumbers];
        updatedUsage[i] = 0; // Mark as unused
        setUsedNumbers(updatedUsage);
        return;
      }
    }
  };

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
      if (key.match(/\d/) && !puzzle.numbers.includes(parseInt(key))) {
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
    userInput,
    setUserInput,
    usedNumbers,
    handleKeyboardInput,
    handleInputChange,
  };
};
