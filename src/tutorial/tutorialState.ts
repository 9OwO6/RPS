import { resolveRound } from "@/game/resolveRound";
import type { GameState, InputAction } from "@/game/types";

const INPUT_LABELS: Record<InputAction, string> = {
  SCISSORS: "Scissors",
  ROCK: "Rock",
  PAPER: "Paper",
  HOLD: "Hold",
};

export function cloneGameState(source: GameState): GameState {
  return {
    ...source,
    p1: { ...source.p1 },
    p2: { ...source.p2 },
    logs: source.logs.map((entry) => ({
      ...entry,
      messages: [...entry.messages],
    })),
    lastEffectiveActions: source.lastEffectiveActions
      ? { ...source.lastEffectiveActions }
      : undefined,
    winner: source.winner,
  };
}

export function resolveTutorialRound(
  starting: GameState,
  playerAction: InputAction,
  opponentAction: InputAction,
): GameState {
  return resolveRound(starting, playerAction, opponentAction);
}

export function inputActionLabel(action: InputAction): string {
  return INPUT_LABELS[action];
}
