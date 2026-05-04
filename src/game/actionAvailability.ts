import type { InputAction, PlayerState } from "./types";

const ALL_INPUTS: InputAction[] = ["SCISSORS", "ROCK", "PAPER", "HOLD"];

export function getAvailableInputActions(state: PlayerState): InputAction[] {
  switch (state) {
    case "NORMAL":
      return ALL_INPUTS.filter((a) => a !== "HOLD");
    case "CHARGING_LV1":
      return [...ALL_INPUTS];
    case "CHARGING_LV2":
      return ALL_INPUTS.filter((a) => a === "ROCK" || a === "PAPER");
    case "STAGGERED":
      return [];
    default: {
      const _exhaustive: never = state;
      return _exhaustive;
    }
  }
}

export function isInputAllowed(
  state: PlayerState,
  input: InputAction,
): boolean {
  return getAvailableInputActions(state).includes(input);
}
