"use client";

import { useState } from "react";
import { FaCircleInfo } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { GameConfig, formatStreakLimit } from "@/lib/games/config";

interface InfoDialogProps {
  game: GameConfig;
  /** One-line summary of the objective */
  objective: string;
  rules: string[];
  example: string[];
}

/**
 * "How to play" dialog shared by every game mode.
 *
 * The streak line is derived from the game config, so it can never disagree
 * with the limit `solvePuzzle` actually enforces.
 */
const InfoDialog = ({ game, objective, rules, example }: InfoDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10"
          aria-label="How to play"
        >
          <FaCircleInfo className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[425px]"
        onPointerDownOutside={(e) => e.preventDefault()} // Prevent accidental closes
        onEscapeKeyDown={() => setIsOpen(false)}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl">
            How to Play {game.name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <DialogDescription>{objective}</DialogDescription>

          <section>
            <h3 className="font-semibold mb-2">Rules:</h3>
            <ul className="list-disc pl-4 space-y-2">
              {rules.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="font-semibold mb-2">Example:</h3>
            <div className="space-y-1">
              {example.map((line) => (
                <div key={line}>{line}</div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="font-semibold mb-2">Streaks:</h3>
            <div>
              Solve consecutive daily puzzles within{" "}
              {formatStreakLimit(game.streakTimeLimit)} to build your streak!
            </div>
          </section>

          <DialogClose asChild>
            <Button className="w-full mt-4" variant="secondary">
              Got it!
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InfoDialog;
