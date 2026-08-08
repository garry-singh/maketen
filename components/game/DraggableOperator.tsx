import React from "react";
import { cn } from "@/lib/utils";

interface DraggableOperatorProps {
  operator: string;
  onDragStart: (e: React.DragEvent<HTMLButtonElement>) => void;
  onTouchStart: (e: React.TouchEvent<HTMLButtonElement>) => void;
  onClick: () => void;
  disabled?: boolean;
}

const isBracket = (operator: string) => operator === "(" || operator === ")";

const DraggableOperator: React.FC<DraggableOperatorProps> = ({
  operator,
  onDragStart,
  onTouchStart,
  onClick,
  disabled,
}) => (
  <button
    draggable={!disabled}
    onDragStart={onDragStart}
    onTouchStart={onTouchStart}
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "w-12 h-12 md:w-[60px] md:h-[60px] flex items-center justify-center rounded-lg text-lg md:text-2xl font-bold transition-colors",
      isBracket(operator)
        ? "bg-accent text-accent-foreground hover:bg-accent/90"
        : "bg-secondary text-secondary-foreground hover:bg-secondary/90",
      "cursor-grab active:cursor-grabbing",
      disabled && "opacity-50 cursor-not-allowed"
    )}
  >
    {operator}
  </button>
);

export default DraggableOperator;
