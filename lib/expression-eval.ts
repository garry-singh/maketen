/**
 * Arithmetic evaluator used in place of `eval` for puzzle expressions.
 *
 * Supports `+ - * /`, parentheses, unary signs and decimal/exponent literals,
 * which covers every expression the games build (including the intermediate
 * values produced by grouping, e.g. "0.3333333333333333" or "-4").
 *
 * Matches `eval` semantics for the supported grammar: standard precedence,
 * left associativity, IEEE-754 arithmetic (so `1/0` is `Infinity`). Anything
 * outside the grammar throws a SyntaxError, mirroring how `eval` rejected
 * malformed input.
 */

type Token =
  | { type: "number"; value: number }
  | { type: "symbol"; value: string };

const NUMBER_PATTERN = /^\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/;
const SYMBOLS = new Set(["+", "-", "*", "/", "(", ")"]);

const tokenize = (expression: string): Token[] => {
  const tokens: Token[] = [];
  let index = 0;

  while (index < expression.length) {
    const char = expression[index];

    if (char === " " || char === "\t") {
      index++;
      continue;
    }

    if (SYMBOLS.has(char)) {
      tokens.push({ type: "symbol", value: char });
      index++;
      continue;
    }

    const numberMatch = NUMBER_PATTERN.exec(expression.slice(index));
    if (!numberMatch) {
      throw new SyntaxError(`Unexpected character "${char}" in expression`);
    }

    tokens.push({ type: "number", value: Number(numberMatch[0]) });
    index += numberMatch[0].length;
  }

  return tokens;
};

/**
 * Evaluates a mathematical expression
 * @param expression - The expression to evaluate, e.g. "(1+2)*3"
 * @returns The numeric result
 * @throws SyntaxError if the expression is malformed
 */
export const evaluateArithmetic = (expression: string): number => {
  const tokens = tokenize(expression);
  let position = 0;

  const consumeSymbol = (symbol: string): boolean => {
    const token = tokens[position];
    if (token?.type === "symbol" && token.value === symbol) {
      position++;
      return true;
    }
    return false;
  };

  // factor := ('+' | '-') factor | number | '(' sum ')'
  const parseFactor = (): number => {
    if (consumeSymbol("+")) return parseFactor();
    if (consumeSymbol("-")) return -parseFactor();

    const token = tokens[position];
    if (!token) {
      throw new SyntaxError("Unexpected end of expression");
    }

    if (token.type === "number") {
      position++;
      return token.value;
    }

    if (token.value === "(") {
      position++;
      const value = parseSum();
      if (!consumeSymbol(")")) {
        throw new SyntaxError("Unmatched opening parenthesis");
      }
      return value;
    }

    throw new SyntaxError(`Unexpected "${token.value}" in expression`);
  };

  // product := factor (('*' | '/') factor)*
  const parseProduct = (): number => {
    let value = parseFactor();
    for (;;) {
      if (consumeSymbol("*")) value *= parseFactor();
      else if (consumeSymbol("/")) value /= parseFactor();
      else return value;
    }
  };

  // sum := product (('+' | '-') product)*
  const parseSum = (): number => {
    let value = parseProduct();
    for (;;) {
      if (consumeSymbol("+")) value += parseProduct();
      else if (consumeSymbol("-")) value -= parseProduct();
      else return value;
    }
  };

  const result = parseSum();

  const trailing = tokens[position];
  if (trailing) {
    throw new SyntaxError(`Unexpected "${trailing.value}" in expression`);
  }

  return result;
};

/**
 * Evaluates an expression, returning null instead of throwing
 * @param expression - The expression to evaluate
 * @returns The result, or null if the expression is invalid or not finite
 */
export const tryEvaluateArithmetic = (expression: string): number | null => {
  try {
    const result = evaluateArithmetic(expression);
    return Number.isFinite(result) ? result : null;
  } catch {
    return null;
  }
};
