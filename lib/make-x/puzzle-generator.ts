import { predefinedMakeXPuzzles } from "@/app/makeXPuzzles";
import { getTodayDateString } from "../date-utils";
import { MakeXPuzzle } from "../types";

export const generateDailyMakeXPuzzle = (): MakeXPuzzle => {
    const today = getTodayDateString();
    const seed = parseInt(today.replace(/-/g, "")); // Convert "2024-03-15" to 20240315
    
    // Select puzzle using the seed
    const puzzle = predefinedMakeXPuzzles[seed % predefinedMakeXPuzzles.length];
    
    return {
      ...puzzle,
      // Optionally shuffle the numbers like Make Ten does
      numbers: [...puzzle.numbers].sort(() => Math.random() - 0.5),
      date: today
    };
  };