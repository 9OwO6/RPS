import { isInputAllowed } from "./actionAvailability";
import {
  PAPER_COUNTER_DAMAGE,
  ROCK_LV1_DAMAGE,
  ROCK_LV2_DAMAGE,
  SCISSORS_CHIP_DAMAGE,
  SCISSORS_DAMAGE,
  SCISSORS_PAPER_HEAT_DAMAGE,
} from "./constants";
import {
  describeEffectiveAction,
  invalidActionLine,
  mirrorPaper,
  mirrorRockHoldCharge,
  mirrorRockReleaseMixed,
  mirrorRockReleaseSameLevel,
  mirrorRockStartCharge,
  mirrorScissors,
  paperCountersRockRelease,
  paperExhaustedVsRockRelease,
  rockReleaseBeatsScissors,
  roundHeader,
  scissorsBeatsPaper,
  scissorsChipsRockCharge,
} from "./logMessages";
import type {
  EffectiveAction,
  GameState,
  InputAction,
  PlayerSnapshot,
  PlayerState,
  RoundLog,
} from "./types";

type PreparedPlayer = Readonly<{
  stateBefore: PlayerState;
  input: InputAction;
  effective: EffectiveAction;
  nextPaperStreak: number;
  nextScissorsStreak: number;
}>;

interface FightLedger {
  p1HpDelta: number;
  p2HpDelta: number;
  p1Stagger: boolean;
  p2Stagger: boolean;
  messages: string[];
}

export function resolveRound(
  previous: GameState,
  p1Input: InputAction,
  p2Input: InputAction,
): GameState {
  if (previous.phase === "GAME_OVER") {
    return { ...previous, p1: { ...previous.p1 }, p2: { ...previous.p2 }, logs: [...previous.logs] };
  }

  const completedRoundLabel = previous.roundNumber;
  const messages: string[] = [roundHeader(completedRoundLabel)];

  const p1Prep = preparePlayer(previous.p1, p1Input, "P1", messages);
  const p2Prep = preparePlayer(previous.p2, p2Input, "P2", messages);

  if (p1Prep.effective !== "INVALID") {
    messages.push(describeEffectiveAction("P1", p1Prep.effective));
  }
  if (p2Prep.effective !== "INVALID") {
    messages.push(describeEffectiveAction("P2", p2Prep.effective));
  }

  const fight = resolveCombatEffects(
    p1Prep.effective,
    p2Prep.effective,
    p1Prep.nextPaperStreak,
    p2Prep.nextPaperStreak,
  );
  messages.push(...fight.messages);

  let p1Hp = previous.p1.hp - fight.p1HpDelta;
  let p2Hp = previous.p2.hp - fight.p2HpDelta;
  p1Hp = Math.max(0, p1Hp);
  p2Hp = Math.max(0, p2Hp);

  const p1FinalState = finalizePlayerState({
    snapshot: previous.p1,
    prep: p1Prep,
    staggerApplied: fight.p1Stagger,
  });
  const p2FinalState = finalizePlayerState({
    snapshot: previous.p2,
    prep: p2Prep,
    staggerApplied: fight.p2Stagger,
  });

  const winner = resolveWinner(p1Hp, p2Hp);
  const phase = winner === undefined ? ("ROUND_END" as const) : ("GAME_OVER" as const);

  const freshLog: RoundLog = { round: completedRoundLabel, messages };

  const baseResolved: Omit<GameState, "winner"> = {
    roundNumber: previous.roundNumber + 1,
    phase,
    p1: {
      ...previous.p1,
      hp: p1Hp,
      state: p1FinalState,
      paperStreak: p1Prep.nextPaperStreak,
      scissorsStreak: p1Prep.nextScissorsStreak,
    },
    p2: {
      ...previous.p2,
      hp: p2Hp,
      state: p2FinalState,
      paperStreak: p2Prep.nextPaperStreak,
      scissorsStreak: p2Prep.nextScissorsStreak,
    },
    lastEffectiveActions: { p1: p1Prep.effective, p2: p2Prep.effective },
    logs: [...previous.logs, freshLog],
  };

  return winner === undefined ? baseResolved : { ...baseResolved, winner };
}

