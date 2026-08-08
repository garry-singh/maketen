import React from "react";

interface RevealedAnswerProps {
  solution: string;
}

/**
 * Shown when the player gives up. The day is over either way, so the answer is
 * worth more than the mystery - it is how anyone learns the trick for next time.
 */
const RevealedAnswer: React.FC<RevealedAnswerProps> = ({ solution }) => (
  <div className="w-full max-w-2xl my-6 p-5 rounded-lg border border-border bg-muted/40 text-center">
    <h2 className="text-sm uppercase tracking-wide text-muted-foreground mb-2">
      Today’s answer
    </h2>
    <p className="text-2xl font-bold break-words lg:text-3xl">{solution}</p>
    <p className="mt-3 text-sm text-muted-foreground">
      No streak today - come back tomorrow for a fresh puzzle.
    </p>
  </div>
);

export default RevealedAnswer;
