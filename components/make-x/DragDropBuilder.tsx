"use client";

import React from "react";
import { OPERATORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  DragDropBuilderProps,
  ExpressionItem as ExpressionItemType,
} from "@/lib/make-x/interfaces";
import DraggableNumber from "./DraggableNumber";
import DraggableOperator from "./DraggableOperator";
import ExpressionItem from "./ExpressionItem";

const DragDropBuilder: React.FC<DragDropBuilderProps> = ({
  numbers,
  solved,
  expression,
  usedNumbers,
  onExpressionChange,
  onUsedNumbersChange,
}) => {
  const handleDragStart = (
    e: React.DragEvent,
    value: string,
    type: "number" | "operator" | "bracket"
  ) => {
    e.dataTransfer.setData(
      "application/make-x",
      JSON.stringify({ type, value })
    );
    e.dataTransfer.effectAllowed = "move";
  };

  const evaluateExpression = (expr: ExpressionItemType[]): number | null => {
    try {
      const exprStr = expr.map((item) => item.value).join("");
      const result = eval(exprStr);
      return typeof result === "number" && isFinite(result) ? result : null;
    } catch {
      return null;
    }
  };

  const handleAdd = (
    value: string,
    type: "number" | "operator" | "bracket"
  ) => {
    if (solved) return;

    // Create new item
    const newItem = {
      type,
      value,
      used: type === "number",
      id: Math.random().toString(),
    };

    // Create new expression array
    const newExpression = [...expression];

    if (type === "number") {
      // Can't add number after number or after closing bracket
      if (expression.length > 0) {
        const lastItem = expression[expression.length - 1];
        if (lastItem.type === "number" || lastItem.value === ")") {
          toast.error("Please add an operator here");
          return;
        }
      }

      const num = parseInt(value);
      const numIndex = numbers.indexOf(num);
      if (usedNumbers[numIndex]) return;

      newExpression.push(newItem);

      // Update used numbers
      const newUsed = [...usedNumbers];
      newUsed[numIndex] = true;
      onUsedNumbersChange(newUsed);
    } else if (type === "operator") {
      // Can't add operator at start or after opening bracket
      if (
        expression.length === 0 ||
        expression[expression.length - 1].value === "("
      ) {
        toast.error("Cannot add operator here");
        return;
      }
      // Can't add operator after operator or after opening bracket
      const lastItem = expression[expression.length - 1];
      if (lastItem.type === "operator") {
        toast.error("Cannot add consecutive operators");
        return;
      }

      newExpression.push(newItem);
    } else if (type === "bracket") {
      if (value === "(") {
        // Opening bracket can't come after a number or closing bracket
        if (expression.length > 0) {
          const lastItem = expression[expression.length - 1];
          if (lastItem.type === "number" || lastItem.value === ")") {
            toast.error("Please add an operator before opening bracket");
            return;
          }
        }
      } else if (value === ")") {
        // Closing bracket must have matching opening bracket
        // and must come after a number or another closing bracket
        let openCount = 0;
        let closeCount = 0;
        expression.forEach((item) => {
          if (item.value === "(") openCount++;
          if (item.value === ")") closeCount++;
        });
        if (closeCount >= openCount) {
          toast.error("No matching opening bracket");
          return;
        }
        if (expression.length === 0) {
          toast.error("Cannot start with closing bracket");
          return;
        }
        const lastItem = expression[expression.length - 1];
        if (lastItem.type === "operator" || lastItem.value === "(") {
          toast.error("Cannot add closing bracket here");
          return;
        }
      }

      newExpression.push(newItem);
    }

    // Try to evaluate the expression
    const result = evaluateExpression(newExpression);
    if (result !== null) {
      // If valid, update with evaluated result
      onExpressionChange(newExpression);
    } else {
      onExpressionChange(newExpression);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (solved) return;

    try {
      const data = e.dataTransfer.getData("application/make-x");
      if (!data) return;

      const parsed = JSON.parse(data);
      handleAdd(parsed.value, parsed.type);
    } catch {
      return;
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.types.includes("application/make-x")) {
      e.dataTransfer.dropEffect = "move";
    } else {
      e.dataTransfer.dropEffect = "none";
    }
  };

  const handleRemove = (index: number) => {
    const itemToRemove = expression[index];

    // If it's a number, update usedNumbers
    if (itemToRemove.type === "number") {
      const numberIndex = numbers.indexOf(parseInt(itemToRemove.value));
      if (numberIndex !== -1) {
        const newUsedNumbers = [...usedNumbers];
        newUsedNumbers[numberIndex] = false;
        onUsedNumbersChange(newUsedNumbers);
      }
    }

    // Remove the item and update expression
    const newExpression = expression.filter((_, i) => i !== index);
    onExpressionChange(newExpression);
  };

  const calculateCurrentValue = () => {
    const exprStr = expression.map((item) => item.value).join("");

    try {
      return eval(exprStr);
    } catch {
      return null;
    }
  };

  const currentValue = calculateCurrentValue();

  // Filter out the backspace operator
  const validOperators = OPERATORS.filter((op) => op !== "⌫");

  // Calculate grid columns to match number count exactly
  const getNumberGridCols = (count: number): string => {
    return `grid-cols-${count}`;
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col items-center gap-6 md:gap-8">
      <div className="w-full max-w-xl md:max-w-6xl">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="min-h-[4rem] w-full p-4 rounded-lg border-2 border-dashed border-muted hover:border-primary/50 transition-colors flex flex-wrap items-center justify-center gap-2"
        >
          {expression.length === 0 ? (
            <span className="text-muted-foreground text-lg">
              Click or drag items to build your expression
            </span>
          ) : (
            <>
              {(() => {
                const result = evaluateExpression(expression);

                // If we have a valid result, show only the result box
                if (result !== null) {
                  return (
                    <div className="relative">
                      <div className="w-auto min-w-[3rem] h-12 md:h-[60px] px-4 flex items-center justify-center rounded-lg text-lg md:text-2xl font-bold bg-primary text-primary-foreground">
                        {result}
                      </div>
                      <button
                        onClick={() => {
                          // When removing a result, restore all used numbers
                          const newUsedNumbers = [...usedNumbers];
                          expression.forEach((expr) => {
                            if (expr.type === "number") {
                              const numIndex = numbers.indexOf(
                                parseInt(expr.value)
                              );
                              if (numIndex !== -1) {
                                newUsedNumbers[numIndex] = false;
                              }
                            }
                          });
                          onUsedNumbersChange(newUsedNumbers);
                          onExpressionChange([]);
                        }}
                        className="absolute -top-2 -right-2 w-6 h-6 md:w-7 md:h-7 rounded-full bg-red-500 text-white flex items-center justify-center text-sm md:text-base font-bold hover:bg-red-600 transition-colors shadow-sm"
                      >
                        ×
                      </button>
                    </div>
                  );
                }

                // Otherwise show the individual items while building the expression
                return expression.map((item, index) => (
                  <ExpressionItem
                    key={item.id}
                    item={item}
                    onRemove={() => handleRemove(index)}
                  />
                ));
              })()}
            </>
          )}
        </div>
      </div>

      <div className="text-xl md:text-2xl font-bold flex items-center gap-2">
        <span className="text-muted-foreground">
          {expression.length > 0
            ? expression.map((item) => item.value).join("")
            : "?"}
        </span>
        <span>=</span>
        <span>{currentValue !== null ? currentValue : "?"}</span>
      </div>

      <div className="w-full max-w-xl flex flex-col items-center gap-1 md:gap-2">
        <div
          className={cn(
            "grid gap-1 md:gap-2",
            getNumberGridCols(numbers.length)
          )}
        >
          {numbers.map((num, index) => (
            <DraggableNumber
              key={num}
              number={num}
              used={usedNumbers[index]}
              onDragStart={(e) => handleDragStart(e, num.toString(), "number")}
              onClick={() => handleAdd(num.toString(), "number")}
            />
          ))}
        </div>

        <div className="grid grid-cols-6 gap-1 md:gap-2">
          {validOperators.map((op) => (
            <DraggableOperator
              key={op}
              operator={op}
              onDragStart={(e) =>
                handleDragStart(
                  e,
                  op,
                  op === "(" || op === ")" ? "bracket" : "operator"
                )
              }
              onClick={() =>
                handleAdd(op, op === "(" || op === ")" ? "bracket" : "operator")
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DragDropBuilder;
