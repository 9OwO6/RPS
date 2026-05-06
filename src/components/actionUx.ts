import { getAvailableInputActionsForPlayer } from "@/game/actionAvailability";
import type { InputAction, PlayerSnapshot, PlayerState } from "@/game/types";

export function getActionDisabledReason(
  snapshot: Pick<PlayerSnapshot, "state" | "paperStreak">,
  action: InputAction,
): string | null {
  const { state, paperStreak } = snapshot;
  if (state === "STAGGERED") return null;
  if (getAvailableInputActionsForPlayer({ state, paperStreak }).includes(action)) {
    return null;
  }
  if (action === "PAPER" && paperStreak >= 2) {
    return "After two consecutive Papers, Paper is locked. Choose another action first.";
  }

  switch (action) {
    case "HOLD":
      return "Only while charging Rock at Lv1. Choose Rock from Normal first to enter charge.";
    case "SCISSORS":
      return state === "CHARGING_LV2"
        ? "Scissors cannot be picked at Rock charge Lv2 — release Rock (Rock) or feint Paper."
        : "Scissors cannot be picked in your current stance.";
    case "ROCK":
      return "Rock cannot be picked in your current stance.";
    case "PAPER":
      return "Paper cannot be picked in your current stance.";
    default: {
      const _e: never = action;
      return _e;
    }
  }
}

export const ACTION_TAGLINES: Record<InputAction, string> = {
  SCISSORS: "Fast attack. Beats Paper.",
  ROCK: "Charge or release Rock depending on state.",
  PAPER: "Counters Rock release only.",
  HOLD: "Continue Rock charge to Lv2.",
};
