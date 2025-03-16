import { ValidationResult } from "./types";

/**
 * Validates a mathematical expression
 * @param expr - The mathematical expression to validate
 * @returns A validation result object with isValid flag and optional error message
 */
export const validateExpression = (expr: string): ValidationResult => {
  // Check for division by zero
  if (expr.includes("/0")) {
    return { isValid: false, error: "Division by zero is not allowed" };
  }

  // Check for balanced parentheses
  let parenCount = 0;
  for (const char of expr) {
    if (char === "(") parenCount++;
    if (char === ")") parenCount--;
    if (parenCount < 0) {
      return { isValid: false, error: "Unmatched closing parenthesis" };
    }
  }
  if (parenCount !== 0) {
    return { isValid: false, error: "Unmatched opening parenthesis" };
  }

  // Check for valid operator sequences
  const operatorRegex = /[+\-*/]{2,}/;
  if (operatorRegex.test(expr)) {
    return { isValid: false, error: "Invalid operator sequence" };
  }

  return { isValid: true };
};

/**
 * Validates that a solution uses all required numbers exactly once
 * @param userInput - The user's equation
 * @param puzzleNumbers - The numbers that must be used
 * @returns A validation result
 */
export const validateNumbersUsed = (
  userInput: string,
  puzzleNumbers: number[]
): ValidationResult => {
  const inputNumbers = userInput.match(/\d+/g)?.map(Number) || [];
  const sortedInputNumbers = [...inputNumbers].sort((a, b) => a - b);
  const sortedPuzzleNumbers = [...puzzleNumbers].sort((a, b) => a - b);

  if (JSON.stringify(sortedInputNumbers) !== JSON.stringify(sortedPuzzleNumbers)) {
    return { 
      isValid: false, 
      error: "You must use all given numbers exactly once!" 
    };
  }

  return { isValid: true };
};

/**
 * Evaluates if the expression equals the target number
 * @param expression - The mathematical expression
 * @param target - The target number (default is 10)
 * @returns A validation result
 */
export const validateResult = (
  expression: string, 
  target: number = 10
): ValidationResult => {
  try {
    if (eval(expression) === target) {
      return { isValid: true };
    }
    return { isValid: false, error: "Incorrect. Try again!" };
  } catch {
    return { isValid: false, error: "Invalid equation. Please check your input." };
  }
};