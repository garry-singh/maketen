/**
 * Deterministic per-day puzzle helpers.
 *
 * Everything here is a pure function of the date string, so a given day always
 * yields the same puzzle with the numbers in the same order - refreshing the
 * page can never reshuffle it.
 */

/** The day the first puzzle went live; puzzle numbering counts from here. */
const LAUNCH_DATE = "2025-02-16";

const MS_PER_DAY = 86_400_000;

/**
 * Days since the Unix epoch - a counter that increases by exactly one per day.
 *
 * Seeding from the "YYYYMMDD" digits instead looks equivalent but is not:
 * 10000 % 1000 === 0, so the year cancels out and every date maps to the same
 * puzzle every year, while most of the catalogue is never reachable at all.
 */
export const dayNumber = (date: string): number =>
  Math.floor(Date.parse(`${date}T00:00:00Z`) / MS_PER_DAY);

/** 1-based puzzle number for a date, for display and sharing. */
export const puzzleNumber = (date: string): number =>
  dayNumber(date) - dayNumber(LAUNCH_DATE) + 1;

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

/** Picks the entry for the given day, cycling through the whole list. */
export const pickForDate = <T>(items: readonly T[], date: string): T =>
  items[dayNumber(date) % items.length];

/**
 * Uniform Fisher-Yates shuffle, stable for a given date.
 *
 * Replaces `sort(() => Math.random() - 0.5)`, which was both non-uniform and
 * different on every page load.
 */
const shuffleWithSeed = <T>(items: readonly T[], seed: number): T[] => {
  const random = createRandom(seed);
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

export const shuffleForDate = <T>(items: readonly T[], date: string): T[] =>
  shuffleWithSeed(items, dayNumber(date));
