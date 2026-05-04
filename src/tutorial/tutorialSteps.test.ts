import { describe, expect, it } from "vitest";

import { TUTORIAL_STEPS } from "@/tutorial/tutorialSteps";
import { cloneGameState, resolveTutorialRound } from "@/tutorial/tutorialState";

describe("tutorial golden path", () => {
  it.each(
    TUTORIAL_STEPS.map((step, index) => ({
      index,
      id: step.id,
      step,
    })),
  )("lesson $index $id clears with required maneuver", ({ step }) => {
    const prev = cloneGameState(step.startingGameState);
    const next = resolveTutorialRound(
      prev,
      step.requiredPlayerAction,
      step.opponentAction,
    );
    expect(step.successCondition(prev, next)).toBe(true);
  });
});
