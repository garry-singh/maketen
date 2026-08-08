import InfoDialog from "@/components/game/InfoDialog";
import { MAKE_EXACT_OPS_GAME } from "@/lib/games/config";

const MakeExactOpsInfoDialog = () => (
  <InfoDialog
    game={MAKE_EXACT_OPS_GAME}
    objective="Place an operator between each pair of numbers so the expression equals the target number."
    rules={[
      "Insert operators between the numbers",
      "Use basic operators: +, -, *, /",
      "Standard order of operations applies",
      "You can drag and drop operators or click them to add them to your expression.",
      "Click the × button on any operator to remove it from your expression.",
    ]}
    example={["Numbers: 2, 8, 3, 9", "Target: 17", "Solution: 2 + 8 * 3 - 9"]}
  />
);

export default MakeExactOpsInfoDialog;
