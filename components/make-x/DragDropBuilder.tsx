"use client";

import React from "react";
import { OPERATORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { DragDropBuilderProps } from "@/lib/make-x/interfaces";
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

  const handleAdd = (
    value: string,
    type: "number" | "operator" | "bracket"
  ) => {
    if (solved) return;

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

      onExpressionChange([
        ...expression,
        { type: "number", value, used: true, id: Math.random().toString() },
      ]);

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

      onExpressionChange([
        ...expression,
        { type: "operator", value, used: false, id: Math.random().toString() },
      ]);
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

      onExpressionChange([
        ...expression,
        { type: "bracket", value, used: false, id: Math.random().toString() },
      ]);
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
    const newExpression = [...expression];
    const removedItem = newExpression[index];
    newExpression.splice(index, 1);

    // Update usedNumbers state
    const newUsedNumbers = [...usedNumbers];
    if (removedItem.type === "number") {
      const numberIndex = numbers.indexOf(parseInt(removedItem.value));
      if (numberIndex !== -1) {
        newUsedNumbers[numberIndex] = false;
      }
    }

    // Check if the remaining expression is valid
    let isValid = true;
    let bracketCount = 0;
    let lastWasOperator = true; // Start with true to allow first item to be a number or opening bracket
    let lastWasNumber = false;

    for (let i = 0; i < newExpression.length; i++) {
      const item = newExpression[i];

      if (item.type === "bracket") {
        if (item.value === "(") {
          bracketCount++;
          lastWasOperator = true;
          lastWasNumber = false;
        } else {
          bracketCount--;
          lastWasOperator = false;
          lastWasNumber = true;
        }
      } else if (item.type === "operator") {
        if (lastWasOperator && item.value !== "(") {
          isValid = false;
          break;
        }
        lastWasOperator = true;
        lastWasNumber = false;
      } else {
        if (!lastWasOperator && !lastWasNumber) {
          isValid = false;
          break;
        }
        lastWasOperator = false;
        lastWasNumber = true;
      }

      if (bracketCount < 0) {
        isValid = false;
        break;
      }
    }

    if (bracketCount !== 0) {
      isValid = false;
    }

    if (isValid) {
      onExpressionChange(newExpression);
      onUsedNumbersChange(newUsedNumbers);
    } else {
      // If invalid, try to find the last valid position
      let lastValidIndex = -1;
      let tempBracketCount = 0;
      let tempLastWasOperator = true;
      let tempLastWasNumber = false;

      for (let i = 0; i < newExpression.length; i++) {
        const item = newExpression[i];

        if (item.type === "bracket") {
          if (item.value === "(") {
            tempBracketCount++;
            tempLastWasOperator = true;
            tempLastWasNumber = false;
          } else {
            tempBracketCount--;
            tempLastWasOperator = false;
            tempLastWasNumber = true;
          }
        } else if (item.type === "operator") {
          if (tempLastWasOperator && item.value !== "(") {
            break;
          }
          tempLastWasOperator = true;
          tempLastWasNumber = false;
        } else {
          if (!tempLastWasOperator && !tempLastWasNumber) {
            break;
          }
          tempLastWasOperator = false;
          tempLastWasNumber = true;
        }

        if (tempBracketCount < 0) {
          break;
        }

        lastValidIndex = i;
      }

      if (tempBracketCount !== 0) {
        lastValidIndex--;
      }

      if (lastValidIndex >= 0) {
        // Keep only the valid part of the expression
        const validExpression = newExpression.slice(0, lastValidIndex + 1);
        onExpressionChange(validExpression);

        // Update usedNumbers to match the valid expression
        const validUsedNumbers = [...usedNumbers];
        numbers.forEach((num, idx) => {
          const isUsed = validExpression.some(
            (item) => item.type === "number" && parseInt(item.value) === num
          );
          validUsedNumbers[idx] = isUsed;
        });
        onUsedNumbersChange(validUsedNumbers);
      } else {
        // If no valid part found, clear the expression
        onExpressionChange([]);
        onUsedNumbersChange(new Array(numbers.length).fill(false));
      }
    }
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
            expression.map((item, index) => (
              <ExpressionItem
                key={item.id}
                item={item}
                onRemove={() => handleRemove(index)}
              />
            ))
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
