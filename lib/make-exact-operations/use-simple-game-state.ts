import { useState, useEffect } from "react";
import { MAKE_EXACT_OPS_STORAGE_KEYS, STREAK_TIME_LIMIT, DEBUG_MODE } from "../constants";
import { getTodayDateString, getYesterdayDateString } from "../date-utils";
import { Streaks } from "../types";

/**
 * Simple, direct approach to managing game state with localStorage
 */
export function useSimpleGameState() {
  // State to track UI values
  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [solved, setSolved] = useState(false);
  const [solveTime, setSolveTime] = useState<number | null>(null);
  const [lastSolution, setLastSolution] = useState<string>("");
  
  // Load initial state from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    try {
      // Test basic functionality
      localStorage.setItem('__test', 'working');
      const testValue = localStorage.getItem('__test');
      if (DEBUG_MODE) console.log('localStorage test:', testValue);
      localStorage.removeItem('__test');
      
      const today = getTodayDateString();
      const yesterday = getYesterdayDateString();
      
      // Get stored values (handle null/undefined cases)
      const savedStreak = parseInt(localStorage.getItem(MAKE_EXACT_OPS_STORAGE_KEYS.STREAK) || '0', 10);
      const savedLongestStreak = parseInt(localStorage.getItem(MAKE_EXACT_OPS_STORAGE_KEYS.LONGEST_STREAK) || '0', 10);
      const savedSolvedDate = localStorage.getItem(MAKE_EXACT_OPS_STORAGE_KEYS.SOLVED_DATE);
      const savedSolvedToday = localStorage.getItem(MAKE_EXACT_OPS_STORAGE_KEYS.SOLVED_TODAY) === "true";
      
      // Get saved solution details
      const savedSolutionInput = localStorage.getItem(MAKE_EXACT_OPS_STORAGE_KEYS.SOLUTION_INPUT) || "";
      const savedSolutionTime = localStorage.getItem(MAKE_EXACT_OPS_STORAGE_KEYS.SOLUTION_TIME);
      
      if (DEBUG_MODE) {
        console.log('Loading from storage:', {
          savedStreak,
          savedLongestStreak,
          savedSolvedDate,
          savedSolvedToday,
          savedSolutionInput,
          savedSolutionTime,
          today,
          yesterday
        });
      }
      
      // If we've solved today, just mark as solved and use stored streak values
      if (savedSolvedToday && savedSolvedDate === today) {
        setSolved(true);
        setStreak(savedStreak);
        setLongestStreak(savedLongestStreak);
        if (savedSolutionInput) {
          setLastSolution(savedSolutionInput);
        }
        if (savedSolutionTime) {
          setSolveTime(parseFloat(savedSolutionTime));
        }
        return;
      }
      
      // If we missed a day (not yesterday and not today), reset streak
      if (savedSolvedDate && savedSolvedDate !== today && savedSolvedDate !== yesterday) {
        if (DEBUG_MODE) console.log('Missed days detected, resetting streak');
        setStreak(0);
        setLongestStreak(savedLongestStreak);
        localStorage.setItem(MAKE_EXACT_OPS_STORAGE_KEYS.STREAK, '0');
      } else {
        // Otherwise, use the stored streak values
        setStreak(savedStreak);
        setLongestStreak(savedLongestStreak);
      }
      
      // Mark as unsolved for a new day
      setSolved(false);
      setLastSolution("");
      setSolveTime(null);
    } catch (error) {
      console.error('localStorage error:', error);
    }
  }, []);

  // Sync streaks to localStorage whenever they change
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    localStorage.setItem(MAKE_EXACT_OPS_STORAGE_KEYS.STREAK, streak.toString());
    localStorage.setItem(MAKE_EXACT_OPS_STORAGE_KEYS.LONGEST_STREAK, longestStreak.toString());
  }, [streak, longestStreak]);

  const solvePuzzle = (timeElapsed: number, solutionInput: string): string => {
    if (solved) return ""; // Already solved today

    // Record the solve time and solution
    setSolveTime(timeElapsed);
    setSolved(true);
    setLastSolution(solutionInput);

    const today = getTodayDateString();
    let newStreak = streak;
    let streakMessage = "";

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

    // Update localStorage
    try {
      localStorage.setItem(MAKE_EXACT_OPS_STORAGE_KEYS.STREAK, String(newStreak));
      localStorage.setItem(MAKE_EXACT_OPS_STORAGE_KEYS.LONGEST_STREAK, String(newLongestStreak));
      localStorage.setItem(MAKE_EXACT_OPS_STORAGE_KEYS.SOLVED_TODAY, "true");
      localStorage.setItem(MAKE_EXACT_OPS_STORAGE_KEYS.SOLVED_DATE, today);
      localStorage.setItem(MAKE_EXACT_OPS_STORAGE_KEYS.SOLUTION_INPUT, solutionInput);
      localStorage.setItem(MAKE_EXACT_OPS_STORAGE_KEYS.SOLUTION_TIME, String(timeElapsed));
    } catch (error) {
      console.error('Error updating localStorage:', error);
    }

    return streakMessage;
  };

  const resetGameState = () => {
    if (typeof window === "undefined") return;
    
    // Reset all localStorage values
    Object.values(MAKE_EXACT_OPS_STORAGE_KEYS).forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.error(`Error removing ${key}:`, e);
      }
    });
    
    // Reset state
    setStreak(0);
    setLongestStreak(0);
    setSolved(false);
    setSolveTime(null);
    setLastSolution("");
  };

  return {
    streaks: { streak, longestStreak } as Streaks,
    solved,
    solveTime,
    lastSolution,
    solvePuzzle,
    resetGameState
  };
} 