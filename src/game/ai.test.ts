import { describe, expect, it, vi } from "vitest";

import { getAvailableInputActions } from "@/game/actionAvailability";
import { chooseAiAction } from "@/game/ai";
import { createInitialGameState } from "@/game/initialState";
import type { GameState } from "@/game/types";

function withP2State(
  state: GameState["p2"]["state"],
  overrides?: Partial<GameState["p2"]>,
): GameState {
  const base = createInitialGameState("P1_PICK");
  return {
    ...base,
    p2: {
      ...base.p2,
      state,
      ...overrides,
    },
  };
}

describe("chooseAiAction", () => {
  it("EASY returns legal action for NORMAL", () => {
    const game = withP2State("NORMAL");
    const legal = getAvailableInputActions(game.p2.state);
    const action = chooseAiAction(game, "P2", "EASY");
    expect(legal).toContain(action);
  });

  it("NORMAL returns legal action for NORMAL", () => {
    const game = withP2State("NORMAL");
    const legal = getAvailableInputActions(game.p2.state);
    const action = chooseAiAction(game, "P2", "NORMAL");
    expect(legal).toContain(action);
  });

  it("does not throw across all player states", () => {
    const states: GameState["p2"]["state"][] = [
      "NORMAL",
      "CHARGING_LV1",
      "CHARGING_LV2",
      "STAGGERED",
    ];
    for (const state of states) {
      const game = withP2State(state);
      expect(() => chooseAiAction(game, "P2", "NORMAL")).not.toThrow();
    }
  });

  it("never returns HOLD when HOLD is not legal", () => {
    const game = withP2State("NORMAL");
    for (let i = 0; i < 80; i += 1) {
      expect(chooseAiAction(game, "P2", "NORMAL")).not.toBe("HOLD");
    }
  });

  it("handles STAGGERED with safe placeholder action", () => {
    const game = withP2State("STAGGERED");
    expect(chooseAiAction(game, "P2", "NORMAL")).toBe("ROCK");
  });

  it("respects CHARGING_LV2 legal actions", () => {
    const game = withP2State("CHARGING_LV2");
    const legal = getAvailableInputActions(game.p2.state);
    for (let i = 0; i < 80; i += 1) {
      expect(legal).toContain(chooseAiAction(game, "P2", "NORMAL"));
    }
  });

  it("does not require player's selected action input", () => {
    const game = withP2State("NORMAL", { paperStreak: 1 });
    game.p1PendingAction = "SCISSORS";
    const action = chooseAiAction(game, "P2", "NORMAL");
    expect(getAvailableInputActions(game.p2.state)).toContain(action);
  });

  it("difficulty changes strategy path without invalid output", () => {
    const game = withP2State("CHARGING_LV1");
    game.p1.state = "CHARGING_LV2";
    game.p1.paperStreak = 1;
    game.p1.scissorsStreak = 2;

    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0.75);
    try {
      const easyAction = chooseAiAction(game, "P2", "EASY");
      const normalAction = chooseAiAction(game, "P2", "NORMAL");
      const legal = getAvailableInputActions(game.p2.state);
      expect(legal).toContain(easyAction);
      expect(legal).toContain(normalAction);
      expect(easyAction).toBe("HOLD");
      expect(normalAction).toBe("PAPER");
    } finally {
      randomSpy.mockRestore();
    }
  });

  it("never chooses Paper when paperStreak >= 2", () => {
    const game = withP2State("NORMAL", { paperStreak: 2 });
    for (let i = 0; i < 120; i += 1) {
      const easy = chooseAiAction(game, "P2", "EASY");
      const normal = chooseAiAction(game, "P2", "NORMAL");
      expect(easy).not.toBe("PAPER");
      expect(normal).not.toBe("PAPER");
    }
  });
});
