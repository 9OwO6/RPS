import type { GameState, PlayerId, PlayerSnapshot } from "@/game/types";

/** Damage taken this resolution (HP can only drop in resolve). */
export function getDamageTaken(
  prevState: GameState,
  nextState: GameState,
  playerId: PlayerId,
): number {
  const prevHp = playerId === "P1" ? prevState.p1.hp : prevState.p2.hp;
  const nextHp = playerId === "P1" ? nextState.p1.hp : nextState.p2.hp;
  return Math.max(0, prevHp - nextHp);
}

export function didPlayerTakeDamage(
  prevState: GameState,
  nextState: GameState,
  playerId: PlayerId,
): boolean {
  return getDamageTaken(prevState, nextState, playerId) > 0;
}

export function didPlayerBecomeStaggered(
  prevState: GameState,
  nextState: GameState,
  playerId: PlayerId,
): boolean {
  const before = playerId === "P1" ? prevState.p1.state : prevState.p2.state;
  const after = playerId === "P1" ? nextState.p1.state : nextState.p2.state;
  return before !== "STAGGERED" && after === "STAGGERED";
}

export function getHpPercent(
  player: PlayerSnapshot,
  maxHp: number,
): number {
  return Math.max(
    0,
    Math.min(100, Math.round((player.hp / Math.max(maxHp, 1)) * 100)),
  );
}

export interface BattleFeedback {
  p1Damage: number;
  p2Damage: number;
  p1Hit: boolean;
  p2Hit: boolean;
  p1BecameStaggered: boolean;
  p2BecameStaggered: boolean;
}

/** Presentation-only summary from state diff after resolve. */
export function getBattleFeedback(
  prevState: GameState,
  nextState: GameState,
): BattleFeedback {
  const p1Damage = getDamageTaken(prevState, nextState, "P1");
  const p2Damage = getDamageTaken(prevState, nextState, "P2");
  return {
    p1Damage,
    p2Damage,
    p1Hit: p1Damage > 0,
    p2Hit: p2Damage > 0,
    p1BecameStaggered: didPlayerBecomeStaggered(prevState, nextState, "P1"),
    p2BecameStaggered: didPlayerBecomeStaggered(prevState, nextState, "P2"),
  };
}
