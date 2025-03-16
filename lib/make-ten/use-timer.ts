import { useState, useEffect } from "react";
import { STORAGE_KEYS } from "./constants";
import { getTodayDateString } from "./date-utils";

// Additional storage key for first encounter time
const FIRST_LOAD_TIME = "firstLoadTime";

/**
 * Custom hook to manage puzzle timer with anti-farming protection
 * @param solved - Whether puzzle is already solved
 * @returns Timer state and functions
 */
export const useTimer = (solved: boolean) => {
  const [startTime, setStartTime] = useState<number>(Date.now());
  
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const today = getTodayDateString();
    const firstLoadKey = `${FIRST_LOAD_TIME}_${today}`;
    
    // Only set first load time if it doesn't exist for today and not already solved
    if (!localStorage.getItem(firstLoadKey) && !solved) {
      localStorage.setItem(firstLoadKey, Date.now().toString());
    }
    
    const savedStartTime = localStorage.getItem(STORAGE_KEYS.PUZZLE_START_TIME);
    const savedPuzzleDate = localStorage.getItem(STORAGE_KEYS.PUZZLE_DATE);
    const firstLoadTime = localStorage.getItem(firstLoadKey);
    
    // If it's a new day, reset all times
    if (savedPuzzleDate !== today) {
      const newTime = Date.now();
      setStartTime(newTime);
      localStorage.setItem(STORAGE_KEYS.PUZZLE_START_TIME, newTime.toString());
      localStorage.setItem(STORAGE_KEYS.PUZZLE_DATE, today);
      
      // If this is the first load of the day, set firstLoadTime too
      if (!firstLoadTime) {
        localStorage.setItem(firstLoadKey, newTime.toString());
      }
    } else {
      // Anti-farming: Always use the EARLIEST recorded time between firstLoadTime and puzzleStartTime
      if (firstLoadTime && savedStartTime) {
        const firstLoad = parseInt(firstLoadTime, 10);
        const puzzleStart = parseInt(savedStartTime, 10);
        setStartTime(Math.min(firstLoad, puzzleStart));
      } else if (firstLoadTime) {
        setStartTime(parseInt(firstLoadTime, 10));
      } else if (savedStartTime) {
        setStartTime(parseInt(savedStartTime, 10));
      } else {
        // Edge case: Neither time exists but it's the same day
        const newTime = Date.now();
        setStartTime(newTime);
        localStorage.setItem(STORAGE_KEYS.PUZZLE_START_TIME, newTime.toString());
        localStorage.setItem(firstLoadKey, newTime.toString());
      }
    }
  }, [solved]);

  /**
   * Calculate elapsed time in seconds
   * Always uses the earliest recorded time for the day
   * @returns Time elapsed since earliest puzzle encounter in seconds
   */
  const getElapsedTime = (): number => {
    const today = getTodayDateString();
    const savedStartTime = localStorage.getItem(STORAGE_KEYS.PUZZLE_START_TIME);
    const firstLoadTime = localStorage.getItem(`${FIRST_LOAD_TIME}_${today}`);
    
    let earliestTime = startTime;
    
    // Find the earliest time between all possibilities
    if (firstLoadTime && savedStartTime) {
      const firstLoad = parseInt(firstLoadTime, 10);
      const puzzleStart = parseInt(savedStartTime, 10);
      earliestTime = Math.min(firstLoad, puzzleStart);
    } else if (firstLoadTime) {
      earliestTime = parseInt(firstLoadTime, 10);
    } else if (savedStartTime) {
      earliestTime = parseInt(savedStartTime, 10);
    }
    
    return parseFloat(((Date.now() - earliestTime) / 1000).toFixed(3));
  };
  
  return {
    startTime,
    getElapsedTime,
  };
};