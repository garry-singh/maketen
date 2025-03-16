import { useReducer, useEffect } from "react";
import { GameState, GameAction } from "./game-state-types";
import { STORAGE_KEYS, STREAK_TIME_LIMIT } from "./constants";
import { getTodayDateString, getYesterdayDateString } from "./date-utils";

const initialState: GameState = {
  streaks: { streak: 0, longestStreak: 0 },
  solved: false,
  solveTime: null,
  lastSolvedDate: null
};

/**
 * Game state reducer for atomic state updates
 */
function gameStateReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'LOAD_SAVED_STATE':
      return { ...state, ...action.payload };

    case 'RESET_STREAK':
      return {
        ...state,
        streaks: {
          streak: 0,
          longestStreak: action.payload.keepLongestStreak 
            ? state.streaks.longestStreak 
            : 0
        }
      };
      
    case 'SOLVE_PUZZLE': {
      const { timeElapsed, today } = action.payload;
      let newStreak = state.streaks.streak;
      
      // Determine new streak value
      if (timeElapsed <= STREAK_TIME_LIMIT) {
        // Fast enough for streak eligibility - increment streak
        newStreak = state.streaks.streak + 1;
      } else {
        // Too slow - reset streak
        newStreak = 0;
      }
      
      // Calculate new longest streak
      const newLongestStreak = Math.max(newStreak, state.streaks.longestStreak);
      
      return {
        ...state,
        streaks: { 
          streak: newStreak, 
          longestStreak: newLongestStreak 
        },
        solved: true,
        solveTime: timeElapsed,
        lastSolvedDate: today
      };
    }
      
    case 'RESET_STATE':
      return initialState;
      
    default:
      return state;
  }
}

/**
 * Custom hook to manage game state using reducer for atomic updates
 */
export function useGameState() {
  const [state, dispatch] = useReducer(gameStateReducer, initialState);
  
  // Load state from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const today = getTodayDateString();
    const yesterday = getYesterdayDateString();
    
    // Load all saved data
    const savedStreak = parseInt(localStorage.getItem(STORAGE_KEYS.STREAK) || "0", 10);
    const savedLongestStreak = parseInt(
      localStorage.getItem(STORAGE_KEYS.LONGEST_STREAK) || "0",
      10
    );
    const savedSolvedDate = localStorage.getItem(STORAGE_KEYS.SOLVED_DATE) || null;
    const savedSolvedToday = localStorage.getItem(STORAGE_KEYS.SOLVED_TODAY) === "true";
    
    // Set initial state
    const initialLoadedState: Partial<GameState> = {
      streaks: { streak: savedStreak, longestStreak: savedLongestStreak },
      lastSolvedDate: savedSolvedDate
    };
    
    // Check if solved already
    if (savedSolvedToday && savedSolvedDate === today) {
      initialLoadedState.solved = true;
    }
    
    // Check if we missed multiple days
    if (savedSolvedDate && savedSolvedDate !== today && savedSolvedDate !== yesterday) {
      // Reset streak but keep longest streak record
      dispatch({ type: 'RESET_STREAK', payload: { keepLongestStreak: true } });
      
      // Update localStorage immediately
      localStorage.setItem(STORAGE_KEYS.STREAK, "0");
    } else {
      // Load saved state
      dispatch({ type: 'LOAD_SAVED_STATE', payload: initialLoadedState });
    }
  }, []);
  
  /**
   * Updates state based on puzzle completion
   * @param timeElapsed - Time taken to solve the puzzle in seconds
   * @returns Streak message for the user
   */
  const solvePuzzle = (timeElapsed: number): string => {
    if (state.solved) return ""; // Already solved today
    
    const today = getTodayDateString();
    let newStreak = 0;
    let streakMessage = "";
    
    // Calculate new streak value
    if (timeElapsed <= STREAK_TIME_LIMIT) {
      // Fast enough for streak eligibility - increment streak
      newStreak = state.streaks.streak + 1;
      
      if (newStreak === 1) {
        // First day of streak
        streakMessage = "🎯 Streak started! Come back tomorrow to continue!";
      } else if (newStreak > state.streaks.longestStreak) {
        // New record
        streakMessage = `🏆 New record! ${newStreak} day streak!`;
      } else {
        // Continuing streak
        streakMessage = `🔥 ${newStreak} day streak!`;
      }
    } else {
      // Too slow - reset streak
      streakMessage = `⏱️ Solve within ${STREAK_TIME_LIMIT} seconds to maintain your streak!`;
    }
    
    // Calculate longest streak
    const newLongestStreak = Math.max(newStreak, state.streaks.longestStreak);
    
    // Update localStorage IMMEDIATELY before state update to ensure persistence
    localStorage.setItem(STORAGE_KEYS.STREAK, newStreak.toString());
    localStorage.setItem(STORAGE_KEYS.LONGEST_STREAK, newLongestStreak.toString());
    localStorage.setItem(STORAGE_KEYS.SOLVED_TODAY, "true");
    localStorage.setItem(STORAGE_KEYS.SOLVED_DATE, today);
    
    // Then update state via reducer
    dispatch({ type: 'SOLVE_PUZZLE', payload: { timeElapsed, today } });
    
    return streakMessage;
  };
  
  /**
   * Utility function to reset state (for debugging)
   */
  const resetGameState = () => {
    if (typeof window === "undefined") return;
    
    // Reset all game-related localStorage
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    
    // Reset state
    dispatch({ type: 'RESET_STATE' });
  };
  
  return {
    ...state,
    solvePuzzle,
    resetGameState
  };
}