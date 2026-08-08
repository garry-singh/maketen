import InfoDialog from "@/components/game/InfoDialog";
import { MAKE_TEN_GAME } from "@/lib/games/config";

const MakeTenInfoDialog = () => (
  <InfoDialog
    game={MAKE_TEN_GAME}
    objective="Use all the given numbers exactly once to create an expression that equals 10."
    rules={[
      "Use each number exactly once",
      "Use basic operators: +, -, *, /",
      "Use parentheses to control order of operations",
    ]}
    example={["Numbers: 2, 3, 4, 5", "Solution: (4 * 2) + 5 - 3 = 10"]}
  />
);

export default MakeTenInfoDialog;
