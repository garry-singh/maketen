export interface MakeTenPuzzle {
  numbers: number[];
  solution: string;
  date: string;
}

export interface MakeXPuzzle {
    numbers: number[];
    solution: string;
    target: number;
    date: string;
  }

export interface Streaks {
  streak: number;
  longestStreak: number;
}

export interface ValidationResult {
    isValid: boolean;
    error?: string;
  }