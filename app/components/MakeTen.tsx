"use client";

import React, { useState, useEffect } from "react";
import { predefinedPuzzles } from "../puzzles";
import "./MakeTen.css";

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
  const [streak, setStreak] = useState<number>(0);
  const [longestStreak, setLongestStreak] = useState<number>(0);
  const [solved, setSolved] = useState<boolean>(false);

  console.log("Today's date:", new Date().toISOString().split("T")[0]);
  console.log("Generated puzzle:", puzzle);

  useEffect(() => {
    setPuzzle(generateDailyPuzzle());
    setStartTime(Date.now());
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedStreak = parseInt(localStorage.getItem("streak") || "0");
      const savedLongestStreak = parseInt(
        localStorage.getItem("longestStreak") || "0"
      );
      const savedSolved = localStorage.getItem("solvedToday") === "true";
      setStreak(savedStreak);
      setLongestStreak(savedLongestStreak);
      setSolved(savedSolved);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("streak", streak.toString());
      localStorage.setItem("longestStreak", longestStreak.toString());
    }
  }, [streak, longestStreak]);

  useEffect(() => {
    if (typeof window !== "undefined" && solved) {
      localStorage.setItem("solvedToday", "true");
    }
  }, [solved]);

  const handleKeyboardClick = (key: string) => {
    if (key === "ENTER") {
      checkSolution();
    } else if (key === "⌫" || key === "Backspace") {
      setUserInput((prev) => prev.slice(0, -1));
    } else if (validKeys.has(key)) {
      setUserInput((prev) => prev + key);
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
      if (eval(userInput) === 10) {
        setMessage(`✅ Correct! Solved in ${timeElapsed} seconds!`);
        setSolved(true);
        if (timeElapsed < 60) {
          setStreak((prev) => {
            const newStreak = prev + 1;
            setLongestStreak((prevLongest) => Math.max(newStreak, prevLongest));
            return newStreak;
          });
        }
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

  // const shareResult = () => {
  //   const shareText = `🎯 I solved today's Make 10 in ${Math.floor(
  //     (Date.now() - startTime) / 1000
  //   )} seconds! Can you? \n\nUse: ${puzzle?.numbers.join(
  //     " "
  //   )} \n#Make10Challenge \nPlay here: [maketen.vercel.app]`;
  //   navigator.clipboard.writeText(shareText);
  //   setMessage("📋 Result copied! Share it with friends!");
  // };

  return (
    <div className="container">
      <h2 className="title">🎯 Make 10 </h2>
      <p className="instructions">
        Use only basic operations and all these numbers exactly once to make 10:
      </p>
      <h3 className="numbers">{puzzle.numbers.join("  ")}</h3>
      <input
        type="text"
        value={userInput}
        onChange={handleInputChange}
        className={`input-box ${solved && "disabled"}`}
        disabled={solved}
        autoFocus
      />
      <br />
      <div className="keyboard">
        <div className="keyboard-row numbers-row">
          {numbers.map((num) => (
            <button
              key={num}
              className={`key ${solved && "disabled"}`}
              disabled={solved}
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
        <div className="keyboard-row submit-row">
          <button
            className={`key special ${solved && "disabled"}`}
            onClick={checkSolution}
            disabled={solved}
          >
            ENTER
          </button>
        </div>
      </div>
      <br />
      <br />
      <br />
      {message && <h3 className="message">{message}</h3>}
      <h4 className="streak">🔥 Current Streak (under 1 min): {streak}</h4>
      <h4 className="streak">
        🏆 Longest Streak (under 1 min): {longestStreak}
      </h4>
      <p className="footer">Come back tomorrow for a new puzzle!</p>
    </div>
  );
};

export default MakeTen;
