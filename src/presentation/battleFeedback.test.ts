import { describe, expect, it } from "vitest";

import { createInitialGameState } from "@/game/initialState";
import { resolveRound } from "@/game/resolveRound";

import {
  didPlayerBecomeStaggered,
  getBattleFeedback,
  getDamageTaken,
} from "@/presentation/battleFeedback";

describe("battleFeedback", () => {
  it("derives damage only from HP delta", () => {
    const prev = createInitialGameState("ROUND_END");
    const next = resolveRound(prev, "SCISSORS", "PAPER");
    expect(getDamageTaken(prev, next, "P2")).toBeGreaterThan(0);
    expect(getDamageTaken(prev, next, "P1")).toBe(0);
    const fb = getBattleFeedback(prev, next);
    expect(fb.p2Hit).toBe(true);
    expect(fb.p1Hit).toBe(false);
    expect(didPlayerBecomeStaggered(prev, next, "P2")).toBe(true);
    expect(didPlayerBecomeStaggered(prev, next, "P1")).toBe(false);
  });
});
