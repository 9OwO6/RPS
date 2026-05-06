import { describe, expect, it } from "vitest";

import {
  getAvailableInputActionsForPlayer,
  isInputAllowed,
} from "@/game/actionAvailability";
import { createInitialPlayerSnapshot } from "@/game/initialState";
import { resolveRound } from "@/game/resolveRound";

describe("action availability streak rules", () => {
  it("disables Paper when paperStreak >= 2", () => {
    const p = createInitialPlayerSnapshot("P1");
    p.paperStreak = 2;
    const legal = getAvailableInputActionsForPlayer(p);
    expect(legal).not.toContain("PAPER");
    expect(isInputAllowed(p, "PAPER")).toBe(false);
  });

  it("paper becomes available again after non-Paper action", () => {
    const prev = {
      roundNumber: 1,
      phase: "ROUND_END" as const,
      p1: { ...createInitialPlayerSnapshot("P1"), paperStreak: 2 },
      p2: { ...createInitialPlayerSnapshot("P2") },
      logs: [],
    };
    const next = resolveRound(prev, "ROCK", "ROCK");
    expect(next.p1.paperStreak).toBe(0);
    expect(getAvailableInputActionsForPlayer(next.p1)).toContain("PAPER");
  });
});

