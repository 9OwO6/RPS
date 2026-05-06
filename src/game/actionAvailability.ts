import type { InputAction, PlayerSnapshot, PlayerState } from "./types";

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

export function getAvailableInputActionsForPlayer(
  snapshot: Pick<PlayerSnapshot, "state" | "paperStreak">,
): InputAction[] {
  const base = getAvailableInputActions(snapshot.state);
  if (snapshot.paperStreak >= 2) {
    return base.filter((action) => action !== "PAPER");
  }
  return base;
}

export function isInputAllowed(
  snapshot: Pick<PlayerSnapshot, "state" | "paperStreak">,
  input: InputAction,
): boolean {
  return getAvailableInputActionsForPlayer(snapshot).includes(input);
}
