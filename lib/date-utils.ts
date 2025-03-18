export function getUTCDate(): Date {
  const today = new Date();
  return new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  );
}

export function getDateSeed(): number {
  return getUTCDate().getTime();
}

export function getIndexFromSeed(seed: number, length: number): number {
  return seed % length;
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getUTCFullYear() === date2.getUTCFullYear() &&
    date1.getUTCMonth() === date2.getUTCMonth() &&
    date1.getUTCDate() === date2.getUTCDate()
  );
}

export function getTimeSinceMidnight(date: Date): number {
  return (
    date.getUTCHours() * 3600000 +
    date.getUTCMinutes() * 60000 +
    date.getUTCSeconds() * 1000 +
    date.getUTCMilliseconds()
  );
}

/**
 * Gets today's date in ISO format (YYYY-MM-DD)
 * @returns Today's date string
 */
export const getTodayDateString = (): string => {
    return new Date().toISOString().split("T")[0];
  };
  
  /**
   * Gets yesterday's date in ISO format (YYYY-MM-DD)
   * @returns Yesterday's date string
   */
  export const getYesterdayDateString = (): string => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split("T")[0];
  };
  
  /**
   * Gets the local time for the next puzzle reset
   * @returns Object containing formatted time string and hours/minutes remaining
   */
  export const getNextPuzzleTime = () => {
    // Get user's time zone
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
    // Define puzzle reset time in UTC (Midnight UTC)
    const nextPuzzleTimeUTC = new Date();
    nextPuzzleTimeUTC.setUTCHours(0, 0, 0, 0);
    nextPuzzleTimeUTC.setUTCDate(nextPuzzleTimeUTC.getUTCDate() + 1); // Move to next day's midnight
  
    // Convert UTC time to user's local time
    const localTime = nextPuzzleTimeUTC.toLocaleTimeString("en-US", {
      timeZone: userTimeZone,
      hour: "numeric",
      minute: "numeric",
      hour12: true, // Show AM/PM
    });
  
    // Calculate hours & minutes remaining
    const now = new Date();
    const diff = nextPuzzleTimeUTC.getTime() - now.getTime();
    const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
    const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
    return {
      localTime,
      hoursLeft,
      minutesLeft,
      formattedString: `${localTime} local time (${hoursLeft}h ${minutesLeft}m left)`
    };
  };