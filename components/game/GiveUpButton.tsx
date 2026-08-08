"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";

interface GiveUpButtonProps {
  onReveal: () => void;
}

/**
 * Two-step so nobody spoils the puzzle with a stray tap - the first press only
 * asks, and the choice can be backed out of.
 */
const GiveUpButton: React.FC<GiveUpButtonProps> = ({ onReveal }) => {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
      >
        Give up and see the answer
      </button>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-sm text-muted-foreground">
        This ends today&apos;s puzzle and skips the streak. Sure?
      </p>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" onClick={() => setConfirming(false)}>
          Keep trying
        </Button>
        <Button variant="destructive" size="sm" onClick={onReveal}>
          Show the answer
        </Button>
      </div>
    </div>
  );
};

export default GiveUpButton;
