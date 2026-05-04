import {
  PAPER_COUNTER_DAMAGE,
  ROCK_LV1_DAMAGE,
  SCISSORS_CHIP_DAMAGE,
  SCISSORS_PAPER_HEAT_DAMAGE,
} from "@/game/constants";
import { createInitialPlayerSnapshot } from "@/game/initialState";
import type { GameState } from "@/game/types";

import type { TutorialStep } from "@/tutorial/tutorialTypes";

function tutorialBaseState(overrides: {
  p1?: Partial<GameState["p1"]>;
  p2?: Partial<GameState["p2"]>;
  roundNumber?: number;
}): GameState {
  const p1 = { ...createInitialPlayerSnapshot("P1"), ...overrides.p1 };
  const p2 = { ...createInitialPlayerSnapshot("P2"), ...overrides.p2 };
  return {
    roundNumber: overrides.roundNumber ?? 1,
    phase: "ROUND_END",
    p1,
    p2,
    logs: [],
  };
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: "L1-scissors-paper",
    title: "Lesson 1: Scissors beats Paper",
    objective: "Commit Scissors while the training bot plays Paper.",
    explanation:
      "Scissors is a fast attack that beats Paper. When they clash, the Paper " +
      "player takes damage and is staggered.",
    startingGameState: tutorialBaseState({}),
    opponentAction: "PAPER",
    requiredPlayerAction: "SCISSORS",
    successCondition: (prev, next) =>
      next.p2.state === "STAGGERED" && prev.p2.hp - next.p2.hp > 0,
    successMessage: "Correct — Scissors cut through Paper and forced a stagger.",
    failureMessage:
      "Not quite. You need Scissors to beat their Paper and deal a staggering blow.",
  },
  {
    id: "L2-rock-charge",
    title: "Lesson 2: Rock starts charge",
    objective: "Commit Rock while the training bot plays Paper.",
    explanation:
      "Rock does not attack immediately. It starts charging. Paper meets a " +
      "charging Rock without countering—it only answers a Rock release.",
    startingGameState: tutorialBaseState({}),
    opponentAction: "PAPER",
    requiredPlayerAction: "ROCK",
    successCondition: (prev, next) =>
      prev.p1.state === "NORMAL" && next.p1.state === "CHARGING_LV1",
    successMessage: "Good — you began charging Rock while their Paper found nothing to counter.",
    failureMessage:
      "Try again with Rock so you enter the charge stance instead of clashing wrong.",
  },
  {
    id: "L3-rock-release",
    title: "Lesson 3: Release Rock Lv1",
    objective: "From charge level 1, commit Rock again to release.",
    explanation:
      "Once charged, Rock can be released. A released Rock overpowers an incoming Scissors.",
    startingGameState: tutorialBaseState({
      p1: { state: "CHARGING_LV1" },
    }),
    opponentAction: "SCISSORS",
    requiredPlayerAction: "ROCK",
    successCondition: (prev, next) => {
      const released =
        next.lastEffectiveActions?.p1 === "ROCK_RELEASE_LV1";
      const dealt =
        prev.p2.hp - next.p2.hp === ROCK_LV1_DAMAGE;
      return released && dealt;
    },
    successMessage:
      "Solid release — your Rock resolved as a level-one blast and connected for full damage.",
    failureMessage:
      "From CHARGING_LV1 you must commit Rock again to release. Match the training bot's Scissors timing.",
  },
  {
    id: "L4-paper-vs-release",
    title: "Lesson 4: Paper counters Rock release",
    objective: "Commit Paper while the bot releases Rock from charge level 1.",
    explanation:
      "Paper only counters the release moment of Rock. Here the bot is releasing—answer with Paper.",
    startingGameState: tutorialBaseState({
      p2: { state: "CHARGING_LV1" },
    }),
    opponentAction: "ROCK",
    requiredPlayerAction: "PAPER",
    successCondition: (prev, next) =>
      next.p2.state === "STAGGERED" &&
      prev.p2.hp - next.p2.hp === PAPER_COUNTER_DAMAGE,
    successMessage:
      "Perfect timing — Paper punished the Rock release for heavy damage and a stagger.",
    failureMessage:
      "Wait for the release and answer with Paper. You need the counter, not a different clash.",
  },
  {
    id: "L5-paper-vs-charge",
    title: "Lesson 5: Paper does not counter Rock charge",
    objective: "Commit Paper while the training bot starts Rock (still charging).",
    explanation:
      "Paper does not counter Rock charging. It only counters Rock release. " +
      "Here the bot is only starting their charge—you should not get a counter hit.",
    startingGameState: tutorialBaseState({}),
    opponentAction: "ROCK",
    requiredPlayerAction: "PAPER",
    successCondition: (prev, next) =>
      prev.p2.state === "NORMAL" &&
      next.p2.state === "CHARGING_LV1" &&
      next.p1.state === "NORMAL" &&
      prev.p2.hp === next.p2.hp,
    successMessage:
      "Right — their Rock completed into charge while your Paper dealt no counter damage.",
    failureMessage:
      "Use Paper against their Rock *start* so they finish charging without you countering.",
  },
  {
    id: "L6-scissors-chip",
    title: "Lesson 6: Scissors chips charging Rock",
    objective: "Commit Scissors while the training bot starts Rock.",
    explanation:
      "Scissors only deals chip damage against Rock charging, but the charge still completes.",
    startingGameState: tutorialBaseState({}),
    opponentAction: "ROCK",
    requiredPlayerAction: "SCISSORS",
    successCondition: (prev, next) =>
      prev.p2.hp - next.p2.hp === SCISSORS_CHIP_DAMAGE &&
      next.p2.state === "CHARGING_LV1",
    successMessage:
      "Exactly — a single point of chip damage and they still landed in CHARGING_LV1.",
    failureMessage:
      "Strike with Scissors into their Rock start: chip them and let the charge resolve.",
  },
  {
    id: "L7-paper-streak-risk",
    title: "Lesson 7: Consecutive Paper risk",
    objective:
      "With one Paper already on your record, commit Paper again into the bot's Scissors.",
    explanation:
      "Repeating Paper becomes risky. The second Paper loses harder to Scissors—expect heat damage and a stagger.",
    startingGameState: tutorialBaseState({
      p1: { paperStreak: 1 },
    }),
    opponentAction: "SCISSORS",
    requiredPlayerAction: "PAPER",
    successCondition: (prev, next) =>
      next.p1.state === "STAGGERED" &&
      prev.p1.hp - next.p1.hp === SCISSORS_PAPER_HEAT_DAMAGE,
    successMessage:
      "You felt the heat — second Paper into Scissors punished you for 5 and staggered.",
    failureMessage:
      "Commit Paper again from a 1-streak into their Scissors to see the paper-streak penalty.",
  },
  {
    id: "L8-third-scissors-rock",
    title: "Lesson 8: Third Scissors becomes Rock",
    objective:
      "With two prior Scissors on your record, commit Scissors again (same as the bot).",
    explanation:
      "The third consecutive Scissors automatically becomes a Rock release. " +
      "The training bot mirrors Scissors—you will convert while they stay on Scissors.",
    startingGameState: tutorialBaseState({
      p1: { scissorsStreak: 2 },
    }),
    opponentAction: "SCISSORS",
    requiredPlayerAction: "SCISSORS",
    successCondition: (_prev, next) =>
      next.lastEffectiveActions?.p1 === "ROCK_RELEASE_LV1",
    successMessage:
      "There it is — your third Scissors resolved as a Rock release instead of another snip.",
    failureMessage:
      "From two Scissors streak, commit Scissors once more so the rule converts it to Rock release.",
  },
];

export const TUTORIAL_STEP_COUNT = TUTORIAL_STEPS.length;
