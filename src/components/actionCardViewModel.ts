import { getAvailableInputActionsForPlayer } from "@/game/actionAvailability";
import type { InputAction, PlayerSnapshot } from "@/game/types";

type CardDisplayKind = "normal" | "forcedRockLv1";

export interface ActionCardViewModel {
  inputAction: InputAction;
  displayAction: InputAction;
  displayKind: CardDisplayKind;
  disabled: boolean;
}

export function getActionCardViewModel(
  snapshot: Pick<PlayerSnapshot, "state" | "paperStreak" | "scissorsStreak">,
  inputAction: InputAction,
): ActionCardViewModel {
  const legal = getAvailableInputActionsForPlayer(snapshot);
  const forcedRockLv1 =
    inputAction === "SCISSORS" && snapshot.scissorsStreak >= 2;

  return {
    inputAction,
    displayAction: forcedRockLv1 ? "ROCK" : inputAction,
    displayKind: forcedRockLv1 ? "forcedRockLv1" : "normal",
    disabled: !legal.includes(inputAction),
  };
}

