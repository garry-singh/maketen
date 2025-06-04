import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import DraggableOperator from "./DraggableOperator";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ExpressionBuilderProps {
  numbers: number[];
  selectedOperators: string[];
  onOperatorSelect: (operator: string, index: number) => void;
  onOperatorRemove: (index: number) => void;
  solved: boolean;
  target: number;
}

const operators = ["+", "-", "*", "/"];

const ExpressionBuilder: React.FC<ExpressionBuilderProps> = ({
  numbers,
  selectedOperators,
  onOperatorSelect,
  onOperatorRemove,
  solved,
  target,
}) => {
  const [currentResult, setCurrentResult] = useState<number | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  // Calculate current result whenever operators change
  useEffect(() => {
    if (selectedOperators.some((op) => !op)) {
      setCurrentResult(null);
      return;
    }

    let expression = "";
    for (let i = 0; i < numbers.length; i++) {
      expression += numbers[i];
      if (i < selectedOperators.length) {
        expression += selectedOperators[i];
      }
    }

    try {
      const result = eval(expression);
      setCurrentResult(
        typeof result === "number" && isFinite(result) ? result : null
      );
    } catch {
      setCurrentResult(null);
    }
  }, [numbers, selectedOperators]);

  const handleDragStart = (e: React.DragEvent, operator: string) => {
    e.dataTransfer.setData("application/make-exact-operations", operator);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleTouchStart = (e: React.TouchEvent, operator: string) => {
    const target = e.currentTarget as HTMLElement;
    target.dataset.dragData = operator;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const target = e.currentTarget as HTMLElement;
    const operator = target.dataset.dragData;
    if (operator) {
      const index = parseInt(target.dataset.index || "0");
      onOperatorSelect(operator, index);
    }
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (solved) return;

    try {
      const operator = e.dataTransfer.getData(
        "application/make-exact-operations"
      );
      if (operator) {
        onOperatorSelect(operator, index);
      }
    } catch {
      return;
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.types.includes("application/make-exact-operations")) {
      e.dataTransfer.dropEffect = "move";
    } else {
      e.dataTransfer.dropEffect = "none";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (solved) return;

    switch (e.key) {
      case "ArrowLeft":
        if (index > 0) {
          setFocusedIndex(index - 1);
        }
        break;
      case "ArrowRight":
        if (index < selectedOperators.length - 1) {
          setFocusedIndex(index + 1);
        }
        break;
      case "Backspace":
      case "Delete":
        onOperatorRemove(index);
        break;
      case "+":
      case "-":
      case "*":
      case "/":
        onOperatorSelect(e.key, index);
        break;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col items-center gap-4 md:gap-6">
      {/* Expression Display */}
      <Card className="p-6 mb-2 w-full max-w-2xl">
        <div className="flex items-center justify-center gap-1 md:gap-2">
          {numbers.map((num, index) => (
            <div key={index} className="flex items-center">
              <span className="text-2xl font-bold">{num}</span>
              {index < numbers.length - 1 && (
                <div className="relative">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          onDrop={(e) => handleDrop(e, index)}
                          onDragOver={handleDragOver}
                          onTouchMove={handleTouchMove}
                          onTouchEnd={handleTouchEnd}
                          onKeyDown={(e) => handleKeyDown(e, index)}
                          tabIndex={0}
                          data-index={index}
                          className={cn(
                            "mx-1 md:mx-2 w-10 h-10 md:w-[50px] md:h-[50px] flex items-center justify-center rounded-lg text-lg md:text-2xl font-bold transition-colors",
                            selectedOperators[index]
                              ? "bg-secondary text-secondary-foreground"
                              : "border-2 border-dashed border-muted hover:border-primary/50",
                            focusedIndex === index &&
                              "ring-2 ring-primary ring-offset-2"
                          )}
                        >
                          {selectedOperators[index] || "?"}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Drop operator or press +, -, *, /</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  {selectedOperators[index] && (
                    <button
                      onClick={() => onOperatorRemove(index)}
                      className="absolute -top-2 -right-2 w-5 h-5 md:w-6 md:h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-sm md:text-base font-bold hover:bg-red-600 transition-colors shadow-sm"
                    >
                      ×
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Current Result */}
      {currentResult !== null && (
        <div className="text-xl md:text-2xl font-bold flex items-center gap-2">
          <span className="text-muted-foreground">Current result:</span>
          <span
            className={cn(
              currentResult === target ? "text-green-500" : "text-yellow-500"
            )}
          >
            {currentResult}
          </span>
        </div>
      )}

      {/* Operator Buttons */}
      <div className="grid grid-cols-4 gap-1 md:gap-2 w-full max-w-[280px] md:max-w-[320px]">
        {operators.map((op) => (
          <DraggableOperator
            key={op}
            operator={op}
            onDragStart={(e) => handleDragStart(e, op)}
            onTouchStart={(e) => handleTouchStart(e, op)}
            onClick={() => {
              // Find the first empty slot
              const index = selectedOperators.findIndex((op) => !op);
              if (index !== -1) {
                onOperatorSelect(op, index);
              }
            }}
            disabled={solved || selectedOperators.every((op) => op)}
          />
        ))}
      </div>
    </div>
  );
};

export default ExpressionBuilder;
