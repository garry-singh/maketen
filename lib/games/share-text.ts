const SOLUTION_MASK: [RegExp, string][] = [
  [/[0-9]/g, "⬛"],
  [/[()]/g, "⬜"],
  [/\+/g, "➕"],
  [/-/g, "➖"],
  [/\*/g, "✖️"],
  [/\//g, "➗"],
];

/**
 * Hides the digits of a solution while keeping its shape, so a shared result
 * shows how it was solved without giving the answer away.
 */
export const maskSolution = (solution: string): string =>
  SOLUTION_MASK.reduce(
    (masked, [pattern, glyph]) => masked.replace(pattern, glyph),
    solution
  );

interface ShareTextOptions {
  /** Hashtag for the game, e.g. "Make10" */
  hashtag: string;
  /** Identifies which day's puzzle this was, so shares are comparable */
  puzzleNumber: number;
  solveTime: number;
  streak: number;
  url: string;
  /** Omit to share only the time, without revealing the solution's shape */
  solution?: string;
}

export const buildShareText = ({
  hashtag,
  puzzleNumber,
  solveTime,
  streak,
  url,
  solution,
}: ShareTextOptions): string => {
  const solutionLine = solution
    ? ` \n\nMy solution: ${maskSolution(solution)}`
    : "";
  const streakLine =
    streak > 0 ? `\n\n🔥 I'm on a ${streak} day streak!` : "";

  return `I solved #${hashtag} #${puzzleNumber} in ${solveTime.toFixed(
    2
  )}s!${solutionLine}${streakLine}\n\nPlay now: ${url}`;
};
