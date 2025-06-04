import { predefinedExactOpsPuzzles } from "@/app/makeExactOps";
import { getTodayDateString } from "../date-utils";

export const generateDailyExactOpsPuzzle = () => {
  const today = getTodayDateString();
  const seed = parseInt(today.replace(/-/g, "")); // Convert "2024-03-15" to 20240315
  
  // Select puzzle using the seed
  const puzzle = predefinedExactOpsPuzzles[seed % predefinedExactOpsPuzzles.length];
  
  return {
    ...puzzle,
    date: today
  };
}; 