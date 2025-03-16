import { useState, useEffect } from "react";
import { STORAGE_KEYS, DEBUG_MODE } from "./constants";
import { getTodayDateString } from "./date-utils";

/**
 * Custom hook to manage puzzle timer with anti-farming protection
 * @param solved - Whether puzzle is already solved
 * @returns Timer state and functions
 */
export const useSecureTimer = (solved: boolean) => {
  const [startTime, setStartTime] = useState<number>(Date.now());
  
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const today = getTodayDateString();
    const firstLoadKey = `${STORAGE_KEYS.FIRST_LOAD_TIME}_${today}`;
    
    try {
      // Only set first load time if it doesn't exist for today and not already solved
      if (!localStorage.getItem(firstLoadKey) && !solved) {
        const now = Date.now();
        localStorage.setItem(firstLoadKey, now.toString());
        if (DEBUG_MODE) console.log(`Set first load time: ${now}`);
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
        
        if (DEBUG_MODE) console.log(`New day, reset timer: ${newTime}`);
      } else {
        // Anti-farming: Always use the EARLIEST recorded time between firstLoadTime and puzzleStartTime
        if (firstLoadTime && savedStartTime) {
          const firstLoad = parseInt(firstLoadTime, 10);
          const puzzleStart = parseInt(savedStartTime, 10);
          const earliestTime = Math.min(firstLoad, puzzleStart);
          setStartTime(earliestTime);
          if (DEBUG_MODE) console.log(`Using earliest time: ${earliestTime}`);
        } else if (firstLoadTime) {
          setStartTime(parseInt(firstLoadTime, 10));
          if (DEBUG_MODE) console.log(`Using first load time: ${firstLoadTime}`);
        } else if (savedStartTime) {
          setStartTime(parseInt(savedStartTime, 10));
          if (DEBUG_MODE) console.log(`Using puzzle start time: ${savedStartTime}`);
        } else {
          // Edge case: Neither time exists but it's the same day
          const newTime = Date.now();
          setStartTime(newTime);
          localStorage.setItem(STORAGE_KEYS.PUZZLE_START_TIME, newTime.toString());
          localStorage.setItem(firstLoadKey, newTime.toString());
          if (DEBUG_MODE) console.log(`No times found, creating new: ${newTime}`);
        }
      }
    } catch (error) {
      console.error('Error in useSecureTimer:', error);
      // Fallback to current time if localStorage fails
      setStartTime(Date.now());
    }
  }, [solved]);

  /**
   * Calculate elapsed time in seconds
   * Always uses the earliest recorded time for the day
   * @returns Time elapsed since earliest puzzle encounter in seconds
   */
  const getElapsedTime = (): number => {
    try {
      const today = getTodayDateString();
      const savedStartTime = localStorage.getItem(STORAGE_KEYS.PUZZLE_START_TIME);
      const firstLoadTime = localStorage.getItem(`${STORAGE_KEYS.FIRST_LOAD_TIME}_${today}`);
      
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
      
      const elapsed = parseFloat(((Date.now() - earliestTime) / 1000).toFixed(3));
      if (DEBUG_MODE) console.log(`Elapsed time: ${elapsed}s from time: ${earliestTime}`);
      return elapsed;
    } catch (error) {
      console.error('Error calculating elapsed time:', error);
      // Fallback to current session time if localStorage fails
      return parseFloat(((Date.now() - startTime) / 1000).toFixed(3));
    }
  };
  
  return {
    startTime,
    getElapsedTime,
  };
};