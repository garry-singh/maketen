import InfoDialog from "@/components/game/InfoDialog";
import { MAKE_X_GAME } from "@/lib/games/config";

const MakeXInfoDialog = () => (
  <InfoDialog
    game={MAKE_X_GAME}
    objective="Use all the given numbers exactly once to create an expression that equals the target number."
    rules={[
      "Use each number exactly once",
      "Use basic operators: +, -, *, /",
      "Use parentheses to control order of operations",
      "You can drag and drop items or click them to add them to your expression.",
      "Click the × button on any item to remove it from your expression.",
    ]}
    example={[
      "Numbers: 100, 2, 8, 50, 6, 5",
      "Target: 100",
      "Solution: 100(8-5) - 50(6-2)",
    ]}
  />
);

export default MakeXInfoDialog;
