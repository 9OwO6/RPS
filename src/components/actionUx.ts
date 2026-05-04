import { getAvailableInputActions } from "@/game/actionAvailability";
import type { InputAction, PlayerState } from "@/game/types";

export function getActionDisabledReason(
  state: PlayerState,
  action: InputAction,
): string | null {
  if (state === "STAGGERED") return null;
  if (getAvailableInputActions(state).includes(action)) return null;

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
