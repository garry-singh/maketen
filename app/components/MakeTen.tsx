"use client";

import React, { useState, useEffect } from "react";
import { FaXTwitter } from "react-icons/fa6";
import { predefinedPuzzles } from "../makeTenPuzzles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/app/components/mode-toggle";
import { Toaster, toast } from "sonner";

const SOCIAL_LINKS = {
  twitter: "https://x.com/MakeTenGame",
};

const numbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const operators = ["+", "-", "*", "/", "⌫", "(", ")"];
const validKeys = new Set([...numbers, ...operators, "Enter", "Backspace"]);

// Add validation functions
const validateExpression = (
  expr: string
): { isValid: boolean; error?: string } => {
  // Check for division by zero
  if (expr.includes("/0")) {
    return { isValid: false, error: "Division by zero is not allowed" };
  }

  // Check for balanced parentheses
  let parenCount = 0;
  for (const char of expr) {
    if (char === "(") parenCount++;
    if (char === ")") parenCount--;
    if (parenCount < 0) {
      return { isValid: false, error: "Unmatched closing parenthesis" };
    }
  }
  if (parenCount !== 0) {
    return { isValid: false, error: "Unmatched opening parenthesis" };
  }

  // Check for valid operator sequences
  const operatorRegex = /[+\-*/]{2,}/;
  if (operatorRegex.test(expr)) {
    return { isValid: false, error: "Invalid operator sequence" };
  }

  return { isValid: true };
};

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

const KeyboardButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button> & {
    active?: boolean;
  }
>(({ className, active, ...props }, ref) => (
  <Button
    ref={ref}
    variant={active ? "default" : "outline"}
    className={cn(
      "h-12 w-12 text-base font-semibold transition-all md:h-14 md:w-14 md:text-lg",
      active && "bg-primary text-primary-foreground",
      className
    )}
    {...props}
  />
));
KeyboardButton.displayName = "KeyboardButton";

const LoadingOrErrorView: React.FC<{
  title?: string;
  message?: string;
  showRefresh?: boolean;
}> = ({ title = "🎯 Make 10", message, showRefresh = false }) => (
  <div className="w-full max-w-4xl mx-auto px-4 py-8">
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">{title}</h1>
        {message && <p className="text-lg text-destructive">{message}</p>}
        {showRefresh && (
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            size="lg"
          >
            Refresh Page
          </Button>
        )}
      </div>
    </div>
  </div>
);

