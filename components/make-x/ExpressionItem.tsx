import React from "react";
import { cn } from "@/lib/utils";
import { ExpressionItemProps } from "@/lib/make-x/interfaces";

const ExpressionItem: React.FC<ExpressionItemProps> = ({ item, onRemove }) => (
  <div className="relative">
    <div
      className={cn(
        "w-12 h-12 md:w-[60px] md:h-[60px] flex items-center justify-center rounded-lg text-lg md:text-2xl font-bold transition-colors",
        item.type === "number"
          ? "bg-primary text-primary-foreground"
          : item.value === "(" || item.value === ")"
          ? "bg-accent text-accent-foreground"
          : "bg-secondary text-secondary-foreground"
      )}
    >
      {item.value}
    </div>
    <button
      onClick={onRemove}
      className="absolute -top-2 -right-2 w-6 h-6 md:w-7 md:h-7 rounded-full bg-red-500 text-white flex items-center justify-center text-sm md:text-base font-bold hover:bg-red-600 transition-colors shadow-sm"
    >
      ×
    </button>
  </div>
);

export default ExpressionItem;
