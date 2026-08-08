import { GameConfig, MAKE_EXACT_OPS_GAME } from "./config";

export interface GameRules {
  /** One-line summary of the objective */
  objective: string;
  rules: string[];
  /** Worked example, one line per row */
  example: string[];
}

/**
 * Rules for each mode, keyed by game id.
 *
 * Kept here rather than inline in a component so the in-game dialog and the
 * How to play page cannot drift apart.
 */
const RULES: Record<string, GameRules> = {
  "make-ten": {
    objective:
      "Use all the given numbers exactly once to create an expression that equals 10.",
    rules: [
      "Use each number exactly once",
      "Use basic operators: +, -, *, /",
      "Use parentheses to control order of operations",
    ],
    example: ["Numbers: 2, 3, 4, 5", "Solution: (4 * 2) + 5 - 3 = 10"],
  },
  "make-x": {
    objective:
      "Use all the given numbers exactly once to create an expression that equals the target number.",
    rules: [
      "Use each number exactly once",
      "Use basic operators: +, -, *, /",
      "Use parentheses to control order of operations",
      "Drag and drop items, or click them, to add them to your expression",
      "Click the × button on any item to remove it",
    ],
    example: [
      "Numbers: 100, 2, 8, 50, 6, 5",
      "Target: 100",
      "Solution: 100(8-5) - 50(6-2)",
    ],
  },
  "make-exact-operations": {
    objective:
      "Place an operator between each pair of numbers so the expression equals the target number.",
    rules: [
      "The numbers stay in the order shown - only the operators are yours to choose",
      "Use basic operators: +, -, *, /",
      "Standard order of operations applies",
      "Drag and drop operators, or click them, to fill a slot",
      "Click the × button on any operator to remove it",
    ],
    example: ["Numbers: 2, 8, 3, 9", "Target: 17", "Solution: 2 + 8 * 3 - 9"],
  },
};

export const rulesFor = (game: GameConfig): GameRules =>
  RULES[game.id] ?? RULES[MAKE_EXACT_OPS_GAME.id];

/** Mechanics that work the same way in every mode. */
export const SHARED_RULES: { title: string; body: string }[] = [
  {
    title: "Press Start when you're ready",
    body: "The puzzle stays hidden until you press Start, and the clock begins at that moment - so the time reflects how long you took to solve it, not how long the tab was open.",
  },
  {
    title: "Beat the clock to keep your streak",
    body: "Solving counts either way, but only a fast enough solve extends your streak. Each mode has its own limit, shown below. The clock cannot be restarted by reloading.",
  },
  {
    title: "Stuck? See the answer",
    body: "Give up at any point to reveal the solution. That ends the day's puzzle and skips the streak, but it still counts as played - and it's the fastest way to learn a new trick.",
  },
  {
    title: "A new puzzle every day",
    body: "All three modes reset at midnight UTC. Your streaks, win rate and best times are stored in your browser, separately for each mode.",
  },
];
