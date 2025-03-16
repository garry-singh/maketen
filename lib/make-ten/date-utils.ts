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