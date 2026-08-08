"use client";

import React, { useCallback, useEffect, useState } from "react";
import { DEBUG_MODE } from "@/lib/constants";
import { getTodayDateString, getYesterdayDateString } from "@/lib/date-utils";
import { GameConfig } from "@/lib/games/config";
import { removeStorageKeysWithPrefix } from "@/lib/games/storage";
import { useClientValue } from "@/lib/use-client-value";

interface DebuggerProps {
  game: GameConfig;
  className?: string;
}

const EMPTY_STORAGE: Record<string, string> = {};

const readStorageData = (game: GameConfig): Record<string, string> => {
  const data: Record<string, string> = {};

  try {
    Object.values(game.storageKeys).forEach((key) => {
      data[key] = localStorage.getItem(key) || "null";
    });

    const today = getTodayDateString();
    const firstLoadKey = `${game.storageKeys.FIRST_LOAD_TIME}_${today}`;
    data[firstLoadKey] = localStorage.getItem(firstLoadKey) || "null";

    data["TODAY"] = today;
    data["YESTERDAY"] = getYesterdayDateString();

    if (DEBUG_MODE) console.log("Debugger refreshed:", data);
  } catch (error) {
    console.error("Error refreshing debugger:", error);
  }

  return data;
};

/**
 * Development-only view of a game's localStorage, with buttons for forcing the
 * states that are otherwise awkward to reach (missed days, long streaks).
 */
const LocalStorageDebugger: React.FC<DebuggerProps> = ({ game, className }) => {
  const initialData = useClientValue(() => readStorageData(game), EMPTY_STORAGE);
  const [refreshedData, setRefreshedData] = useState<Record<
    string,
    string
  > | null>(null);
  const storageData = refreshedData ?? initialData;

  const refreshData = useCallback(() => {
    if (typeof window === "undefined") return;
    setRefreshedData(readStorageData(game));
  }, [game]);

  useEffect(() => {
    const handleStorageChange = () => {
      if (DEBUG_MODE) console.log("Storage changed, refreshing debugger");
      refreshData();
    };

    window.addEventListener("storage", handleStorageChange);
    const interval = setInterval(refreshData, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [refreshData]);

  const resetAll = () => {
    try {
      Object.values(game.storageKeys).forEach((key) =>
        localStorage.removeItem(key)
      );
      removeStorageKeysWithPrefix(game.storageKeys.FIRST_LOAD_TIME);
      refreshData();
      if (DEBUG_MODE) console.log("All localStorage values reset");
    } catch (error) {
      console.error("Error resetting localStorage:", error);
    }
  };

  const setYesterdaySolved = () => {
    try {
      localStorage.setItem(
        game.storageKeys.SOLVED_DATE,
        getYesterdayDateString()
      );
      localStorage.setItem(game.storageKeys.SOLVED_TODAY, "false");
      localStorage.setItem(game.storageKeys.STREAK, "3"); // Example streak
      refreshData();
      if (DEBUG_MODE) console.log("Set yesterday as solved");
    } catch (error) {
      console.error("Error setting yesterday solved:", error);
    }
  };

  const setCustomStreak = () => {
    try {
      const streak = prompt("Enter streak value:", "5");
      if (streak === null) return;

      localStorage.setItem(game.storageKeys.STREAK, streak);

      const currentLongest = parseInt(
        localStorage.getItem(game.storageKeys.LONGEST_STREAK) || "0",
        10
      );
      if (parseInt(streak, 10) > currentLongest) {
        localStorage.setItem(game.storageKeys.LONGEST_STREAK, streak);
      }

      refreshData();
      if (DEBUG_MODE) console.log(`Set custom streak: ${streak}`);
    } catch (error) {
      console.error("Error setting custom streak:", error);
    }
  };

  return (
    <div
      className={`fixed bottom-4 right-4 p-4 bg-background border border-border rounded-lg shadow-lg max-w-md z-50 text-xs ${
        className ?? ""
      }`}
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