const MakeTen: React.FC = () => {
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [userInput, setUserInput] = useState<string>("");
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [streaks, setStreaks] = useState({ streak: 0, longestStreak: 0 });
  const [solved, setSolved] = useState<boolean>(false);
  const [solveTime, setSolveTime] = useState<number | null>(null);
  const [localResetTime, setLocalResetTime] = useState<string>("");
  const [usedNumbers, setUsedNumbers] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const generatedPuzzle = generateDailyPuzzle();
      setPuzzle(generatedPuzzle);
      setUsedNumbers(new Array(generatedPuzzle.numbers.length).fill(0));
      setIsLoading(false);
      setError(null);

      const today = new Date().toISOString().split("T")[0];
      const savedStartTime = localStorage.getItem("puzzleStartTime");
      const savedPuzzleDate = localStorage.getItem("puzzleDate");
      const savedSolved = localStorage.getItem("solvedToday") === "true";

      // Only set start time if:
      // 1. We don't have a saved start time for today, AND
      // 2. The puzzle hasn't been solved yet
      if ((!savedStartTime || savedPuzzleDate !== today) && !savedSolved) {
        const newStartTime = Date.now();
        setStartTime(newStartTime);
        localStorage.setItem("puzzleStartTime", newStartTime.toString());
        localStorage.setItem("puzzleDate", today);
      } else if (savedStartTime) {
        setStartTime(parseInt(savedStartTime, 10));
      }
    } catch (err) {
      setError(
        "Failed to generate today's puzzle. Please try refreshing the page."
      );
      setIsLoading(false);
      console.error("Error generating puzzle:", err);
    }
  }, []);

  useEffect(() => {
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

    setLocalResetTime(
      `${localTime} local time (${hoursLeft}h ${minutesLeft}m left)`
    );
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedStreak = parseInt(localStorage.getItem("streak") || "0", 10);
      const savedLongestStreak = parseInt(
        localStorage.getItem("longestStreak") || "0",
        10
      );
      const savedSolved = localStorage.getItem("solvedToday") === "true";
      const lastSolvedDate = localStorage.getItem("solvedDate");
      const today = new Date().toISOString().split("T")[0];

      // Check if we missed a day and should reset the streak
      if (lastSolvedDate) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];

        if (lastSolvedDate !== today && lastSolvedDate !== yesterdayStr) {
          // Reset streak if we missed a day
          localStorage.setItem("streak", "0");
          setStreaks((prev) => ({ ...prev, streak: 0 }));
        }
      }

      // Initialize streaks from storage
      setStreaks({ streak: savedStreak, longestStreak: savedLongestStreak });
      setSolved(savedSolved);
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
      setSolved(true); // Mark as solved if it was solved today
    } else {
      localStorage.setItem("solvedToday", "false"); // Reset solved status if it's a new day
      localStorage.setItem("solvedDate", today);
      setSolved(false);
    }
  }, []);

  const handleKeyboardClick = (key: string) => {
    if (solved) return;

    if (key === "ENTER") {
      checkSolution();
      return;
    } else if (key === "⌫" || key === "Backspace") {
      if (userInput.length === 0) {
        toast.info("Nothing to delete!");
        return;
      }
      removeLastUsedNumber();
      setUserInput((prev) => prev.slice(0, -1));
      return;
    } else if (validKeys.has(key)) {
      if (key.match(/\d/) && !puzzle?.numbers.includes(parseInt(key))) {
        toast.error("That number isn't available!");
        return;
      }
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

    if (!userInput) {
      toast.error("Please enter a solution first!");
      return;
    }

    try {
      const savedStartTime = localStorage.getItem("puzzleStartTime");
      const timeElapsed = parseFloat(
        (
          (Date.now() -
            (savedStartTime ? parseInt(savedStartTime, 10) : startTime)) /
          1000
        ).toFixed(3)
      );

      const inputNumbers = userInput.match(/\d+/g)?.map(Number) || [];
      const sortedInputNumbers = [...inputNumbers].sort((a, b) => a - b);
      const sortedPuzzleNumbers = [...puzzle!.numbers].sort((a, b) => a - b);

      // Validate expression before evaluation
      const validation = validateExpression(userInput);
      if (!validation.isValid) {
        toast.error(validation.error);
        return;
      }

      if (eval(userInput) === 10) {
        if (
          JSON.stringify(sortedInputNumbers) !==
          JSON.stringify(sortedPuzzleNumbers)
        ) {
          toast.error("You must use all given numbers exactly once!");
          return;
        }

        setSolveTime(timeElapsed);
        setSolved(true);

        const today = new Date().toISOString().split("T")[0];
        const lastSolvedDate = localStorage.getItem("solvedDate");
        const currentStreak = parseInt(
          localStorage.getItem("streak") || "0",
          10
        );
        const currentLongestStreak = parseInt(
          localStorage.getItem("longestStreak") || "0",
          10
        );

        let newStreak = currentStreak;
        let streakMessage = "";

        // Handle streak logic
        if (timeElapsed <= 45) {
          if (!lastSolvedDate) {
            // First time ever solving
            newStreak = 1;
            streakMessage =
              "🎯 First streak started! Come back tomorrow to continue!";
          } else {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split("T")[0];

            if (lastSolvedDate === yesterdayStr) {
              // Continuing streak
              newStreak = currentStreak + 1;
              streakMessage =
                newStreak > currentLongestStreak
                  ? `🏆 New record! ${newStreak} day streak!`
                  : `🔥 ${newStreak} day streak!`;
            } else if (lastSolvedDate !== today) {
              // Missed a day - new streak
              newStreak = 1;
              streakMessage =
                "🎯 New streak started! Come back tomorrow to continue!";
            }
          }
        } else {
          // Too slow - reset streak
          newStreak = 0;
          streakMessage = "⏱️ Solve within 45 seconds to maintain your streak!";
        }

        // Update longest streak
        const newLongestStreak = Math.max(newStreak, currentLongestStreak);

        // Show solve message
        toast.success(
          `Solved in ${timeElapsed.toFixed(1)} seconds! ${streakMessage}`
        );

        // Update state and localStorage
        setStreaks({ streak: newStreak, longestStreak: newLongestStreak });
        localStorage.setItem("streak", newStreak.toString());
        localStorage.setItem("longestStreak", newLongestStreak.toString());
        localStorage.setItem("solvedToday", "true");
        localStorage.setItem("solvedDate", today);
      } else {
        toast.error("Incorrect. Try again!");
      }
    } catch {
      toast.error("Invalid equation. Please check your input.");
    }
  };

  const copyToClipboard = async () => {
    if (!userInput || !solveTime) return;

    const formattedTime = solveTime.toFixed(2);
    const streakText =
      streaks.streak > 0 ? `\n🔥 ${streaks.streak} day streak!` : "";

    const maskedSolution = userInput
      .replace(/[0-9]/g, "⬛")
      .replace(/[\(\)]/g, "⬜");

    const coloredOperators = maskedSolution
      .replace(/[+]/g, "➕")
      .replace(/[-]/g, "➖")
      .replace(/[*]/g, "✖️")
      .replace(/[/]/g, "➗");

    const shareText = `Make 10 Puzzle\n⏱️ ${formattedTime}s${streakText}\n\n${coloredOperators}\n\n Play now: https://maketen.vercel.app/`;

    // Try Web Share API first
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Make 10",
          text: shareText,
        });
        toast.success("Shared successfully!");
        return;
      } catch (err) {
        // If user cancelled sharing, don't show error
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
        // Fall back to clipboard
        console.warn("Web Share API failed:", err);
      }
    }

    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(shareText);
      toast.success("Copied to clipboard! Ready to share!");
    } catch (err) {
      console.error("Clipboard write failed:", err);

      // Final fallback - create temporary textarea
      try {
        const textarea = document.createElement("textarea");
        textarea.value = shareText;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        toast.success("Copied to clipboard! Ready to share!");
      } catch (finalErr) {
        console.error("All sharing methods failed:", finalErr);
        toast.error("Unable to share. Please try again.");
      }
    }
  };

  if (isLoading) {
    return <LoadingOrErrorView />;
  }

  if (error) {
    return <LoadingOrErrorView message={error} showRefresh />;
  }

  if (!puzzle) {
    return (
      <LoadingOrErrorView
        message="Failed to load puzzle. Please refresh the page."
        showRefresh
      />
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen w-screen bg-background">
      <Toaster
        position="bottom-right"
        closeButton
        richColors
        theme={undefined}
        className="sm:max-w-[420px]"
      />
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4">
        <ModeToggle />
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center w-full max-w-4xl px-4 mt-12 lg:mt-20">
        {/* Title */}
        <h1 className="text-5xl font-bold mb-8 lg:text-6x lg:mb-12">Make 10</h1>
        {!solved && (
          <p className="text-xl text-muted-foreground text-center lg:text-2xl">
            Use only basic operations and all these numbers exactly once to make
            10:
          </p>
        )}

        {/* Puzzle Numbers */}
        {!solved && (
          <div
            className="text-center text-4xl font-bold space-x-4 my-8 lg:text-5xl"
            role="status"
            aria-live="polite"
          >
            {puzzle.numbers.map((num: number, index: number) => (
              <span
                key={index}
                className={cn(usedNumbers[index] && "text-muted-foreground")}
                aria-label={`Number ${num}${
                  usedNumbers[index] ? " used" : " available"
                }`}
              >
                {num}
              </span>
            ))}
          </div>
        )}

        {/* Input Field */}
        {solved ? (
          <p className="text-center text-lg text-muted-foreground mb-4 lg:mb-8 lg:text-2xl">
            Come back at {localResetTime} for a new puzzle!
          </p>
        ) : (
          <Input
            type="text"
            value={userInput}
            onChange={handleInputChange}
            className="text-center text-xl w-full h-12 mb-6 md:text-2xl md:h-14 lg:mb-12"
            disabled={solved}
            autoFocus
            aria-label="Enter your solution"
            placeholder="Enter your solution"
          />
        )}
      </div>

      {/* Keyboard - Desktop Layout */}
      <div
        className="w-full max-w-4xl mx-auto hidden md:flex flex-col items-center justify-center pb-12"
        role="group"
        aria-label="Calculator keyboard desktop"
      >
        <div className="grid gap-2 w-full max-w-[600px]">
          <div className="grid grid-cols-10 gap-4">
            {numbers.map((num) => (
              <KeyboardButton
                key={num}
                disabled={solved || !puzzle.numbers.includes(parseInt(num))}
                onClick={() => handleKeyboardClick(num)}
                aria-label={`Number ${num}`}
                active={puzzle.numbers.includes(parseInt(num))}
              >
                {num}
              </KeyboardButton>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-4">
            <div className="col-start-2 col-span-5 grid grid-cols-7 gap-4">
              {operators.map((op) => (
                <KeyboardButton
                  key={op}
                  disabled={solved}
                  onClick={() => handleKeyboardClick(op)}
                  aria-label={op === "⌫" ? "Backspace" : `Operator ${op}`}
                  variant="secondary"
                >
                  {op}
                </KeyboardButton>
              ))}
            </div>
          </div>
        </div>
        {!solved && (
          <Button
            className="w-full h-14 text-xl max-w-[600px] mt-16"
            onClick={checkSolution}
            disabled={solved}
            aria-label="Submit solution"
          >
            ENTER
          </Button>
        )}
      </div>

      {/* Mobile Layout - Sticks to Bottom */}
      <div
        className="w-full max-w-sm mx-auto md:hidden p-4"
        role="group"
        aria-label="Calculator keyboard mobile"
      >
        <div className="grid grid-cols-5 gap-2 auto-rows-fr">
          {numbers.slice(0, 10).map((num) => (
            <KeyboardButton
              key={num}
              disabled={solved || !puzzle.numbers.includes(parseInt(num))}
              onClick={() => handleKeyboardClick(num)}
              aria-label={`Number ${num}`}
              active={puzzle.numbers.includes(parseInt(num))}
              className="w-full"
            >
              {num}
            </KeyboardButton>
          ))}
        </div>
        <div className="grid grid-cols-5 gap-2 mt-2 auto-rows-fr">
          {[...operators.slice(0, 5), ...operators.slice(5)].map((op) => (
            <KeyboardButton
              key={op}
              disabled={solved}
              onClick={() => handleKeyboardClick(op)}
              aria-label={op === "⌫" ? "Backspace" : `Operator ${op}`}
              variant="secondary"
              className="w-full"
            >
              {op}
            </KeyboardButton>
          ))}
        </div>
        {!solved && (
          <Button
            className="w-full h-12 mt-8 lg:mt-2"
            onClick={checkSolution}
            disabled={solved}
            aria-label="Submit solution"
          >
            ENTER
          </Button>
        )}
      </div>

      {/* Message & Streaks */}
      <div className="space-y-3 text-center mt-4">
        <p className="text-lg text-muted-foreground">
          Current Streak (under 45 sec): {streaks.streak}
        </p>
        <p className="text-lg text-muted-foreground">
          Longest Streak (under 45 sec): {streaks.longestStreak}
        </p>
      </div>

      {/* Sharing Options */}
      {solved && (
        <div className="flex justify-center gap-4 mt-6 pb-12">
          <Button variant="outline" asChild size="lg" className="gap-2">
            <a
              href={SOCIAL_LINKS.twitter}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share on X"
            >
              <FaXTwitter className="h-5 w-5" />
              Twitter/X
            </a>
          </Button>
          <Button
            onClick={copyToClipboard}
            variant="outline"
            size="lg"
            className="gap-2"
            aria-label="Copy solution to clipboard"
          >
            📤 Share
          </Button>
        </div>
      )}
    </div>
  );
};

export default MakeTen;
