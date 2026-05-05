import { describe, expect, it, vi } from "vitest";

import { getAvailableInputActions } from "@/game/actionAvailability";
import { chooseAiAction, type AiDifficulty } from "@/game/ai";
import { createInitialGameState } from "@/game/initialState";
import { resolveRound } from "@/game/resolveRound";
import type { GameState, InputAction } from "@/game/types";

const DUMMY_STAGGER_INPUT: InputAction = "ROCK";
const RNG_SEQ = [0.03, 0.27, 0.51, 0.74, 0.89, 0.12, 0.63, 0.95];

function choosePlayerAction(state: GameState["p1"]): InputAction {
  if (state.state === "STAGGERED") return DUMMY_STAGGER_INPUT;
  const legal = getAvailableInputActions(state.state);
  if (legal.length === 0) return DUMMY_STAGGER_INPUT;
  const idx = Math.floor(Math.random() * legal.length);
  return legal[idx] ?? legal[0];
}

function forceNextPickPhase(state: GameState): GameState {
  if (state.phase !== "ROUND_END") return state;
  return { ...state, phase: "P1_PICK" };
}

function runSimulatedMatch(
  difficulty: AiDifficulty,
  roundLimit = 220,
): { ended: boolean; rounds: number } {
  let game = createInitialGameState("P1_PICK");

  for (let i = 0; i < roundLimit; i += 1) {
    const p1Action = choosePlayerAction(game.p1);
    const aiAction = chooseAiAction(game, "P2", difficulty);
    const aiLegal = getAvailableInputActions(game.p2.state);
    if (game.p2.state === "STAGGERED") {
      expect(aiAction).toBe(DUMMY_STAGGER_INPUT);
    } else {
      expect(aiLegal).toContain(aiAction);
    }
    game = resolveRound(
      game,
      game.p1.state === "STAGGERED" ? DUMMY_STAGGER_INPUT : p1Action,
      game.p2.state === "STAGGERED" ? DUMMY_STAGGER_INPUT : aiAction,
    );
    if (game.phase === "GAME_OVER") {
      return { ended: true, rounds: i + 1 };
    }
    game = forceNextPickPhase(game);
  }

  return { ended: false, rounds: roundLimit };
}

describe("AI simulation safety", () => {
  it("EASY and NORMAL remain legal and stable over many repeated rounds", () => {
    let ptr = 0;
    const randomSpy = vi.spyOn(Math, "random").mockImplementation(() => {
      const out = RNG_SEQ[ptr % RNG_SEQ.length] ?? 0.5;
      ptr += 1;
      return out;
    });

    try {
      const easy = runSimulatedMatch("EASY", 220);
      const normal = runSimulatedMatch("NORMAL", 220);
      expect(easy.rounds).toBeGreaterThan(0);
      expect(normal.rounds).toBeGreaterThan(0);
    } finally {
      randomSpy.mockRestore();
    }
  });

  it("simulated matches can reach GAME_OVER under reasonable round limit", () => {
    let ptr = 0;
    const randomSpy = vi
      .spyOn(Math, "random")
      .mockImplementation(() => {
        const out = RNG_SEQ[ptr % RNG_SEQ.length] ?? 0.5;
        ptr += 1;
        return out;
      });

    try {
      const easy = runSimulatedMatch("EASY", 260);
      const normal = runSimulatedMatch("NORMAL", 260);
      expect(easy.ended).toBe(true);
      expect(normal.ended).toBe(true);
    } finally {
      randomSpy.mockRestore();
    }
  });
});
