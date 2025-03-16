import { useState, useEffect, useCallback } from "react";
import { STORAGE_KEYS, STREAK_TIME_LIMIT, DEBUG_MODE } from "./constants";
import { getTodayDateString, getYesterdayDateString } from "./date-utils";
import { Streaks } from "./types";

/**
 * Simple, direct approach to managing game state with localStorage
 */
export function useSimpleGameState() {
  // State to track UI values
  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [solved, setSolved] = useState(false);
  const [solveTime, setSolveTime] = useState<number | null>(null);
  
  // Load state from localStorage - can be called directly when needed
  const loadStateFromStorage = useCallback(() => {
    const today = getTodayDateString();
    const yesterday = getYesterdayDateString();
    
    // Get stored values (handle null/undefined cases)
    const savedStreak = parseInt(localStorage.getItem(STORAGE_KEYS.STREAK) || '0', 10);
    const savedLongestStreak = parseInt(localStorage.getItem(STORAGE_KEYS.LONGEST_STREAK) || '0', 10);
    const savedSolvedDate = localStorage.getItem(STORAGE_KEYS.SOLVED_DATE);
    const savedSolvedToday = localStorage.getItem(STORAGE_KEYS.SOLVED_TODAY) === "true";
    
    if (DEBUG_MODE) {
      console.log('Loading from storage:', {
        savedStreak,
        savedLongestStreak,
        savedSolvedDate,
        savedSolvedToday,
        today,
        yesterday
      });
    }
    
    // Check for missed days
    if (savedSolvedDate && savedSolvedDate !== today && savedSolvedDate !== yesterday) {
      if (DEBUG_MODE) console.log('Missed days detected, resetting streak');
      // Reset streak (more than one day missed)
      setStreak(0);
      setLongestStreak(savedLongestStreak);
      localStorage.setItem(STORAGE_KEYS.STREAK, '0');
    } else {
      // Set state based on localStorage values
      setStreak(savedStreak);
      setLongestStreak(savedLongestStreak);
    }
    
    // Check if already solved today
    if (savedSolvedToday && savedSolvedDate === today) {
      setSolved(true);
    } else {
      setSolved(false);
    }
  }, []);

  // Verify localStorage is available and working
  useEffect(() => {
    try {
      // Test basic functionality
      localStorage.setItem('__test', 'working');
      const testValue = localStorage.getItem('__test');
      if (DEBUG_MODE) console.log('localStorage test:', testValue);
      localStorage.removeItem('__test');
      
      // Load initial values
      loadStateFromStorage();
    } catch (error) {
      console.error('localStorage error:', error);
      // Fallback to memory-only mode if localStorage is unavailable
    }
  }, [loadStateFromStorage]); // ✅ Added `loadStateFromStorage` as a dependency
  
  // Solve puzzle and update streak
  const solvePuzzle = (timeElapsed: number): string => {
    if (solved) return ""; // Already solved
    
    const today = getTodayDateString();
    let newStreak = streak;
    let streakMessage = "";
    
    if (DEBUG_MODE) console.log('Solving puzzle:', { timeElapsed, currentStreak: streak });
    
    // Update solve state
    setSolveTime(timeElapsed);
    setSolved(true);
    
    // Calculate new streak value
    if (timeElapsed <= STREAK_TIME_LIMIT) {
      // Fast enough - increment streak
      newStreak = streak + 1;
      
      if (newStreak === 1) {
        streakMessage = "🎯 Streak started! Come back tomorrow to continue!";
      } else if (newStreak > longestStreak) {
        streakMessage = `🏆 New record! ${newStreak} day streak!`;
      } else {
        streakMessage = `🔥 ${newStreak} day streak!`;
      }
    } else {
      // Too slow - reset streak
      newStreak = 0;
      streakMessage = `⏱️ Solve within ${STREAK_TIME_LIMIT} seconds to maintain your streak!`;
    }
    
    // Calculate new longest streak
    const newLongestStreak = Math.max(newStreak, longestStreak);
    
    // Update UI state
    setStreak(newStreak);
    setLongestStreak(newLongestStreak);
    
    if (DEBUG_MODE) console.log('New streak values:', { newStreak, newLongestStreak });
    
    // IMPORTANT: Update localStorage with window reference to ensure global scope
    try {
      window.localStorage.setItem(STORAGE_KEYS.STREAK, String(newStreak));
      window.localStorage.setItem(STORAGE_KEYS.LONGEST_STREAK, String(newLongestStreak));
      window.localStorage.setItem(STORAGE_KEYS.SOLVED_TODAY, "true");
      window.localStorage.setItem(STORAGE_KEYS.SOLVED_DATE, today);
      
      // Verify values were set correctly
      if (DEBUG_MODE) {
        console.log('Verified localStorage values:', {
          streak: localStorage.getItem(STORAGE_KEYS.STREAK),
          longestStreak: localStorage.getItem(STORAGE_KEYS.LONGEST_STREAK),
          solvedToday: localStorage.getItem(STORAGE_KEYS.SOLVED_TODAY),
          solvedDate: localStorage.getItem(STORAGE_KEYS.SOLVED_DATE)
        });
      }
    } catch (error) {
      console.error('Error updating localStorage:', error);
    }
    
    // Fire storage event to notify other components (like the debugger)
    try {
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      if (DEBUG_MODE) console.log('Could not dispatch storage event:', e);
    }
    
    return streakMessage;
  };
  
  // Reset everything (for debugging)
  const resetGameState = () => {
    // Clear all localStorage values
    Object.values(STORAGE_KEYS).forEach(key => {
      try {
        window.localStorage.removeItem(key);
      } catch (e) {
        console.error(`Error removing ${key}:`, e);
      }
    });
    
    // Reset state
    setStreak(0);
    setLongestStreak(0);
    setSolved(false);
    setSolveTime(null);
    
    if (DEBUG_MODE) console.log('Game state reset');
    
    // Fire storage event to notify other components
    try {
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      if (DEBUG_MODE) console.log('Could not dispatch storage event:', e);
    }
  };
  
  return {
    streaks: { streak, longestStreak } as Streaks,
    solved,
    solveTime,
    solvePuzzle,
    resetGameState,
    refreshState: loadStateFromStorage
  };
}