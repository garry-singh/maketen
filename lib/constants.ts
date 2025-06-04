export const SOCIAL_LINKS = {
    twitter: "https://x.com/MakeTenGame",
  };
  
  export const STREAK_TIME_LIMIT = 45; // Seconds
  export const STREAK_TIME_LIMIT_MAKE_X = 180; // Seconds
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
    FIRST_LOAD_TIME: "firstLoadTime",
    // New keys for storing solution details
    SOLUTION_INPUT: "solutionInput",
    SOLUTION_TIME: "solutionTime"
  };

  // localStorage keys for make X - ensure these are consistent across the application
  export const MAKE_X_STORAGE_KEYS = {
    STREAK: "make_x_streak",
    LONGEST_STREAK: "make_x_longest_streak",
    SOLVED_TODAY: "make_x_solved_today",
    SOLVED_DATE: "make_x_solved_date",
    SOLUTION_INPUT: "make_x_solution_input",
    SOLUTION_TIME: "make_x_solution_time",
    PUZZLE_START_TIME: "make_x_puzzle_start_time",
    PUZZLE_DATE: "make_x_puzzle_date",
    FIRST_LOAD_TIME: "make_x_first_load_time",
  }
  
  // Console logging flag - turn off in production
  export const DEBUG_MODE = process.env.NODE_ENV === 'development';

  // Security constants
  export const SECURITY = {
    MAX_INPUT_LENGTH: 50,
    RATE_LIMIT_ATTEMPTS: 10,
    RATE_LIMIT_WINDOW: 60000, // 1 minute in milliseconds
    STORAGE_VERSION: '1.0.0',
  } as const;

  // localStorage keys for make exact ops - ensure these are consistent across the application
  export const MAKE_EXACT_OPS_STORAGE_KEYS = {
    STREAK: "make_exact_ops_streak",
    LONGEST_STREAK: "make_exact_ops_longest_streak",
    SOLVED_TODAY: "make_exact_ops_solved_today",
    SOLVED_DATE: "make_exact_ops_solved_date",
    SOLUTION_INPUT: "make_exact_ops_solution_input",
    SOLUTION_TIME: "make_exact_ops_solution_time",
    PUZZLE_START_TIME: "make_exact_ops_puzzle_start_time",
    PUZZLE_DATE: "make_exact_ops_puzzle_date",
    FIRST_LOAD_TIME: "make_exact_ops_first_load_time"
  };