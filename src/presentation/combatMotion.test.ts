import { describe, expect, it } from "vitest";

import { createInitialGameState } from "@/game/initialState";
import { resolveRound } from "@/game/resolveRound";

import { getCombatAnimationType } from "@/presentation/combatAnimation";
import {
  getDamageFloatAccentForVictim,
  getDamageFloatTier,
  getEffectiveTileLunge,
} from "@/presentation/combatMotion";

describe("combatMotion", () => {
  it("getDamageFloatTier maps HP deltas to presentation tiers", () => {
    expect(getDamageFloatTier(1)).toBe("chip");
    expect(getDamageFloatTier(3)).toBe("standard");
    expect(getDamageFloatTier(5)).toBe("strong");
    expect(getDamageFloatTier(6)).toBe("heavy");
    expect(getDamageFloatTier(10)).toBe("max");
  });

  it("getDamageFloatAccentForVictim reads opponent effective action", () => {
    const prev = createInitialGameState("ROUND_END");
    const next = resolveRound(prev, "SCISSORS", "PAPER");
    expect(getDamageFloatAccentForVictim("P2", prev, next)).toBe("scissors");
    expect(getDamageFloatAccentForVictim("P1", prev, next)).toBe("neutral");
  });

  it("getEffectiveTileLunge marks scissors attacker on cut-through", () => {
    const prev = createInitialGameState("ROUND_END");
    const next = resolveRound(prev, "SCISSORS", "PAPER");
    const anim = getCombatAnimationType(prev, next);
    expect(anim).toBe("SCISSORS_BEATS_PAPER");
    expect(getEffectiveTileLunge("P1", anim, next)).toBe("inward");
    expect(getEffectiveTileLunge("P2", anim, next)).toBe("none");
  });
});
