import React from "react";
import { cn } from "@/lib/utils";
import { DraggableNumberProps } from "@/lib/make-x/interfaces";

const DraggableNumber: React.FC<DraggableNumberProps> = ({
  number,
  used,
  onDragStart,
  onTouchStart,
  onClick,
}) => (
  <button
    draggable={!used}
    onDragStart={onDragStart}
    onTouchStart={onTouchStart}
    onClick={onClick}
    disabled={used}
    className={cn(
      "w-12 h-12 md:w-[60px] md:h-[60px] flex items-center justify-center rounded-lg text-lg md:text-2xl font-bold transition-colors",
      used
        ? "bg-muted/50 text-muted-foreground/50 cursor-not-allowed"
        : "bg-primary text-primary-foreground hover:bg-primary/90 cursor-grab active:cursor-grabbing"
    )}
  >
    {number}
  </button>
);

export default DraggableNumber;
