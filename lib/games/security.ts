import { SECURITY } from "../constants";
import { GameConfig } from "./config";
import { removeStorageKeysWithPrefix, timingKeyPrefixes } from "./storage";

const ATTEMPTS_KEY = "solution_attempts";

/**
 * Rate limiting for solution attempts
 * @returns false when the attempt should be rejected
 */
export const checkRateLimit = (): boolean => {
  try {
    const now = Date.now();
    const attempts = JSON.parse(
      localStorage.getItem(ATTEMPTS_KEY) || "[]"
    ) as number[];

    const recentAttempts = attempts.filter(
      (time) => now - time < SECURITY.RATE_LIMIT_WINDOW
    );

    if (recentAttempts.length >= SECURITY.RATE_LIMIT_ATTEMPTS) {
      return false;
    }

    recentAttempts.push(now);
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(recentAttempts));
    return true;
  } catch {
    // If localStorage fails, allow the attempt
    return true;
  }
};

/**
 * Validate input length and characters
 */
export const validateInput = (input: string): boolean => {
  if (input.length > SECURITY.MAX_INPUT_LENGTH) return false;
  return /^[0-9+\-*/() ]*$/.test(input);
};

/**
 * Frees space when storage is nearly full by dropping the attempt log and the
 * per-day load timestamps, neither of which matters once the day is over.
 */
export const manageStorageQuota = async (config: GameConfig) => {
  try {
    if (!("storage" in navigator) || !("estimate" in navigator.storage)) return;

    const { usage, quota } = await navigator.storage.estimate();
    if (!usage || !quota || usage / quota <= 0.9) return;

    localStorage.removeItem(ATTEMPTS_KEY);
    removeStorageKeysWithPrefix(...timingKeyPrefixes(config.storageKeys));
  } catch (error) {
    console.error("Error managing storage quota:", error);
  }
};
