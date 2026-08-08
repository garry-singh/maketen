"use client";

import React, { useRef } from "react";
import { OPERATORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { tryEvaluateArithmetic } from "@/lib/expression-eval";
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
  onFullExpressionChange,
}) => {
  // Only ever incremented from event handlers, so ids stay stable across renders
  const nextItemId = useRef(0);
  const createItemId = () => `item-${nextItemId.current++}`;

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

  // Add touch event handlers
  const handleTouchStart = (
    e: React.TouchEvent,
    value: string,
    type: "number" | "operator" | "bracket"
  ) => {
    // Store the data in a data attribute on the element
    const target = e.currentTarget as HTMLElement;
    target.dataset.dragData = JSON.stringify({ type, value });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault(); // Prevent scrolling while dragging
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const target = e.currentTarget as HTMLElement;
    const data = target.dataset.dragData;
    if (data) {
      try {
        const parsed = JSON.parse(data);
        handleAdd(parsed.value, parsed.type);
      } catch {
        return;
      }
    }
  };

  const evaluateExpression = (expr: ExpressionItemType[]): number | null =>
    tryEvaluateArithmetic(expr.map((item) => item.value).join(""));

  const findNewCompleteExpression = (
    expr: ExpressionItemType[]
  ): { startIndex: number; endIndex: number } | null => {
    // If less than 3 items, no complete expression possible
    if (expr.length < 3) return null;

    // First check for complete bracketed expressions
    let openBracketCount = 0;
    let lastOpenBracketIndex = -1;

    for (let i = 0; i < expr.length; i++) {
      if (expr[i].value === "(") {
        openBracketCount++;
        lastOpenBracketIndex = i;
      } else if (expr[i].value === ")") {
        openBracketCount--;
        // If we've found a matching closing bracket
        if (openBracketCount === 0 && lastOpenBracketIndex !== -1) {
          // Evaluate the expression inside the brackets
          const innerExpr = expr.slice(lastOpenBracketIndex + 1, i);
          const result = evaluateExpression(innerExpr);
          if (result !== null) {
            return {
              startIndex: lastOpenBracketIndex,
              endIndex: i,
            };
          }
        }
      }
    }

    // Find the last locked item
    let lastLockedIndex = -1;
    for (let i = expr.length - 1; i >= 0; i--) {
      if (expr[i].locked) {
        lastLockedIndex = i;
        break;
      }
    }

    // If we have no locked items, check the entire expression
    if (lastLockedIndex === -1) {
      const result = evaluateExpression(expr);
      if (result !== null) {
        return { startIndex: 0, endIndex: expr.length - 1 };
      }
      return null;
    }

    // If we have a locked item, check the segment after it
    const remainingItems = expr.slice(lastLockedIndex + 1);
    if (remainingItems.length >= 3) {
      // First item after locked item must be an operator
      if (remainingItems[0].type !== "operator") {
        return null;
      }

      // Check the items after the operator
      const itemsAfterOperator = remainingItems.slice(1);
      const result = evaluateExpression(itemsAfterOperator);
      if (result !== null) {
        return {
          startIndex: lastLockedIndex + 2, // Skip the locked item and the operator
          endIndex: expr.length - 1,
        };
      }
    }

    return null;
  };

  const groupExpressions = (
    expr: ExpressionItemType[]
  ): ExpressionItemType[] => {
    if (expr.length === 0) return [];

    const validRange = findNewCompleteExpression(expr);
    if (!validRange) return expr;

    const { startIndex, endIndex } = validRange;
    const subExpr = expr.slice(startIndex, endIndex + 1);
    const result = evaluateExpression(subExpr);

    if (result === null) return expr;

    // Create a new grouped item for the evaluated expression
    const groupedItem: ExpressionItemType = {
      type: "number",
      value: result.toString(),
      used: true,
      id: createItemId(),
      isGrouped: true,
      locked: true,
      originalExpression: subExpr,
    };

    // Return: items before + grouped item + items after
    return [
      ...expr.slice(0, startIndex),
      groupedItem,
      ...expr.slice(endIndex + 1),
    ];
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
      id: createItemId(),
    };

    // Create new expression array
    let newExpression = [...expression];

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
      // Can't add operator after operator
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

    // Try to group expressions
    newExpression = groupExpressions(newExpression);
    onExpressionChange(newExpression);
    onFullExpressionChange(getFullExpression(newExpression));
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

  const restoreNumbers = (item: ExpressionItemType) => {
    const numbersToRestore: number[] = [];

    const collectNumbers = (item: ExpressionItemType) => {
      // If it's a grouped item with original expression
      if (item.isGrouped && item.originalExpression) {
        item.originalExpression.forEach((subItem) => {
          // Recursively collect numbers from nested groups
          if (subItem.isGrouped) {
            collectNumbers(subItem);
          }
          // Collect individual numbers
          else if (subItem.type === "number") {
            const num = parseInt(subItem.value);
            if (!numbersToRestore.includes(num)) {
              numbersToRestore.push(num);
            }
          }
        });
      }
      // If it's a regular number
      else if (item.type === "number") {
        const num = parseInt(item.value);
        if (!numbersToRestore.includes(num)) {
          numbersToRestore.push(num);
        }
      }
    };

    collectNumbers(item);

    // Update usedNumbers once with all collected numbers
    if (numbersToRestore.length > 0) {
      const newUsedNumbers = [...usedNumbers];
      numbersToRestore.forEach((num) => {
        const index = numbers.indexOf(num);
        if (index !== -1) {
          newUsedNumbers[index] = false;
        }
      });
      onUsedNumbersChange(newUsedNumbers);
    }
  };

  const clearExpressionAndRestoreAllNumbers = () => {
    // Create a new array with all numbers marked as unused
    const newUsedNumbers = new Array(numbers.length).fill(false);
    onUsedNumbersChange(newUsedNumbers);
    onExpressionChange([]);
    onFullExpressionChange("");
    toast.error(
      "Expression cleared as it would be invalid without the operator"
    );
  };

  const handleRemove = (index: number) => {
    const itemToRemove = expression[index];

    // Check if removing an operator would result in an invalid expression
    if (itemToRemove.type === "operator") {
      // Create a test expression without the operator
      const testExpression = expression.filter((_, i) => i !== index);

      // Check if any two adjacent items are both numbers or groups
      for (let i = 0; i < testExpression.length - 1; i++) {
        const currentItem = testExpression[i];
        const nextItem = testExpression[i + 1];

        if (
          (currentItem.type === "number" || currentItem.isGrouped) &&
          (nextItem.type === "number" || nextItem.isGrouped)
        ) {
          // Invalid sequence found, clear everything
          clearExpressionAndRestoreAllNumbers();
          onFullExpressionChange("");
          return;
        }
      }
    }

    // Normal removal for other cases
    restoreNumbers(itemToRemove);
    const newExpression = expression.filter((_, i) => i !== index);
    onExpressionChange(newExpression);
    onFullExpressionChange(getFullExpression(newExpression));
  };

  const currentValue = tryEvaluateArithmetic(
    expression.map((item) => item.value).join("")
  );

  // Filter out the backspace operator
  const validOperators = OPERATORS.filter((op) => op !== "⌫");

  // Calculate grid columns to match number count exactly
  const getNumberGridCols = (count: number): string => {
    switch (count) {
      case 2:
        return "grid-cols-2";
      case 3:
        return "grid-cols-3";
      case 4:
        return "grid-cols-4";
      case 5:
        return "grid-cols-5";
      case 6:
        return "grid-cols-6";
      default:
        return "grid-cols-6"; // fallback
    }
  };

  const getFullExpression = (expr: ExpressionItemType[]): string => {
    return expr
      .map((item) => {
        if (item.isGrouped && item.originalExpression) {
          return getFullExpression(item.originalExpression);
        }
        return item.value;
      })
      .join("");
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col items-center gap-6 md:gap-8">
      <div className="w-full max-w-xl md:max-w-6xl">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
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
          {expression.length > 0 ? getFullExpression(expression) : "?"}
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
              onTouchStart={(e) =>
                handleTouchStart(e, num.toString(), "number")
              }
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
              onTouchStart={(e) =>
                handleTouchStart(
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
