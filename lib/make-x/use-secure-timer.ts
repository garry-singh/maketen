import { useEffect, useRef } from "react";
import { MAKE_X_STORAGE_KEYS, DEBUG_MODE } from "../constants";
import { getTodayDateString } from "../date-utils";

/**
 * Custom hook to manage puzzle timer with anti-farming protection for MakeX
 *
 * The authoritative start time lives in localStorage, so it is kept in a ref
 * rather than state - nothing renders it, and it must not trigger a re-render.
 *
 * @param solved - Whether puzzle is already solved
 * @returns Timer state and functions
 */
export const useSecureTimer = (solved: boolean) => {
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    startTimeRef.current ??= Date.now();

    const today = getTodayDateString();
    const firstLoadKey = `${MAKE_X_STORAGE_KEYS.FIRST_LOAD_TIME}_${today}`;
    const savedPuzzleDate = localStorage.getItem(MAKE_X_STORAGE_KEYS.PUZZLE_DATE);

    try {
      // Check if it's a new day
      if (savedPuzzleDate !== today) {
        // New day - set current time as first load time
        const now = Date.now();
        localStorage.setItem(firstLoadKey, now.toString());
        localStorage.setItem(MAKE_X_STORAGE_KEYS.PUZZLE_DATE, today);
        startTimeRef.current = now;
        if (DEBUG_MODE) console.log(`New day, set first load time: ${now}`);
      } else {
        // Same day - check if we already have a first load time
        const firstLoadTime = localStorage.getItem(firstLoadKey);

        if (!firstLoadTime && !solved) {
          // First time loading the page today and not solved
          const now = Date.now();
          localStorage.setItem(firstLoadKey, now.toString());
          startTimeRef.current = now;
          if (DEBUG_MODE) console.log(`Set first load time: ${now}`);
        } else if (firstLoadTime) {
          // Use existing first load time
          startTimeRef.current = parseInt(firstLoadTime, 10);
          if (DEBUG_MODE) console.log(`Using existing first load time: ${firstLoadTime}`);
        }
      }
    } catch (error) {
      console.error('Error in useSecureTimer:', error);
      // Fallback to current time if localStorage fails
      startTimeRef.current = Date.now();
    }
  }, [solved]);

  /**
   * Calculate elapsed time in seconds
   * Always uses the first load time for the day
   * @returns Time elapsed since first page load in seconds
   */
  const getElapsedTime = (): number => {
    const sessionStart = startTimeRef.current ?? Date.now();

    try {
      const today = getTodayDateString();
      const firstLoadTime = localStorage.getItem(`${MAKE_X_STORAGE_KEYS.FIRST_LOAD_TIME}_${today}`);

      let earliestTime = sessionStart;

      // Use the first load time if it exists
      if (firstLoadTime) {
        earliestTime = parseInt(firstLoadTime, 10);
      }

      const elapsed = parseFloat(((Date.now() - earliestTime) / 1000).toFixed(3));
      if (DEBUG_MODE) console.log(`Elapsed time: ${elapsed}s from time: ${earliestTime}`);
      return elapsed;
    } catch (error) {
      console.error('Error calculating elapsed time:', error);
      // Fallback to current session time if localStorage fails
      return parseFloat(((Date.now() - sessionStart) / 1000).toFixed(3));
    }
  };

  return {
    getElapsedTime,
  };
};