function preparePlayer(
  snap: PlayerSnapshot,
  input: InputAction,
  playerId: "P1" | "P2",
  messages: string[],
): PreparedPlayer {
  const stateBefore = snap.state;

  if (stateBefore === "STAGGERED") {
    return {
      stateBefore,
      input,
      effective: "STUNNED_SKIP",
      nextPaperStreak: 0,
      nextScissorsStreak: 0,
    };
  }

  if (!isInputAllowed({ state: stateBefore, paperStreak: snap.paperStreak }, input)) {
    messages.push(
      invalidActionLine(playerId, input, describeStateLabel(stateBefore)),
    );
    return {
      stateBefore,
      input,
      effective: "INVALID",
      nextPaperStreak: 0,
      nextScissorsStreak: 0,
    };
  }

  let effective = mapInputToEffectiveAction(stateBefore, input);
  let nextPaperStreak = snap.paperStreak;
  let nextScissorsStreak = snap.scissorsStreak;

  if (input === "PAPER") {
    nextPaperStreak = snap.paperStreak + 1;
    nextScissorsStreak = 0;
  } else if (input === "SCISSORS") {
    nextScissorsStreak = snap.scissorsStreak + 1;
    nextPaperStreak = 0;
    if (nextScissorsStreak === 3) {
      effective = "ROCK_RELEASE_LV1";
      nextScissorsStreak = 0;
    }
  } else {
    nextPaperStreak = 0;
    nextScissorsStreak = 0;
  }

  return { stateBefore, input, effective, nextPaperStreak, nextScissorsStreak };
}

function describeStateLabel(state: PlayerState): string {
  switch (state) {
    case "NORMAL":
      return "NORMAL";
    case "CHARGING_LV1":
      return "CHARGING_LV1";
    case "CHARGING_LV2":
      return "CHARGING_LV2";
    case "STAGGERED":
      return "STAGGERED";
    default: {
      const _e: never = state;
      return _e;
    }
  }
}

function mapInputToEffectiveAction(state: PlayerState, input: InputAction): EffectiveAction {
  switch (state) {
    case "NORMAL": {
      if (input === "SCISSORS") return "SCISSORS_ATTACK";
      if (input === "ROCK") return "ROCK_START_CHARGE";
      if (input === "PAPER") return "PAPER_COUNTER";
      return "INVALID";
    }
    case "CHARGING_LV1": {
      if (input === "SCISSORS") return "SCISSORS_ATTACK";
      if (input === "ROCK") return "ROCK_RELEASE_LV1";
      if (input === "PAPER") return "PAPER_COUNTER";
      if (input === "HOLD") return "ROCK_HOLD_CHARGE";
      return "INVALID";
    }
    case "CHARGING_LV2": {
      if (input === "ROCK") return "ROCK_RELEASE_LV2";
      if (input === "PAPER") return "PAPER_COUNTER";
      return "INVALID";
    }
    case "STAGGERED":
      return "STUNNED_SKIP";
    default: {
      const _ex: never = state;
      return _ex;
    }
  }
}

function finalizePlayerState(opts: {
  snapshot: PlayerSnapshot;
  prep: PreparedPlayer;
  staggerApplied: boolean;
}): PlayerState {
  const { snapshot, prep, staggerApplied } = opts;

  if (staggerApplied) {
    return "STAGGERED";
  }

  const { effective } = prep;

  if (effective === "STUNNED_SKIP") {
    return "NORMAL";
  }

  if (effective === "INVALID") {
    return snapshot.state;
  }

  switch (effective) {
    case "ROCK_START_CHARGE":
      return "CHARGING_LV1";
    case "ROCK_HOLD_CHARGE":
      return "CHARGING_LV2";
    case "ROCK_RELEASE_LV1":
    case "ROCK_RELEASE_LV2":
    case "PAPER_COUNTER":
    case "PAPER_EXHAUSTED":
    case "SCISSORS_ATTACK":
      return "NORMAL";
    default: {
      const _e: never = effective;
      return _e;
    }
  }
}

function resolveWinner(
  p1Hp: number,
  p2Hp: number,
): GameState["winner"] | undefined {
  const p1Down = p1Hp <= 0;
  const p2Down = p2Hp <= 0;
  if (!p1Down && !p2Down) return undefined;
  if (p1Down && p2Down) return "DRAW";
  if (p1Down) return "P2";
  return "P1";
}

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

function isPassiveOutgoing(e: EffectiveAction): boolean {
  return e === "INVALID" || e === "STUNNED_SKIP";
}

function rockReleaseDamage(e: EffectiveAction): number {
  return e === "ROCK_RELEASE_LV1" ? ROCK_LV1_DAMAGE : ROCK_LV2_DAMAGE;
}

function scissorsDamageVsPaper(
  defenderPaper: EffectiveAction,
  defenderNewPaperStreak: number,
): number {
  if (defenderPaper === "PAPER_EXHAUSTED") return SCISSORS_PAPER_HEAT_DAMAGE;
  if (defenderNewPaperStreak >= 2) return SCISSORS_PAPER_HEAT_DAMAGE;
  return SCISSORS_DAMAGE;
}

