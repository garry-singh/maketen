import { Streaks } from "../types";

export interface GameState {
  streaks: Streaks;
  solved: boolean;
  solveTime: number | null;
  lastSolvedDate: string | null;
}

export type GameAction = 
  | { type: 'LOAD_SAVED_STATE'; payload: Partial<GameState> }
  | { type: 'RESET_STREAK'; payload: { keepLongestStreak: boolean } }
  | { type: 'SOLVE_PUZZLE'; payload: { timeElapsed: number; today: string } }
  | { type: 'RESET_STATE' };