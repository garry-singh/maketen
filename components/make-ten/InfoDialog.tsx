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
import { FaCircleInfo } from "react-icons/fa6";
import { useState } from "react";

const InfoDialog = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Handle dialog state changes
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
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
          <DialogTitle className="text-2xl">How to Play Make 10</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <DialogDescription>
            Use all the given numbers exactly once to create an expression that
            equals 10.
          </DialogDescription>

          <section>
            <h3 className="font-semibold mb-2">Rules:</h3>
            <ul className="list-disc pl-4 space-y-2">
              <li>Use each number exactly once</li>
              <li>Use basic operators: +, -, *, /</li>
              <li>Use parentheses to control order of operations</li>
              <li>Solve within 45 seconds to maintain your streak</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold mb-2">Example:</h3>
            <div className="space-y-1">
              <div>Numbers: 2, 3, 4, 5</div>
              <div>Solution: (4 * 2) + 5 - 3 = 10</div>
            </div>
          </section>

          <section>
            <h3 className="font-semibold mb-2">Streaks:</h3>
            <div>
              Solve consecutive daily puzzles within 45 seconds to build your
              streak!
            </div>
          </section>

          <DialogClose asChild>
            <Button
              className="w-full mt-4"
              variant="secondary"
              onClick={() => setIsOpen(false)}
            >
              Got it!
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InfoDialog;
