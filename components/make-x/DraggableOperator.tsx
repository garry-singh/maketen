import React from "react";
import { cn } from "@/lib/utils";
import { DraggableOperatorProps } from "@/lib/make-x/interfaces";

const DraggableOperator: React.FC<DraggableOperatorProps> = ({
  operator,
  onDragStart,
  onClick,
}) => (
  <button
    draggable
    onDragStart={onDragStart}
    onClick={onClick}
    className={cn(
      "w-12 h-12 md:w-[60px] md:h-[60px] flex items-center justify-center rounded-lg text-lg md:text-2xl font-bold transition-colors",
      operator === "(" || operator === ")"
        ? "bg-accent text-accent-foreground hover:bg-accent/90"
        : "bg-secondary text-secondary-foreground hover:bg-secondary/90",
      "cursor-grab active:cursor-grabbing"
    )}
  >
    {operator}
  </button>
);

export default DraggableOperator;
