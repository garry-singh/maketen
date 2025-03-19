export interface ExpressionItem {
  type: "number" | "operator" | "bracket";
  value: string;
  used: boolean;
  id: string;
  isGrouped?: boolean;
  originalExpression?: ExpressionItem[];
  locked?: boolean;
}

export interface DragDropBuilderProps {
  numbers: number[];
  target: number;
  onSolve: (exprStr: string) => void;
  solved: boolean;
  expression: ExpressionItem[];
  usedNumbers: boolean[];
  onExpressionChange: (expression: ExpressionItem[]) => void;
  onUsedNumbersChange: (usedNumbers: boolean[]) => void;
  onFullExpressionChange: (fullExpression: string) => void;
}

export interface DraggableNumberProps {
  number: number;
  used: boolean;
  onDragStart: (e: React.DragEvent<HTMLButtonElement>) => void;
  onClick: () => void;
}

export interface DraggableOperatorProps {
  operator: string;
  onDragStart: (e: React.DragEvent<HTMLButtonElement>) => void;
  onClick: () => void;
}

export interface ExpressionItemProps {
  item: ExpressionItem;
  onRemove: () => void;
} 