function resolveCombatEffects(
  e1: EffectiveAction,
  e2: EffectiveAction,
  p1NewPaper: number,
  p2NewPaper: number,
): FightLedger {
  const ledger: FightLedger = {
    p1HpDelta: 0,
    p2HpDelta: 0,
    p1Stagger: false,
    p2Stagger: false,
    messages: [],
  };

  // 1) Symmetric scissors
  if (isScissorsAttack(e1) && isScissorsAttack(e2)) {
    ledger.p1HpDelta += SCISSORS_DAMAGE;
    ledger.p2HpDelta += SCISSORS_DAMAGE;
    ledger.messages.push(mirrorScissors());
    return ledger;
  }

  // 2) Both paper variants (no Rock release involved on either side)
  if (isPaper(e1) && isPaper(e2)) {
    ledger.messages.push(mirrorPaper());
    return ledger;
  }

  // 3) Symmetric rock releases
  if (isRockRelease(e1) && isRockRelease(e2)) {
    if (e1 === e2) {
      const dmg = rockReleaseDamage(e1);
      ledger.p1HpDelta += dmg;
      ledger.p2HpDelta += dmg;
      const lvl = e1 === "ROCK_RELEASE_LV1" ? 1 : 2;
      ledger.messages.push(mirrorRockReleaseSameLevel(lvl, dmg));
      return ledger;
    }
    ledger.p1HpDelta += ROCK_LV2_DAMAGE;
    ledger.p2HpDelta += ROCK_LV1_DAMAGE;
    ledger.messages.push(mirrorRockReleaseMixed());
    return ledger;
  }

  // 4) Symmetric rock starts
  if (e1 === "ROCK_START_CHARGE" && e2 === "ROCK_START_CHARGE") {
    ledger.messages.push(mirrorRockStartCharge());
    return ledger;
  }

  // 5) Symmetric rock holds
  if (e1 === "ROCK_HOLD_CHARGE" && e2 === "ROCK_HOLD_CHARGE") {
    ledger.messages.push(mirrorRockHoldCharge());
    return ledger;
  }

  // 6) Rock start vs hold (neutral)
  if (
    (e1 === "ROCK_START_CHARGE" && e2 === "ROCK_HOLD_CHARGE") ||
    (e1 === "ROCK_HOLD_CHARGE" && e2 === "ROCK_START_CHARGE")
  ) {
    ledger.messages.push(
      "One player started charging while the other held charge; no damage is dealt.",
    );
    return ledger;
  }

  // 7) Paper counter beats rock release
  if (e1 === "PAPER_COUNTER" && isRockRelease(e2)) {
    ledger.p2HpDelta += PAPER_COUNTER_DAMAGE;
    ledger.p2Stagger = true;
    ledger.messages.push(paperCountersRockRelease("P1", "P2"));
    return ledger;
  }
  if (e2 === "PAPER_COUNTER" && isRockRelease(e1)) {
    ledger.p1HpDelta += PAPER_COUNTER_DAMAGE;
    ledger.p1Stagger = true;
    ledger.messages.push(paperCountersRockRelease("P2", "P1"));
    return ledger;
  }

  // 8) Exhausted paper fails vs rock release
  if (e1 === "PAPER_EXHAUSTED" && isRockRelease(e2)) {
    const dmg = rockReleaseDamage(e2);
    ledger.p1HpDelta += dmg;
    ledger.messages.push(paperExhaustedVsRockRelease("P1", dmg));
    return ledger;
  }
  if (e2 === "PAPER_EXHAUSTED" && isRockRelease(e1)) {
    const dmg = rockReleaseDamage(e1);
    ledger.p2HpDelta += dmg;
    ledger.messages.push(paperExhaustedVsRockRelease("P2", dmg));
    return ledger;
  }

  // 9) Rock release beats scissors
  if (isRockRelease(e1) && isScissorsAttack(e2)) {
    const dmg = rockReleaseDamage(e1);
    ledger.p2HpDelta += dmg;
    ledger.messages.push(rockReleaseBeatsScissors("P1", "P2", dmg));
    return ledger;
  }
  if (isRockRelease(e2) && isScissorsAttack(e1)) {
    const dmg = rockReleaseDamage(e2);
    ledger.p1HpDelta += dmg;
    ledger.messages.push(rockReleaseBeatsScissors("P2", "P1", dmg));
    return ledger;
  }

  // 10) Scissors beats paper
  if (isScissorsAttack(e1) && isPaper(e2)) {
    const dmg = scissorsDamageVsPaper(e2, p2NewPaper);
    ledger.p2HpDelta += dmg;
    ledger.p2Stagger = true;
    ledger.messages.push(scissorsBeatsPaper("P1", "P2", dmg));
    return ledger;
  }
  if (isScissorsAttack(e2) && isPaper(e1)) {
    const dmg = scissorsDamageVsPaper(e1, p1NewPaper);
    ledger.p1HpDelta += dmg;
    ledger.p1Stagger = true;
    ledger.messages.push(scissorsBeatsPaper("P2", "P1", dmg));
    return ledger;
  }

  // 11) Scissors chips rock charging
  if (isScissorsAttack(e1) && isRockCharge(e2)) {
    ledger.p2HpDelta += SCISSORS_CHIP_DAMAGE;
    ledger.messages.push(scissorsChipsRockCharge("P1", "P2"));
    return ledger;
  }
  if (isScissorsAttack(e2) && isRockCharge(e1)) {
    ledger.p1HpDelta += SCISSORS_CHIP_DAMAGE;
    ledger.messages.push(scissorsChipsRockCharge("P2", "P1"));
    return ledger;
  }

  // 12) Paper variants vs rock charging (neutral)
  if (isPaper(e1) && isRockCharge(e2)) {
    ledger.messages.push("Paper clashes with charging Rock; no damage is dealt and charging completes.");
    return ledger;
  }
  if (isPaper(e2) && isRockCharge(e1)) {
    ledger.messages.push("Paper clashes with charging Rock; no damage is dealt and charging completes.");
    return ledger;
  }

  // 13) Rock release vs rock charging
  if (isRockRelease(e1) && isRockCharge(e2)) {
    ledger.p2HpDelta += rockReleaseDamage(e1);
    ledger.messages.push(
      "Rock release hits an opponent while they charge; the charging player takes full Rock damage and still completes charging.",
    );
    return ledger;
  }
  if (isRockRelease(e2) && isRockCharge(e1)) {
    ledger.p1HpDelta += rockReleaseDamage(e2);
    ledger.messages.push(
      "Rock release hits an opponent while they charge; the charging player takes full Rock damage and still completes charging.",
    );
    return ledger;
  }

  // 14) Rock release vs passive (INVALID / STUNNED_SKIP)
  if (isRockRelease(e1) && isPassiveOutgoing(e2)) {
    ledger.p2HpDelta += rockReleaseDamage(e1);
    ledger.messages.push(
      "Rock release hits a passive opponent; P2 takes damage.",
    );
    return ledger;
  }
  if (isRockRelease(e2) && isPassiveOutgoing(e1)) {
    ledger.p1HpDelta += rockReleaseDamage(e2);
    ledger.messages.push(
      "Rock release hits a passive opponent; P1 takes damage.",
    );
    return ledger;
  }

  // 15) Scissors vs passive
  if (isScissorsAttack(e1) && isPassiveOutgoing(e2)) {
    ledger.p2HpDelta += SCISSORS_DAMAGE;
    ledger.messages.push("Scissors hits a passive opponent; P2 takes 3 damage.");
    return ledger;
  }
  if (isScissorsAttack(e2) && isPassiveOutgoing(e1)) {
    ledger.p1HpDelta += SCISSORS_DAMAGE;
    ledger.messages.push("Scissors hits a passive opponent; P1 takes 3 damage.");
    return ledger;
  }

  // 16) Rock charging vs passive
  if (isRockCharge(e1) && isPassiveOutgoing(e2)) {
    ledger.messages.push(
      "A player charges Rock while the opponent cannot attack; no damage is dealt.",
    );
    return ledger;
  }
  if (isRockCharge(e2) && isPassiveOutgoing(e1)) {
    ledger.messages.push(
      "A player charges Rock while the opponent cannot attack; no damage is dealt.",
    );
    return ledger;
  }

  // 17) Paper vs passive
  if (isPaper(e1) && isPassiveOutgoing(e2)) {
    ledger.messages.push(
      "Paper finds no Rock release to counter; no damage is dealt.",
    );
    return ledger;
  }
  if (isPaper(e2) && isPassiveOutgoing(e1)) {
    ledger.messages.push(
      "Paper finds no Rock release to counter; no damage is dealt.",
    );
    return ledger;
  }

  // 18) Passive vs passive
  if (isPassiveOutgoing(e1) && isPassiveOutgoing(e2)) {
    ledger.messages.push("Both sides are passive; nothing happens.");
    return ledger;
  }

  ledger.messages.push("No impactful interaction occurs this round.");

  return ledger;
}
