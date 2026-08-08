/**
 * Removes every localStorage key starting with `prefix`.
 *
 * The keys are collected before anything is deleted: removing during an
 * index-based walk shifts the remaining entries down, which silently skips
 * roughly half of them.
 */
export const removeStorageKeysWithPrefix = (...prefixes: string[]): void => {
  const matching: string[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && prefixes.some((prefix) => key.startsWith(prefix))) {
      matching.push(key);
    }
  }

  matching.forEach((key) => localStorage.removeItem(key));
};

/**
 * The dated per-day timing keys for a game, including the legacy
 * FIRST_LOAD_TIME entries written before the start gate existed.
 */
export const timingKeyPrefixes = (keys: {
  PUZZLE_START_TIME: string;
  FIRST_LOAD_TIME: string;
}): string[] => [keys.PUZZLE_START_TIME, keys.FIRST_LOAD_TIME];
