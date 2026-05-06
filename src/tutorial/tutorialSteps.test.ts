import { describe, expect, it } from "vitest";

import { getActionCardViewModel } from "@/components/actionCardViewModel";
import { getAvailableInputActionsForPlayer } from "@/game/actionAvailability";
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

  it("lesson 7 starts with Paper locked", () => {
    const l7 = TUTORIAL_STEPS.find((s) => s.lessonNumber === 7);
    expect(l7).toBeDefined();
    if (!l7) return;
    expect(l7.startingGameState.p1.paperStreak).toBe(2);
    expect(getAvailableInputActionsForPlayer(l7.startingGameState.p1)).not.toContain(
      "PAPER",
    );
  });

  it("lesson 8 displays transformed Scissors card as Rock release", () => {
    const l8 = TUTORIAL_STEPS.find((s) => s.lessonNumber === 8);
    expect(l8).toBeDefined();
    if (!l8) return;
    const vm = getActionCardViewModel(l8.startingGameState.p1, "SCISSORS");
    expect(vm.displayKind).toBe("forcedRockLv1");
    expect(vm.displayAction).toBe("ROCK");
  });
});
