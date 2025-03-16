export const SOCIAL_LINKS = {
    twitter: "https://x.com/MakeTenGame",
  };
  
  export const STREAK_TIME_LIMIT = 45; // Seconds
  export const TARGET_NUMBER = 10;
  
  export const NUMBERS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  export const OPERATORS = ["+", "-", "*", "/", "⌫", "(", ")"];
  export const VALID_KEYS = new Set([...NUMBERS, ...OPERATORS, "Enter", "Backspace"]);
  
  // localStorage keys - ensure these are consistent across the application
  export const STORAGE_KEYS = {
    STREAK: "streak",
    LONGEST_STREAK: "longestStreak",
    SOLVED_TODAY: "solvedToday",
    SOLVED_DATE: "solvedDate",
    PUZZLE_START_TIME: "puzzleStartTime",
    PUZZLE_DATE: "puzzleDate",
    FIRST_LOAD_TIME: "firstLoadTime"
  };
  
  // Console logging flag - turn off in production
  export const DEBUG_MODE = process.env.NODE_ENV === 'development';