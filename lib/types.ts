export interface MakeTenPuzzle {
  numbers: number[];
  solution: string;
  date: string;
}

export interface MakeXPuzzle {
    numbers: number[];
    solution: string;
    target: number;
  }

export interface GameState {
  solved: boolean;
  solveTime: number | null;
  startTime: number | null;
  expression: any[]; // This will be overridden by specific game types
  usedNumbers: boolean[];
}

export interface StreakState {
  streak: number;
  longestStreak: number;
  lastPlayed: number | null;
  lastPuzzle: string | null;
}

export interface Streaks {
  streak: number;
  longestStreak: number;
}

export interface ValidationResult {
    isValid: boolean;
    error?: string;
  }