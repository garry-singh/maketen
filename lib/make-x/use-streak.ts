import { useState, useEffect } from "react";
import { Streaks } from "../types";
import { STREAK_TIME_LIMIT_MAKE_X } from "../constants";
import { getTodayDateString, getYesterdayDateString } from "../date-utils";
import { MAKE_X_STORAGE_KEYS } from "../constants";

/**
 * Custom hook to manage streak logic for MakeX
 * @returns Object containing streak state and functions
 */
export const useStreak = () => {
  const [streaks, setStreaks] = useState<Streaks>({ streak: 0, longestStreak: 0 });
  const [solved, setSolved] = useState<boolean>(false);
  const [solveTime, setSolveTime] = useState<number | null>(null);
  
  // Initial load of streak data and solved status
  useEffect(() => {
    if (typeof window === "undefined") return;

    const today = getTodayDateString();
    const yesterday = getYesterdayDateString();
    
    // Load all values from localStorage
    const savedStreak = parseInt(localStorage.getItem(MAKE_X_STORAGE_KEYS.STREAK) || "0", 10);
    const savedLongestStreak = parseInt(
      localStorage.getItem(MAKE_X_STORAGE_KEYS.LONGEST_STREAK) || "0",
      10
    );
    const savedSolvedDate = localStorage.getItem(MAKE_X_STORAGE_KEYS.SOLVED_DATE);
    const savedSolvedToday = localStorage.getItem(MAKE_X_STORAGE_KEYS.SOLVED_TODAY) === "true";
    
    // If we've solved today, just mark as solved and use stored streak values
    if (savedSolvedToday && savedSolvedDate === today) {
      setSolved(true);
      setStreaks({ streak: savedStreak, longestStreak: savedLongestStreak });
      return;
    }
    
    // If we missed a day (not yesterday and not today), reset streak
    if (savedSolvedDate && savedSolvedDate !== today && savedSolvedDate !== yesterday) {
      setStreaks({ streak: 0, longestStreak: savedLongestStreak });
      localStorage.setItem(MAKE_X_STORAGE_KEYS.STREAK, "0");
    } else {
      // Otherwise, use the stored streak values
      setStreaks({ streak: savedStreak, longestStreak: savedLongestStreak });
    }
    
    // Mark as unsolved for a new day
    setSolved(false);
  }, []);

  // Sync streaks to localStorage whenever they change
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    localStorage.setItem(MAKE_X_STORAGE_KEYS.STREAK, streaks.streak.toString());
    localStorage.setItem(MAKE_X_STORAGE_KEYS.LONGEST_STREAK, streaks.longestStreak.toString());
  }, [streaks]);

  /**
   * Updates streak based on puzzle completion
   * @param timeElapsed - Time taken to solve the puzzle in seconds
   * @returns Streak message for the user
   */
  const updateStreak = (timeElapsed: number): string => {
    if (solved) return ""; // Already solved today

    // Record the solve time
    setSolveTime(timeElapsed);
    
    // Mark as solved
    setSolved(true);

    const today = getTodayDateString();
    
    // Get current streak values
    const currentStreak = streaks.streak;
    const currentLongestStreak = streaks.longestStreak;
    
    let newStreak = currentStreak;
    let streakMessage = "";

    // Determine new streak value
    if (timeElapsed <= STREAK_TIME_LIMIT_MAKE_X) {
      // Fast enough for streak eligibility - increment streak
      newStreak = currentStreak + 1;
      
      if (newStreak === 1) {
        // First day of streak
        streakMessage = "🎯 Streak started! Come back tomorrow to continue!";
      } else if (newStreak > currentLongestStreak) {
        // New record
        streakMessage = `🏆 New record! ${newStreak} day streak!`;
      } else {
        // Continuing streak
        streakMessage = `🔥 ${newStreak} day streak!`;
      }
    } else {
      // Too slow - reset streak
      newStreak = 0;
      streakMessage = `⏱️ Solve within ${STREAK_TIME_LIMIT_MAKE_X} seconds to maintain your streak!`;
    }

    // Update longest streak
    const newLongestStreak = Math.max(newStreak, currentLongestStreak);

    // Update all state and localStorage
    setStreaks({ streak: newStreak, longestStreak: newLongestStreak });
    
    // Update localStorage to record the solve
    localStorage.setItem(MAKE_X_STORAGE_KEYS.STREAK, newStreak.toString());
    localStorage.setItem(MAKE_X_STORAGE_KEYS.LONGEST_STREAK, newLongestStreak.toString());
    localStorage.setItem(MAKE_X_STORAGE_KEYS.SOLVED_TODAY, "true");
    localStorage.setItem(MAKE_X_STORAGE_KEYS.SOLVED_DATE, today);

    return streakMessage;
  };

  /**
   * Utility function to reset streak data (for debugging)
   */
  const resetStreakData = () => {
    if (typeof window === "undefined") return;
    
    // Reset all streak-related localStorage
    localStorage.removeItem(MAKE_X_STORAGE_KEYS.STREAK);
    localStorage.removeItem(MAKE_X_STORAGE_KEYS.LONGEST_STREAK);
    localStorage.removeItem(MAKE_X_STORAGE_KEYS.SOLVED_TODAY);
    localStorage.removeItem(MAKE_X_STORAGE_KEYS.SOLVED_DATE);
    
    // Reset state
    setStreaks({ streak: 0, longestStreak: 0 });
    setSolved(false);
    setSolveTime(null);
  };

  return {
    streaks,
    solved,
    solveTime,
    updateStreak,
    setSolved,
    resetStreakData, // Expose reset function for debugging
  };
}; 