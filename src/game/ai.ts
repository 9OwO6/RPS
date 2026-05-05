import { getAvailableInputActions } from "@/game/actionAvailability";
import type { GameState, InputAction, PlayerId, PlayerSnapshot } from "@/game/types";

export type AiDifficulty = "EASY" | "NORMAL";

function weightedPick(
  legal: InputAction[],
  weights: Partial<Record<InputAction, number>>,
): InputAction {
  const candidates = legal.map((action) => ({
    action,
    weight: Math.max(0.01, weights[action] ?? 1),
  }));
  const total = candidates.reduce((sum, c) => sum + c.weight, 0);
  let roll = Math.random() * total;
  for (const c of candidates) {
    roll -= c.weight;
    if (roll <= 0) return c.action;
  }
  return candidates[candidates.length - 1]?.action ?? legal[0];
}

function isCharging(state: PlayerSnapshot["state"]): boolean {
  return state === "CHARGING_LV1" || state === "CHARGING_LV2";
}

function chooseNormalAction(
  ai: PlayerSnapshot,
  opp: PlayerSnapshot,
  legal: InputAction[],
): InputAction {
  const weights: Partial<Record<InputAction, number>> = {};
  for (const action of legal) {
    weights[action] = 1;
  }

  if (isCharging(opp.state) && legal.includes("PAPER")) {
    weights.PAPER = (weights.PAPER ?? 1) + 1.2;
  }
  if (opp.paperStreak >= 1 && legal.includes("SCISSORS")) {
    weights.SCISSORS = (weights.SCISSORS ?? 1) + 1.0;
  }
  if (opp.scissorsStreak >= 2 && legal.includes("PAPER")) {
    weights.PAPER = (weights.PAPER ?? 1) + 1.1;
  }

  if (ai.state === "CHARGING_LV1") {
    if (legal.includes("ROCK")) weights.ROCK = (weights.ROCK ?? 1) + 1.2;
    if (legal.includes("HOLD")) weights.HOLD = (weights.HOLD ?? 1) + 0.9;
    if (legal.includes("SCISSORS")) {
      weights.SCISSORS = (weights.SCISSORS ?? 1) + 0.5;
    }
    if (legal.includes("PAPER")) weights.PAPER = (weights.PAPER ?? 1) + 0.5;
  }

  if (ai.state === "CHARGING_LV2") {
    if (legal.includes("ROCK")) weights.ROCK = (weights.ROCK ?? 1) + 1.4;
    if (legal.includes("PAPER")) weights.PAPER = (weights.PAPER ?? 1) + 0.8;
  }

  return weightedPick(legal, weights);
}

export function chooseAiAction(
  gameState: GameState,
  aiPlayerId: PlayerId,
  difficulty: AiDifficulty,
): InputAction {
  /**
   * Fairness contract:
   * - Uses only public GameState snapshots and streaks.
   * - Does not receive/read UI-only current selected action.
   * - NORMAL applies weighted public-state heuristics, not perfect counterplay.
   */
  const ai = aiPlayerId === "P1" ? gameState.p1 : gameState.p2;
  const opponent = aiPlayerId === "P1" ? gameState.p2 : gameState.p1;
  const legal = getAvailableInputActions(ai.state);

  if (ai.state === "STAGGERED") {
    return "ROCK";
  }
  if (legal.length === 0) {
    return "ROCK";
  }
  if (difficulty === "EASY") {
    const idx = Math.floor(Math.random() * legal.length);
    return legal[idx] ?? legal[0];
  }
  return chooseNormalAction(ai, opponent, legal);
}
