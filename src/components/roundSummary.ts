import type { EffectiveAction, GameState, PlayerState } from "@/game/types";

import { playerStateLabel } from "@/components/stateLabels";

export interface RoundSummary {
  roundCompleted: number;
  p1DamageTaken: number;
  p2DamageTaken: number;
  p1StateBefore: PlayerState;
  p2StateBefore: PlayerState;
  p1StateAfter: PlayerState;
  p2StateAfter: PlayerState;
  p1Effective: EffectiveAction;
  p2Effective: EffectiveAction;
}

export function buildRoundSummary(
  prev: GameState,
  next: GameState,
): RoundSummary | null {
  const le = next.lastEffectiveActions;
  if (!le) return null;
  return {
    roundCompleted: prev.roundNumber,
    p1DamageTaken: Math.max(0, prev.p1.hp - next.p1.hp),
    p2DamageTaken: Math.max(0, prev.p2.hp - next.p2.hp),
    p1StateBefore: prev.p1.state,
    p2StateBefore: prev.p2.state,
    p1StateAfter: next.p1.state,
    p2StateAfter: next.p2.state,
    p1Effective: le.p1,
    p2Effective: le.p2,
  };
}

export function describeStateArrow(before: PlayerState, after: PlayerState): string {
  const b = playerStateLabel(before);
  const a = playerStateLabel(after);
  if (before === after) return `${a} (unchanged)`;
  return `${b} → ${a}`;
}
