import { SECURITY, STORAGE_KEYS } from "../constants";

/**
 * Simple encryption for localStorage values
 * Note: This is not cryptographically secure, just obfuscation
 */
export const encryptStorageValue = (value: string): string => {
  return btoa(value);
};

export const decryptStorageValue = (encrypted: string): string => {
  try {
    return atob(encrypted);
  } catch {
    return "";
  }
};

/**
 * Rate limiting for solution attempts
 */
export const checkRateLimit = (): boolean => {
  try {
    const now = Date.now();
    const attempts = JSON.parse(
      localStorage.getItem("solution_attempts") || "[]"
    ) as number[];

    // Filter attempts within the time window
    const recentAttempts = attempts.filter(
      (time) => now - time < SECURITY.RATE_LIMIT_WINDOW
    );

    // Check if we're over the limit
    if (recentAttempts.length >= SECURITY.RATE_LIMIT_ATTEMPTS) {
      return false;
    }

    // Add new attempt and save
    recentAttempts.push(now);
    localStorage.setItem("solution_attempts", JSON.stringify(recentAttempts));
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
  // Only allow numbers, basic operators, and parentheses
  return /^[0-9+\-*/() ]*$/.test(input);
};

/**
 * Secure storage operations
 */
export const secureStorage = {
  set: (key: string, value: string) => {
    try {
      const encrypted = encryptStorageValue(value);
      localStorage.setItem(key, encrypted);
    } catch (error) {
      console.error("Error setting secure storage:", error);
    }
  },

  get: (key: string): string | null => {
    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) return null;
      return decryptStorageValue(encrypted);
    } catch (error) {
      console.error("Error getting secure storage:", error);
      return null;
    }
  },

  remove: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error("Error removing secure storage:", error);
    }
  },
};

/**
 * Check storage quota and clean up if needed
 */
export const manageStorageQuota = async () => {
  try {
    if ("storage" in navigator && "estimate" in navigator.storage) {
      const { usage, quota } = await navigator.storage.estimate();
      if (usage && quota) {
        const usageRatio = usage / quota;
        if (usageRatio > 0.9) {
          // Clean up old attempts
          localStorage.removeItem("solution_attempts");
          // Clean up old first load times
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith(STORAGE_KEYS.FIRST_LOAD_TIME)) {
              localStorage.removeItem(key);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Error managing storage quota:", error);
  }
}; 