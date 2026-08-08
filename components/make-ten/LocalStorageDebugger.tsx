"use client";

import React, { useState, useEffect, useCallback } from "react";
import { STORAGE_KEYS, DEBUG_MODE } from "@/lib/constants";
import { getTodayDateString, getYesterdayDateString } from "@/lib/date-utils";
import { useClientValue } from "@/lib/use-client-value";

interface DebuggerProps {
  className?: string;
}

const EMPTY_STORAGE: Record<string, string> = {};

const readStorageData = (): Record<string, string> => {
  const data: Record<string, string> = {};

  try {
    // Get all relevant localStorage values
    Object.values(STORAGE_KEYS).forEach((key) => {
      data[key] = localStorage.getItem(key) || "null";
    });

    // Get first load time for today
    const today = getTodayDateString();
    const firstLoadKey = `${STORAGE_KEYS.FIRST_LOAD_TIME}_${today}`;
    data[firstLoadKey] = localStorage.getItem(firstLoadKey) || "null";

    // Add date info
    data["TODAY"] = today;
    data["YESTERDAY"] = getYesterdayDateString();

    if (DEBUG_MODE) console.log("Debugger refreshed:", data);
  } catch (error) {
    console.error("Error refreshing debugger:", error);
  }

  return data;
};

/**
 * Enhanced LocalStorage debugger with auto-refresh
 */
const LocalStorageDebugger: React.FC<DebuggerProps> = ({ className }) => {
  const initialData = useClientValue(readStorageData, EMPTY_STORAGE);
  const [refreshedData, setRefreshedData] = useState<Record<
    string,
    string
  > | null>(null);
  const storageData = refreshedData ?? initialData;

  const refreshData = useCallback(() => {
    if (typeof window === "undefined") return;
    setRefreshedData(readStorageData());
  }, []);

  // Periodic refresh
  useEffect(() => {
    // Set up storage event listener for changes
    const handleStorageChange = () => {
      if (DEBUG_MODE) console.log("Storage changed, refreshing debugger");
      refreshData();
    };

    // Listen for storage events and also poll regularly
    window.addEventListener("storage", handleStorageChange);
    const interval = setInterval(refreshData, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [refreshData]);

  // Reset all localStorage values
  const resetAll = () => {
    try {
      Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });

      // Also remove any daily first load times
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(STORAGE_KEYS.FIRST_LOAD_TIME)) {
          localStorage.removeItem(key);
        }
      }

      refreshData();
      if (DEBUG_MODE) console.log("All localStorage values reset");
    } catch (error) {
      console.error("Error resetting localStorage:", error);
    }
  };

  // Set yesterday as solved date (for testing streak continuation)
  const setYesterdaySolved = () => {
    try {
      const yesterday = getYesterdayDateString();
      localStorage.setItem(STORAGE_KEYS.SOLVED_DATE, yesterday);
      localStorage.setItem(STORAGE_KEYS.SOLVED_TODAY, "false");
      localStorage.setItem(STORAGE_KEYS.STREAK, "3"); // Example streak
      refreshData();
      if (DEBUG_MODE) console.log("Set yesterday as solved");
    } catch (error) {
      console.error("Error setting yesterday solved:", error);
    }
  };

  // Set custom streak value
  const setCustomStreak = () => {
    try {
      const streak = prompt("Enter streak value:", "5");
      if (streak === null) return;

      localStorage.setItem(STORAGE_KEYS.STREAK, streak);

      // Update longest streak if needed
      const currentLongest = parseInt(
        localStorage.getItem(STORAGE_KEYS.LONGEST_STREAK) || "0",
        10
      );
      const newStreak = parseInt(streak, 10);
      if (newStreak > currentLongest) {
        localStorage.setItem(STORAGE_KEYS.LONGEST_STREAK, streak);
      }

      refreshData();
      if (DEBUG_MODE) console.log(`Set custom streak: ${streak}`);
    } catch (error) {
      console.error("Error setting custom streak:", error);
    }
  };

  return (
    <div
      className={`fixed bottom-4 right-4 p-4 bg-background border border-border rounded-lg shadow-lg max-w-md z-50 text-xs ${className}`}
    >
      <h3 className="font-bold mb-2">LocalStorage Debugger</h3>

      <div className="space-y-1 mb-3">
        {Object.entries(storageData).map(([key, value]) => (
          <div key={key} className="flex justify-between">
            <span className="font-mono">{key}:</span>
            <span className="font-mono">{value}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
          onClick={refreshData}
        >
          Refresh
        </button>
        <button
          className="px-2 py-1 bg-red-500 text-white rounded text-xs"
          onClick={resetAll}
        >
          Reset All
        </button>
        <button
          className="px-2 py-1 bg-gray-500 text-white rounded text-xs"
          onClick={setYesterdaySolved}
        >
          Mock Yesterday
        </button>
        <button
          className="px-2 py-1 bg-gray-500 text-white rounded text-xs"
          onClick={setCustomStreak}
        >
          Set Streak
        </button>
      </div>
    </div>
  );
};

export default LocalStorageDebugger;
