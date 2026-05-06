import {
  PAPER_COUNTER_DAMAGE,
  ROCK_LV1_DAMAGE,
  SCISSORS_CHIP_DAMAGE,
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
    lessonNumber: 1,
    startingGameState: tutorialBaseState({}),
    opponentAction: "PAPER",
    requiredPlayerAction: "SCISSORS",
    successCondition: (prev, next) =>
      next.p2.state === "STAGGERED" && prev.p2.hp - next.p2.hp > 0,
  },
  {
    id: "L2-rock-charge",
    lessonNumber: 2,
    startingGameState: tutorialBaseState({}),
    opponentAction: "PAPER",
    requiredPlayerAction: "ROCK",
    successCondition: (prev, next) =>
      prev.p1.state === "NORMAL" && next.p1.state === "CHARGING_LV1",
  },
  {
    id: "L3-rock-release",
    lessonNumber: 3,
    startingGameState: tutorialBaseState({
      p1: { state: "CHARGING_LV1" },
    }),
    opponentAction: "SCISSORS",
    requiredPlayerAction: "ROCK",
    successCondition: (prev, next) => {
      const released = next.lastEffectiveActions?.p1 === "ROCK_RELEASE_LV1";
      const dealt = prev.p2.hp - next.p2.hp === ROCK_LV1_DAMAGE;
      return released && dealt;
    },
  },
  {
    id: "L4-paper-vs-release",
    lessonNumber: 4,
    startingGameState: tutorialBaseState({
      p2: { state: "CHARGING_LV1" },
    }),
    opponentAction: "ROCK",
    requiredPlayerAction: "PAPER",
    successCondition: (prev, next) =>
      next.p2.state === "STAGGERED" &&
      prev.p2.hp - next.p2.hp === PAPER_COUNTER_DAMAGE,
  },
  {
    id: "L5-paper-vs-charge",
    lessonNumber: 5,
    startingGameState: tutorialBaseState({}),
    opponentAction: "ROCK",
    requiredPlayerAction: "PAPER",
    successCondition: (prev, next) =>
      prev.p2.state === "NORMAL" &&
      next.p2.state === "CHARGING_LV1" &&
      next.p1.state === "NORMAL" &&
      prev.p2.hp === next.p2.hp,
  },
  {
    id: "L6-scissors-chip",
    lessonNumber: 6,
    startingGameState: tutorialBaseState({}),
    opponentAction: "ROCK",
    requiredPlayerAction: "SCISSORS",
    successCondition: (prev, next) =>
      prev.p2.hp - next.p2.hp === SCISSORS_CHIP_DAMAGE &&
      next.p2.state === "CHARGING_LV1",
  },
  {
    id: "L7-paper-streak-risk",
    lessonNumber: 7,
    startingGameState: tutorialBaseState({
      p1: { paperStreak: 2 },
    }),
    opponentAction: "SCISSORS",
    requiredPlayerAction: "ROCK",
    successCondition: (prev, next) =>
      prev.p1.paperStreak === 2 &&
      next.p1.paperStreak === 0 &&
      next.lastEffectiveActions?.p1 !== "INVALID",
  },
  {
    id: "L8-third-scissors-rock",
    lessonNumber: 8,
    startingGameState: tutorialBaseState({
      p1: { scissorsStreak: 2 },
    }),
    opponentAction: "SCISSORS",
    requiredPlayerAction: "SCISSORS",
    successCondition: (_prev, next) =>
      next.lastEffectiveActions?.p1 === "ROCK_RELEASE_LV1",
  },
];

export const TUTORIAL_STEP_COUNT = TUTORIAL_STEPS.length;
