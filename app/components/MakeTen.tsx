"use client";

import React, { useState, useEffect } from "react";
import "./MakeTen.css"; // Import the new CSS file

const numbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const operators = ["+", "-", "*", "/", "⌫"];

interface Puzzle {
  date: string;
  numbers: number[];
  solution: string;
}

// Function to generate a daily puzzle based on the date (client-side only)
const generateDailyPuzzle = (): Puzzle => {
  function evaluateExpression(
    numbers: number[],
    operators: string[]
  ): string | null {
    let expr = numbers[0].toString();
    for (let i = 0; i < operators.length; i++) {
      expr += ` ${operators[i]} ${numbers[i + 1]}`;
    }
    try {
      return eval(expr) === 10 && !expr.includes("Infinity") ? expr : null;
    } catch {
      return null;
    }
  }

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

  function operatorCombinations(length: number): string[][] {
    if (length === 0) return [[]];
    const result: string[][] = [];
    const smallerCombos = operatorCombinations(length - 1);
    for (const op of operators) {
      for (const combo of smallerCombos) {
        result.push([op, ...combo]);
      }
    }
    return result;
  }

  function getSeededRandom(seed: number): number {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const seed = parseInt(today.split("-").join("")); // Unique number from date

  while (true) {
    const numCount = Math.floor(getSeededRandom(seed) * 3) + 4; // 4 to 6 numbers
    const numbers = Array.from(
      { length: numCount },
      () => Math.floor(getSeededRandom(seed * 2) * 10) + 1
    );

    const numberPermutations = permute(numbers);
    const operatorCombinationsList = operatorCombinations(numbers.length - 1);

    for (const numSet of numberPermutations) {
      for (const opSet of operatorCombinationsList) {
        const validExpression = evaluateExpression(numSet, opSet);
        if (validExpression) {
          return { date: today, numbers: numSet, solution: validExpression };
        }
      }
    }
  }
};

const MakeTen: React.FC = () => {
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [userInput, setUserInput] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [streak, setStreak] = useState<number>(0);
  const [longestStreak, setLongestStreak] = useState<number>(0);

  useEffect(() => {
    setPuzzle(generateDailyPuzzle());
    setStartTime(Date.now());
  }, []);

  const checkSolution = () => {
    try {
      const timeElapsed = Math.floor((Date.now() - startTime) / 1000);
      if (eval(userInput) === 10) {
        setMessage(`✅ Correct! Solved in ${timeElapsed} seconds!`);
        if (timeElapsed < 60) {
          setStreak((prev) => prev + 1);
          setLongestStreak((prev) => Math.max(prev + 1, longestStreak));
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

  const handleKeyboardClick = (key: string) => {
    if (key === "ENTER") {
      checkSolution();
    } else if (key === "⌫") {
      setUserInput((prev) => prev.slice(0, -1));
    } else {
      setUserInput((prev) => prev + key);
    }
  };

  if (!puzzle) {
    return <p className="loading">Loading today&apos;s puzzle...</p>;
  }

  return (
    <div className="container">
      <h2 className="title">🎯 Make 10</h2>
      <p className="instructions">
        Use only basic operations and all these numbers exactly once to make 10:
      </p>
      <h3 className="numbers">{puzzle.numbers.join("  ")}</h3>
      <input type="text" value={userInput} readOnly className="input-box" />
      <br />
      <br />

      <div className="keyboard">
        <div className="keyboard-row numbers-row">
          {numbers.map((num) => (
            <button
              key={num}
              className="key"
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
              className="key"
              onClick={() => handleKeyboardClick(op)}
            >
              {op}
            </button>
          ))}
        </div>
        <div className="keyboard-row submit-row">
          <button
            className="key special"
            onClick={() => handleKeyboardClick("ENTER")}
          >
            ENTER
          </button>
        </div>
      </div>
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
