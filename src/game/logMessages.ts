import type { EffectiveAction, InputAction, PlayerId } from "./types";

export function roundHeader(roundNumber: number): string {
  return `Round ${roundNumber}:`;
}

export function invalidActionLine(
  player: PlayerId,
  input: InputAction,
  stateLabel: string,
): string {
  return `${player} attempted ${input} while ${stateLabel}; the action is invalid and has no effect.`;
}

export function describeEffectiveAction(
  player: PlayerId,
  effective: EffectiveAction,
): string {
  switch (effective) {
    case "SCISSORS_ATTACK":
      return `${player} used Scissors.`;
    case "PAPER_COUNTER":
      return `${player} used Paper (Counter).`;
    case "PAPER_EXHAUSTED":
      return `${player} used Paper (Exhausted).`;
    case "ROCK_START_CHARGE":
      return `${player} started charging Rock (Lv1).`;
    case "ROCK_HOLD_CHARGE":
      return `${player} continued charging Rock (Lv2).`;
    case "ROCK_RELEASE_LV1":
      return `${player} released Rock Lv1.`;
    case "ROCK_RELEASE_LV2":
      return `${player} released Rock Lv2.`;
    case "STUNNED_SKIP":
      return `${player} is staggered and skips this round.`;
    case "INVALID":
      return `${player} has no valid action this round.`;
    default: {
      const _e: never = effective;
      return _e;
    }
  }
}

export function scissorsBeatsPaper(
  attacker: PlayerId,
  defender: PlayerId,
  damage: number,
): string {
  return `Scissors from ${attacker} beats Paper from ${defender}. ${defender} takes ${damage} damage and is staggered.`;
}

export function paperCountersRockRelease(
  attacker: PlayerId,
  defender: PlayerId,
): string {
  return `Paper from ${attacker} counters ${defender}'s Rock release. ${defender} takes 10 damage and is staggered.`;
}

export function paperExhaustedVsRockRelease(
  defender: PlayerId,
  damage: number,
): string {
  return `Exhausted Paper from ${defender} fails to counter Rock release. ${defender} takes ${damage} damage.`;
}

export function rockReleaseBeatsScissors(
  rockPlayer: PlayerId,
  scissorsPlayer: PlayerId,
  damage: number,
): string {
  return `Rock release from ${rockPlayer} beats Scissors from ${scissorsPlayer}. ${scissorsPlayer} takes ${damage} damage.`;
}

export function scissorsChipsRockCharge(
  scissorsPlayer: PlayerId,
  rockPlayer: PlayerId,
): string {
  return `Scissors from ${scissorsPlayer} chips ${rockPlayer} during Rock charging for 1 damage; charging continues.`;
}

export function mirrorScissors(): string {
  return "Both players used Scissors; each takes 3 damage.";
}

export function mirrorPaper(): string {
  return "Both players used Paper variants; neither scores a Rock counter, so nothing happens.";
}

export function mirrorRockReleaseSameLevel(level: 1 | 2, damage: number): string {
  return `Both players released Rock Lv${level}; each takes ${damage} damage.`;
}

export function mirrorRockReleaseMixed(): string {
  return "Both players released Rock (Lv1 vs Lv2); the Lv1 player takes 8 damage and the Lv2 player takes 6 damage.";
}

export function mirrorRockStartCharge(): string {
  return "Both players started charging Rock; each reaches charging Lv1.";
}

export function mirrorRockHoldCharge(): string {
  return "Both players held Rock charge; each reaches charging Lv2.";
}
