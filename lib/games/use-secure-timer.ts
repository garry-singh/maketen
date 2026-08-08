import { useEffect, useRef } from "react";
import { DEBUG_MODE } from "../constants";
import { getTodayDateString } from "../date-utils";
import { GameConfig } from "./config";

/**
 * Times the puzzle from the day's first page load, so reloading cannot reset
 * the clock and farm streaks.
 *
 * The authoritative start time lives in localStorage, so it is kept in a ref
 * rather than state - nothing renders it, and it must not trigger a re-render.
 *
 * @param config - Identifies which game's storage keys to use
 * @param solved - Whether the puzzle is already solved
 */
export function useSecureTimer(config: GameConfig, solved: boolean) {
  const { storageKeys } = config;
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    startTimeRef.current ??= Date.now();

    const today = getTodayDateString();
    const firstLoadKey = `${storageKeys.FIRST_LOAD_TIME}_${today}`;

    try {
      const savedPuzzleDate = localStorage.getItem(storageKeys.PUZZLE_DATE);

      if (savedPuzzleDate !== today) {
        // New day - start the clock now
        const now = Date.now();
        localStorage.setItem(firstLoadKey, now.toString());
        localStorage.setItem(storageKeys.PUZZLE_DATE, today);
        startTimeRef.current = now;
        if (DEBUG_MODE) console.log(`New day, set first load time: ${now}`);
        return;
      }

      const firstLoadTime = localStorage.getItem(firstLoadKey);

      if (firstLoadTime) {
        // Same day, already timed - keep the original start
        startTimeRef.current = parseInt(firstLoadTime, 10);
        if (DEBUG_MODE)
          console.log(`Using existing first load time: ${firstLoadTime}`);
      } else if (!solved) {
        // Same day, first unsolved visit - start the clock now
        const now = Date.now();
        localStorage.setItem(firstLoadKey, now.toString());
        startTimeRef.current = now;
        if (DEBUG_MODE) console.log(`Set first load time: ${now}`);
      }
    } catch (error) {
      console.error("Error in useSecureTimer:", error);
      startTimeRef.current = Date.now();
    }
  }, [solved, storageKeys]);

  /**
   * @returns Seconds elapsed since the day's first page load
   */
  const getElapsedTime = (): number => {
    const sessionStart = startTimeRef.current ?? Date.now();

    try {
      const today = getTodayDateString();
      const firstLoadTime = localStorage.getItem(
        `${storageKeys.FIRST_LOAD_TIME}_${today}`
      );
      const earliestTime = firstLoadTime
        ? parseInt(firstLoadTime, 10)
        : sessionStart;

      const elapsed = parseFloat(
        ((Date.now() - earliestTime) / 1000).toFixed(3)
      );
      if (DEBUG_MODE)
        console.log(`Elapsed time: ${elapsed}s from time: ${earliestTime}`);
      return elapsed;
    } catch (error) {
      console.error("Error calculating elapsed time:", error);
      return parseFloat(((Date.now() - sessionStart) / 1000).toFixed(3));
    }
  };

  return { getElapsedTime };
}
