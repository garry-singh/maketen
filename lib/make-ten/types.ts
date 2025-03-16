export interface Puzzle {
    date: string;
    numbers: number[];
    solution: string;
  }
  
  export interface ValidationResult {
    isValid: boolean;
    error?: string;
  }
  
  export interface Streaks {
    streak: number;
    longestStreak: number;
  }