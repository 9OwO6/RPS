import type { CombatAnimationType } from "@/presentation/combatAnimation";
import { getDamageTaken } from "@/presentation/battleFeedback";
import type { EffectiveAction, GameState, PlayerId } from "@/game/types";

/** Visual accent for damage float — from opponent effective action, presentation only. */
export type DamageFloatAccent = "scissors" | "rock" | "paper" | "neutral";

/** Tier drives size / pop strength of floating damage (from HP delta only). */
export type DamageFloatTier = "chip" | "standard" | "strong" | "heavy" | "max";

export function getDamageFloatTier(amount: number): DamageFloatTier {
  if (amount <= 0) return "standard";
  if (amount <= 1) return "chip";
  if (amount <= 3) return "standard";
  if (amount <= 5) return "strong";
  if (amount <= 8) return "heavy";
  return "max";
}

function isPaper(e: EffectiveAction): boolean {
  return e === "PAPER_COUNTER" || e === "PAPER_EXHAUSTED";
}

function isRockRelease(e: EffectiveAction): boolean {
  return e === "ROCK_RELEASE_LV1" || e === "ROCK_RELEASE_LV2";
}

function isScissorsAttack(e: EffectiveAction): boolean {
  return e === "SCISSORS_ATTACK";
}

/**
 * When `victim` lost HP this resolve, infer accent from the other player's effective action.
 * If HP did not drop, returns neutral (callers may omit floats).
 */
export function getDamageFloatAccentForVictim(
  victim: PlayerId,
  prevState: GameState,
  nextState: GameState,
): DamageFloatAccent {
  if (getDamageTaken(prevState, nextState, victim) <= 0) return "neutral";

  const le = nextState.lastEffectiveActions;
  if (!le) return "neutral";

  const other: EffectiveAction = victim === "P1" ? le.p2 : le.p1;

  if (isScissorsAttack(other)) return "scissors";
  if (isRockRelease(other)) return "rock";
  if (other === "PAPER_COUNTER") return "paper";
  return "neutral";
}

export type TileLunge = "none" | "inward" | "inward-strong" | "inward-chip";

/** CSS module classes on `EffectiveTile` root (see globals.css). */
export function getEffectiveTileLungeClass(
  side: PlayerId,
  lunge: TileLunge,
): string {
  if (lunge === "none") return "";
  const d = side === "P1" ? "p1" : "p2";
  switch (lunge) {
    case "inward":
      return `combat-tile-lunge-${d}`;
    case "inward-strong":
      return `combat-tile-lunge-${d}-strong`;
    case "inward-chip":
      return `combat-tile-lunge-${d}-chip`;
    default:
      return "";
  }
}

/**
 * Card-like lunge toward clash center from P1 (left) or P2 (right) tile.
 * Uses resolved effective actions + animation class only; no damage math.
 */
export function getEffectiveTileLunge(
  side: PlayerId,
  animType: CombatAnimationType,
  nextState: GameState,
): TileLunge {
  const le = nextState.lastEffectiveActions;
  if (!le) return "none";

  const self = side === "P1" ? le.p1 : le.p2;
  const opp = side === "P1" ? le.p2 : le.p1;

  switch (animType) {
    case "SCISSORS_BEATS_PAPER": {
      if (isScissorsAttack(self) && isPaper(opp)) return "inward";
      if (isPaper(self) && isScissorsAttack(opp)) return "none";
      return "none";
    }
    case "PAPER_COUNTERS_ROCK": {
      if (self === "PAPER_COUNTER" && isRockRelease(opp)) return "inward-strong";
      if (isRockRelease(self) && opp === "PAPER_COUNTER") return "none";
      return "none";
    }
    case "ROCK_BEATS_SCISSORS": {
      if (isRockRelease(self) && isScissorsAttack(opp)) return "inward-strong";
      if (isScissorsAttack(self) && isRockRelease(opp)) return "none";
      return "none";
    }
    case "SCISSORS_CHIPS_ROCK_CHARGE": {
      if (isScissorsAttack(self)) return "inward-chip";
      return "none";
    }
    case "MIRROR_SCISSORS":
      return isScissorsAttack(self) ? "inward" : "none";
    case "MIRROR_ROCK":
      return self === "ROCK_START_CHARGE" ||
        self === "ROCK_HOLD_CHARGE" ||
        isRockRelease(self)
        ? "inward-strong"
        : "none";
    default:
      return "none";
  }
}
