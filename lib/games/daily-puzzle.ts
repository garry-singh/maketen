/**
 * Deterministic per-day puzzle helpers.
 *
 * Everything here is a pure function of the date string, so a given day always
 * yields the same puzzle with the numbers in the same order - refreshing the
 * page can never reshuffle it.
 */

/** Turns "2026-08-08" into the numeric seed 20260808. */
export const seedFromDate = (date: string): number =>
  Number(date.replace(/-/g, ""));

/** mulberry32 - a small, well-distributed seeded PRNG. */
const createRandom = (seed: number): (() => number) => {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/** Picks the entry for the given day, cycling through the list. */
export const pickForDate = <T>(items: readonly T[], date: string): T =>
  items[seedFromDate(date) % items.length];

/**
 * Uniform Fisher-Yates shuffle, stable for a given date.
 *
 * Replaces `sort(() => Math.random() - 0.5)`, which was both non-uniform and
 * different on every page load.
 */
export const shuffleForDate = <T>(items: readonly T[], date: string): T[] => {
  const random = createRandom(seedFromDate(date));
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};
