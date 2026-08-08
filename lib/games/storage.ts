/**
 * Removes every localStorage key starting with `prefix`.
 *
 * The keys are collected before anything is deleted: removing during an
 * index-based walk shifts the remaining entries down, which silently skips
 * roughly half of them.
 */
export const removeStorageKeysWithPrefix = (prefix: string): void => {
  const matching: string[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(prefix)) matching.push(key);
  }

  matching.forEach((key) => localStorage.removeItem(key));
};
