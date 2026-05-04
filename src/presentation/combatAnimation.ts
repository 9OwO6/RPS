import { ASSETS } from "@/lib/assetPaths";
import type { EffectiveAction, GameState } from "@/game/types";

export type CombatAnimationType =
  | "SCISSORS_BEATS_PAPER"
  | "PAPER_COUNTERS_ROCK"
  | "ROCK_BEATS_SCISSORS"
  | "SCISSORS_CHIPS_ROCK_CHARGE"
  | "ROCK_CHARGE"
  | "ROCK_HOLD"
  | "MIRROR_SCISSORS"
  | "MIRROR_ROCK"
  | "NEUTRAL"
  | "STAGGER_SKIP"
  | "INVALID";

function isPaper(e: EffectiveAction): boolean {
  return e === "PAPER_COUNTER" || e === "PAPER_EXHAUSTED";
}

function isRockRelease(e: EffectiveAction): boolean {
  return e === "ROCK_RELEASE_LV1" || e === "ROCK_RELEASE_LV2";
}

function isRockCharge(e: EffectiveAction): boolean {
  return e === "ROCK_START_CHARGE" || e === "ROCK_HOLD_CHARGE";
}

function isScissorsAttack(e: EffectiveAction): boolean {
  return e === "SCISSORS_ATTACK";
}

function isPassive(e: EffectiveAction): boolean {
  return e === "INVALID" || e === "STUNNED_SKIP";
}

/**
 * Classifies a presentation-only combat animation from resolved effective actions.
 * Does not compute damage; pairs are matched in priority order for display.
 */
export function getCombatAnimationType(
  _prevState: GameState,
  nextState: GameState,
): CombatAnimationType {
  const le = nextState.lastEffectiveActions;
  if (!le) return "NEUTRAL";

  const p1 = le.p1;
  const p2 = le.p2;

  if (p1 === "INVALID" || p2 === "INVALID") return "INVALID";
  if (p1 === "STUNNED_SKIP" || p2 === "STUNNED_SKIP") return "STAGGER_SKIP";

  if (isScissorsAttack(p1) && isScissorsAttack(p2)) return "MIRROR_SCISSORS";

  if (isRockRelease(p1) && isRockRelease(p2)) return "MIRROR_ROCK";
  if (p1 === "ROCK_START_CHARGE" && p2 === "ROCK_START_CHARGE")
    return "MIRROR_ROCK";
  if (p1 === "ROCK_HOLD_CHARGE" && p2 === "ROCK_HOLD_CHARGE")
    return "MIRROR_ROCK";

  if (
    (isScissorsAttack(p1) && isPaper(p2)) ||
    (isPaper(p1) && isScissorsAttack(p2))
  ) {
    return "SCISSORS_BEATS_PAPER";
  }

  if (
    (p1 === "PAPER_COUNTER" && isRockRelease(p2)) ||
    (p2 === "PAPER_COUNTER" && isRockRelease(p1))
  ) {
    return "PAPER_COUNTERS_ROCK";
  }

  if (
    (isRockRelease(p1) && isScissorsAttack(p2)) ||
    (isRockRelease(p2) && isScissorsAttack(p1))
  ) {
    return "ROCK_BEATS_SCISSORS";
  }

  if (
    (isScissorsAttack(p1) && isRockCharge(p2)) ||
    (isRockCharge(p1) && isScissorsAttack(p2))
  ) {
    return "SCISSORS_CHIPS_ROCK_CHARGE";
  }

  if (
    (isPaper(p1) && isRockCharge(p2)) ||
    (isRockCharge(p1) && isPaper(p2))
  ) {
    return "NEUTRAL";
  }

  if (
    (isRockRelease(p1) && isRockCharge(p2)) ||
    (isRockRelease(p2) && isRockCharge(p1))
  ) {
    return "NEUTRAL";
  }

  if (
    (p1 === "ROCK_START_CHARGE" && p2 === "ROCK_HOLD_CHARGE") ||
    (p2 === "ROCK_START_CHARGE" && p1 === "ROCK_HOLD_CHARGE")
  ) {
    return "NEUTRAL";
  }

  if (p1 === "ROCK_HOLD_CHARGE" || p2 === "ROCK_HOLD_CHARGE") {
    return "ROCK_HOLD";
  }

  if (p1 === "ROCK_START_CHARGE" || p2 === "ROCK_START_CHARGE") {
    return "ROCK_CHARGE";
  }

  if (isPaper(p1) && isPaper(p2)) return "NEUTRAL";

  if (isPassive(p1) && isPassive(p2)) return "NEUTRAL";

  return "NEUTRAL";
}

export function getEffectiveActionLabel(action: EffectiveAction): string {
  switch (action) {
    case "SCISSORS_ATTACK":
      return "Scissors";
    case "PAPER_COUNTER":
      return "Paper (counter)";
    case "PAPER_EXHAUSTED":
      return "Paper (exhausted)";
    case "ROCK_START_CHARGE":
      return "Rock · charge start";
    case "ROCK_HOLD_CHARGE":
      return "Rock · hold charge";
    case "ROCK_RELEASE_LV1":
      return "Rock · release Lv1";
    case "ROCK_RELEASE_LV2":
      return "Rock · release Lv2";
    case "STUNNED_SKIP":
      return "Staggered skip";
    case "INVALID":
      return "Invalid";
    default: {
      const _e: never = action;
      return _e;
    }
  }
}

/** Icon path for effective action, or null when a text badge should be used instead. */
export function getActionIconPathFromEffectiveAction(
  action: EffectiveAction,
): string | null {
  switch (action) {
    case "SCISSORS_ATTACK":
      return ASSETS.actions.SCISSORS;
    case "PAPER_COUNTER":
    case "PAPER_EXHAUSTED":
      return ASSETS.actions.PAPER;
    case "ROCK_START_CHARGE":
    case "ROCK_HOLD_CHARGE":
    case "ROCK_RELEASE_LV1":
    case "ROCK_RELEASE_LV2":
      return ASSETS.actions.ROCK;
    case "STUNNED_SKIP":
    case "INVALID":
      return null;
    default: {
      const _e: never = action;
      return _e;
    }
  }
}

export function getCombatCaption(type: CombatAnimationType): string {
  switch (type) {
    case "SCISSORS_BEATS_PAPER":
      return "Scissors cuts through Paper.";
    case "PAPER_COUNTERS_ROCK":
      return "Paper counters the Rock release.";
    case "ROCK_BEATS_SCISSORS":
      return "Rock release smashes Scissors.";
    case "SCISSORS_CHIPS_ROCK_CHARGE":
      return "Scissors chips the charge — only a scratch.";
    case "ROCK_CHARGE":
      return "Rock gathers power.";
    case "ROCK_HOLD":
      return "Rock charge deepens.";
    case "MIRROR_SCISSORS":
      return "Blades cross — mirrored Scissors.";
    case "MIRROR_ROCK":
      return "Stone meets stone — heavy clash.";
    case "STAGGER_SKIP":
      return "A fighter is staggered and yields the beat.";
    case "INVALID":
      return "A line was broken — invalid stance.";
    case "NEUTRAL":
      return "The exchange settles without a decisive strike.";
  }
}
