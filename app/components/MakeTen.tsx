"use client";

import React, { useState, useEffect } from "react";
import { FaXTwitter } from "react-icons/fa6";
import { predefinedPuzzles } from "../makeTenPuzzles";
import "./MakeTen.css";

const SOCIAL_LINKS = {
  twitter: "https://x.com/MakeTenGame",
};

const numbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const operators = ["+", "-", "*", "/", "⌫", "(", ")"];
const validKeys = new Set([...numbers, ...operators, "Enter", "Backspace"]);

interface Puzzle {
  date: string;
  numbers: number[];
  solution: string;
}

const generateDailyPuzzle = (): Puzzle => {
  function permute(arr: number[]): number[][] {
    if (arr.length === 1) return [arr];
    const result: number[][] = [];
    for (let i = 0; i < arr.length; i++) {
      const rest = permute(arr.slice(0, i).concat(arr.slice(i + 1)));
      for (const r of rest) {
        result.push([arr[i]].concat(r));
      }
    }
    return result;
  }

  function getSeededRandom(seed: number): number {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  function attemptGeneratePuzzle(
    seed: number
  ): { numbers: number[]; solution: string } | null {
    const numCount = Math.floor(getSeededRandom(seed) * 3) + 4;
    const numbers = Array.from(
      { length: numCount },
      () => Math.floor(getSeededRandom(seed * 2) * 10) + 1
    );

    if (new Set(numbers).size < 2) return null; // Ensure at least 2 unique numbers

    const numberPermutations = permute(numbers);
    const operators = ["+", "-", "*", "/"];

    for (const numSet of numberPermutations) {
      for (const opSet of operators.map((op) => [op, op, op])) {
        const expr = `(${numSet[0]} ${opSet[0]} ${numSet[1]}) ${opSet[1]} ${numSet[2]} ${opSet[2]} ${numSet[3]}`;
        try {
          if (eval(expr) === 10) {
            return { numbers: numSet, solution: expr };
          }
        } catch {
          continue;
        }
      }
    }
    return null;
  }

  const today = new Date().toISOString().split("T")[0]; // Get today's date
  const seed = parseInt(today.replace(/-/g, ""));
  let puzzle = attemptGeneratePuzzle(seed);

  if (!puzzle) {
    const fallbackPuzzle = predefinedPuzzles[seed % predefinedPuzzles.length];
    puzzle = {
      numbers: [...fallbackPuzzle.numbers].sort(() => Math.random() - 0.5), // Shuffle numbers
      solution: fallbackPuzzle.solution,
    };
  }

  return { date: today, ...puzzle }; // Include the date property
};

const MakeTen: React.FC = () => {
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [userInput, setUserInput] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [streaks, setStreaks] = useState({ streak: 0, longestStreak: 0 });
  const [solved, setSolved] = useState<boolean>(false);
  const [solveTime, setSolveTime] = useState<number | null>(null);
  const [localResetTime, setLocalResetTime] = useState<string>("");
  const [usedNumbers, setUsedNumbers] = useState<number[]>([]);

  useEffect(() => {
    const generatedPuzzle = generateDailyPuzzle();
    setPuzzle(generatedPuzzle);
    setUsedNumbers(new Array(generatedPuzzle.numbers.length).fill(0)); // Initialize usage tracker

    const today = new Date().toISOString().split("T")[0]; // Get today's date
    const savedStartTime = localStorage.getItem("puzzleStartTime");
    const savedPuzzleDate = localStorage.getItem("puzzleDate");

    if (savedStartTime && savedPuzzleDate === today) {
      setStartTime(parseInt(savedStartTime, 10)); // ✅ Restore start time if puzzle hasn't changed
    } else {
      const newStartTime = Date.now();
      setStartTime(newStartTime);
      localStorage.setItem("puzzleStartTime", newStartTime.toString()); // ✅ Save start time
      localStorage.setItem("puzzleDate", today); // ✅ Save today's date
    }
  }, []);

  useEffect(() => {
    // ✅ Get user's time zone
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // ✅ Define puzzle reset time in UTC (Midnight UTC)
    const nextPuzzleTimeUTC = new Date();
    nextPuzzleTimeUTC.setUTCHours(0, 0, 0, 0);
    nextPuzzleTimeUTC.setUTCDate(nextPuzzleTimeUTC.getUTCDate() + 1); // Move to next day's midnight

    // ✅ Convert UTC time to user's local time
    const localTime = nextPuzzleTimeUTC.toLocaleTimeString("en-US", {
      timeZone: userTimeZone,
      hour: "numeric",
      minute: "numeric",
      hour12: true, // Show AM/PM
    });

    // ✅ Calculate hours & minutes remaining
    const now = new Date();
    const diff = nextPuzzleTimeUTC.getTime() - now.getTime();
    const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
    const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    setLocalResetTime(
      `${localTime} local time (${hoursLeft}h ${minutesLeft}m left)`
    );
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedStreak =
        parseInt(localStorage.getItem("streak") || "0", 10) || 0;
      const savedLongestStreak =
        parseInt(localStorage.getItem("longestStreak") || "0", 10) || 0;
      const savedSolved = localStorage.getItem("solvedToday") === "true";

      setStreaks({ streak: savedStreak, longestStreak: savedLongestStreak });
      setSolved(savedSolved);

      // Check if the streak needs to reset for a new day
      const today = new Date().toISOString().split("T")[0];
      const lastSolvedDate = localStorage.getItem("solvedDate");

      if (lastSolvedDate !== today) {
        localStorage.setItem("solvedToday", "false"); // Reset solved status
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("streak", streaks.streak.toString());
      localStorage.setItem("longestStreak", streaks.longestStreak.toString());
    }
  }, [streaks]);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0]; // Get today's date
    const savedSolved = localStorage.getItem("solvedToday");
    const savedSolvedDate = localStorage.getItem("solvedDate");

    if (savedSolved === "true" && savedSolvedDate === today) {
      setSolved(true); // ✅ Mark as solved if it was solved today
    } else {
      localStorage.setItem("solvedToday", "false"); // ✅ Reset solved status if it's a new day
      localStorage.setItem("solvedDate", today);
      setSolved(false);
    }
  }, []);

  const handleKeyboardClick = (key: string) => {
    if (key === "ENTER") {
      checkSolution();
      return;
    } else if (key === "⌫" || key === "Backspace") {
      removeLastUsedNumber();
      setUserInput((prev) => prev.slice(0, -1));
      return;
    } else if (validKeys.has(key)) {
      setUserInput((prev) => prev + key);
      markNumberUsed(parseInt(key)); // Track number usage
    }
  };

  const markNumberUsed = (num: number) => {
    if (!puzzle) return;

    const numIndex = puzzle.numbers.findIndex(
      (n, index) => n === num && usedNumbers[index] === 0
    );

    if (numIndex !== -1) {
      const updatedUsage = [...usedNumbers];
      updatedUsage[numIndex] = 1; // Mark as used
      setUsedNumbers(updatedUsage);
    }
  };

  const removeLastUsedNumber = () => {
    if (!puzzle) return;

    const lastNum = parseInt(userInput[userInput.length - 1]);
    if (!isNaN(lastNum)) {
      const lastUsedIndex = usedNumbers.lastIndexOf(1);

      if (lastUsedIndex !== -1) {
        const updatedUsage = [...usedNumbers];
        updatedUsage[lastUsedIndex] = 0; // Mark as unused
        setUsedNumbers(updatedUsage);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const filteredValue = e.target.value
      .split("")
      .filter((char) => validKeys.has(char))
      .join("");
    setUserInput(filteredValue);
  };

  const checkSolution = () => {
    if (solved) return;

    try {
      const timeElapsed = parseFloat(
        ((Date.now() - startTime) / 1000).toFixed(3)
      );
      const inputNumbers = userInput.match(/\d+/g)?.map(Number) || [];
      const sortedInputNumbers = [...inputNumbers].sort((a, b) => a - b);
      const sortedPuzzleNumbers = [...puzzle!.numbers].sort((a, b) => a - b);

      if (eval(userInput) === 10) {
        if (
          JSON.stringify(sortedInputNumbers) !==
          JSON.stringify(sortedPuzzleNumbers)
        ) {
          setMessage("❌ You must use all given numbers exactly once!");
          return;
        }

        setMessage(`✅ Correct! Solved in ${timeElapsed} seconds!`);
        setSolveTime(timeElapsed);
        setSolved(true);

        const today = new Date().toISOString().split("T")[0];
        const lastSolvedDate = localStorage.getItem("solvedDate");

        let newStreak = 1; // Default to 1 if no previous streak exists
        if (lastSolvedDate) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split("T")[0];

          if (lastSolvedDate === yesterdayStr) {
            newStreak =
              (parseInt(localStorage.getItem("streak") || "0", 10) || 0) + 1;
          } else {
            newStreak = 1; // Reset streak if more than one day was missed
          }
        }

        const prevLongestStreak =
          parseInt(localStorage.getItem("longestStreak") || "0", 10) || 0;
        const newLongestStreak = Math.max(newStreak, prevLongestStreak);

        // Update React state
        setStreaks({ streak: newStreak, longestStreak: newLongestStreak });

        // Persist in localStorage
        localStorage.setItem("solvedToday", "true");
        localStorage.setItem("solvedDate", today);
        localStorage.setItem("streak", newStreak.toString());
        localStorage.setItem("longestStreak", newLongestStreak.toString());
      } else {
        setMessage("❌ Incorrect. Try again!");
      }
    } catch {
      setMessage(
        "❌ Invalid equation. Use only the given numbers and operations."
      );
    }
  };

  if (!puzzle) {
    return <p className="loading">Loading today&apos;s puzzle...</p>;
  }

  const copyToClipboard = async () => {
    if (!userInput) return;

    const maskedSolution = userInput
      .replace(/[0-9]/g, "⬛")
      .replace(/\(/g, "⬜")
      .replace(/\)/g, "⬜");

    const coloredOperators = maskedSolution
      .replace(/\+/g, "+")
      .replace(/-/g, "-")
      .replace(/\*/g, "*")
      .replace(/\//g, "/");

    const shareText = `🔢 I solved today's #MakeTen puzzle in ${solveTime} seconds!\n\n${coloredOperators}\n\n🎯 Play now: https://maketen.vercel.app/`;

    // Check if Web Share API is supported
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Make 10 Puzzle",
          text: shareText,
          url: "https://maketen.vercel.app/",
        });
        return;
      } catch (err) {
        console.error("Error sharing via Web Share API:", err);
      }
    }

    // Fallback: Copy to clipboard
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareText);
        alert("✅ Solution copied to clipboard! Share it with friends.");
      } catch (err) {
        console.error("Clipboard write failed:", err);
        alert("❌ Unable to copy to clipboard.");
      }
    } else {
      alert("❌ Sharing is not supported on your device.");
    }
  };

  return (
    <div className="container">
      <h2 className="title">🎯 Make 10 </h2>
      {!solved && (
        <p className="instructions">
          Use only basic operations and all these numbers exactly once to make
          10:
        </p>
      )}
      {!solved && (
        <h3 className="numbers">
          {puzzle.numbers.map((num, index) => (
            <span
              key={index}
              className={usedNumbers[index] ? "greyed-out" : ""}
            >
              {num}{" "}
            </span>
          ))}
        </h3>
      )}
      {solved ? (
        <p className="footer">
          Come back at {localResetTime} for a new puzzle!
        </p>
      ) : (
        <input
          type="text"
          value={userInput}
          onChange={handleInputChange}
          className={`input-box ${solved && "disabled"}`}
          disabled={solved}
          autoFocus
        />
      )}
      <br />
      <div className="keyboard">
        <div className="keyboard-row numbers-row">
          {numbers.map((num) => (
            <button
              key={num}
              className={`key ${
                solved || !puzzle.numbers.includes(parseInt(num))
                  ? "disabled"
                  : ""
              }`}
              disabled={solved || !puzzle.numbers.includes(parseInt(num))}
              onClick={() => handleKeyboardClick(num)}
            >
              {num}
            </button>
          ))}
        </div>
        <div className="keyboard-row operators-row">
          {operators.map((op) => (
            <button
              key={op}
              disabled={solved}
              className={`key ${solved && "disabled"}`}
              onClick={() => handleKeyboardClick(op)}
            >
              {op}
            </button>
          ))}
        </div>
        {!solved && (
          <div className="keyboard-row submit-row">
            <button
              className={`key special ${solved && "disabled"}`}
              onClick={checkSolution}
              disabled={solved}
            >
              ENTER
            </button>
          </div>
        )}
      </div>
      <br />
      <br />
      <br />
      {message && <h3 className="message">{message}</h3>}
      <h4 className="streak">
        🔥 Current Streak (under 45 sec): {streaks.streak}
      </h4>
      <h4 className="streak">
        🏆 Longest Streak (under 45 sec): {streaks.longestStreak}
      </h4>
      {solved && (
        <div className="social-buttons">
          <a
            href={SOCIAL_LINKS.twitter}
            target="_blank"
            rel="noopener noreferrer"
          >
            <button className="social-button twitter">
              <FaXTwitter className="icon" />
              Twitter/X
            </button>
          </a>
          <button onClick={copyToClipboard} className="social-button instagram">
            📤 Share
          </button>
        </div>
      )}
    </div>
  );
};

export default MakeTen;
