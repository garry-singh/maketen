import { useState } from "react";
import { DEBUG_MODE } from "../constants";
import { getTodayDateString } from "../date-utils";
import { useClientValue } from "../use-client-value";
import { GameConfig, GameStorageKeys } from "./config";

/**
 * Deliberately not FIRST_LOAD_TIME. That key used to be written on page load,
 * so values under it mean "when the tab opened", not "when the player started".
 * Reusing it would let stale entries skip the start gate and count idle time.
 */
const startKey = (keys: GameStorageKeys) =>
  `${keys.PUZZLE_START_TIME}_${getTodayDateString()}`;

const readStoredStart = (keys: GameStorageKeys): number | null => {
  try {
    const stored = localStorage.getItem(startKey(keys));
    return stored ? parseInt(stored, 10) : null;
  } catch (error) {
    console.error("Error reading puzzle start time:", error);
    return null;
  }
};

/**
 * Times how long the player took on today's puzzle.
 *
 * The clock is started explicitly, by the player pressing Start - the puzzle
 * stays hidden until then, so the timer covers the thinking and not just the
 * typing. Once started it is pinned in localStorage for the rest of the day, so
 * reloading cannot rewind it.
 *
 * Note this is only as trustworthy as the browser it runs in: a determined
 * player can edit localStorage. It exists to make the honest path the easy one,
 * not to be tamper-proof.
 *
 * @param config - Identifies which game's storage keys to use
 * @param solved - Whether the puzzle is already solved
 */
export function useSecureTimer(config: GameConfig, solved: boolean) {
  const { storageKeys } = config;

  // A clock started earlier today (the player reloaded mid-puzzle)
  const storedStart = useClientValue<number | null>(
    () => readStoredStart(storageKeys),
    null
  );
  const [freshStart, setFreshStart] = useState<number | null>(null);

  const startedAt = freshStart ?? storedStart;

  /**
   * Starts the day's clock. Every later call is a no-op, so elapsed time can
   * only ever grow.
   */
  const startTimer = () => {
    if (solved || startedAt !== null) return;

    // Another tab may have started the clock already - that one wins
    const existing = readStoredStart(storageKeys);
    if (existing !== null) {
      setFreshStart(existing);
      return;
    }

    const now = Date.now();
    try {
      localStorage.setItem(startKey(storageKeys), String(now));
    } catch (error) {
      console.error("Error recording puzzle start time:", error);
    }
    setFreshStart(now);
    if (DEBUG_MODE) console.log(`Clock started: ${now}`);
  };

  /**
   * @returns Seconds since the player pressed Start, or 0 if they never did
   */
  const getElapsedTime = (): number => {
    // Storage wins: it survives reloads, component state does not
    const authoritative = readStoredStart(storageKeys) ?? startedAt;
    if (authoritative === null) return 0;

    const elapsed = parseFloat(
      ((Date.now() - authoritative) / 1000).toFixed(3)
    );
    if (DEBUG_MODE) console.log(`Elapsed: ${elapsed}s from ${authoritative}`);
    return elapsed;
  };

  return { hasStarted: startedAt !== null, startTimer, getElapsedTime };
}
