import { describe, expect, it } from "vitest";
import { INITIAL_HP, ROCK_LV1_DAMAGE, ROCK_LV2_DAMAGE } from "./constants";
import { createInitialGameState } from "./initialState";
import { resolveRound } from "./resolveRound";
import type { GameState, PlayerSnapshot } from "./types";

function cloneState(state: GameState): GameState {
  return structuredClone(state) as GameState;
}

function withPlayers(
  p1: Partial<PlayerSnapshot>,
  p2: Partial<PlayerSnapshot>,
  extra?: Partial<GameState>,
): GameState {
  const base = createInitialGameState("ROUND_END");
  return {
    ...base,
    ...extra,
    p1: { ...base.p1, ...p1 },
    p2: { ...base.p2, ...p2 },
  };
}

describe("resolveRound rule engine", () => {
  it("1. NORMAL + ROCK becomes CHARGING_LV1", () => {
    const prev = createInitialGameState("ROUND_END");
    const next = resolveRound(prev, "ROCK", "ROCK");
    expect(next.p1.state).toBe("CHARGING_LV1");
    expect(next.p2.state).toBe("CHARGING_LV1");
  });

  it("2. CHARGING_LV1 + HOLD becomes CHARGING_LV2", () => {
    const prev = withPlayers({ state: "CHARGING_LV1" }, { state: "NORMAL" });
    const next = resolveRound(prev, "HOLD", "PAPER");
    expect(next.p1.state).toBe("CHARGING_LV2");
  });

  it("3. CHARGING_LV1 + ROCK releases Rock Lv1", () => {
    const prev = withPlayers({ state: "CHARGING_LV1" }, { state: "NORMAL" });
    const next = resolveRound(prev, "ROCK", "PAPER");
    expect(next.lastEffectiveActions?.p1).toBe("ROCK_RELEASE_LV1");
  });

  it("4. CHARGING_LV2 + ROCK releases Rock Lv2", () => {
    const prev = withPlayers({ state: "CHARGING_LV2" }, { state: "NORMAL" });
    const next = resolveRound(prev, "ROCK", "PAPER");
    expect(next.lastEffectiveActions?.p1).toBe("ROCK_RELEASE_LV2");
  });

  it("5. Rock Lv1 release deals 6 damage", () => {
    const prev = withPlayers({ state: "CHARGING_LV1" }, { state: "NORMAL" });
    const next = resolveRound(prev, "ROCK", "ROCK");
    expect(INITIAL_HP - next.p2.hp).toBe(ROCK_LV1_DAMAGE);
  });

  it("6. Rock Lv2 release deals 8 damage", () => {
    const prev = withPlayers({ state: "CHARGING_LV2" }, { state: "NORMAL" });
    const next = resolveRound(prev, "ROCK", "ROCK");
    expect(INITIAL_HP - next.p2.hp).toBe(ROCK_LV2_DAMAGE);
  });

  it("7. Paper counters Rock Lv1 release and deals 10 damage", () => {
    const prev = withPlayers({ state: "NORMAL" }, { state: "CHARGING_LV1" });
    const next = resolveRound(prev, "PAPER", "ROCK");
    expect(next.p2.hp).toBe(INITIAL_HP - 10);
    expect(next.p2.state).toBe("STAGGERED");
  });

  it("8. Paper counters Rock Lv2 release and deals 10 damage", () => {
    const prev = withPlayers({ state: "NORMAL" }, { state: "CHARGING_LV2" });
    const next = resolveRound(prev, "PAPER", "ROCK");
    expect(next.p2.hp).toBe(INITIAL_HP - 10);
    expect(next.p2.state).toBe("STAGGERED");
  });

  it("9. Paper does not counter Rock start charge", () => {
    const prev = withPlayers({ state: "NORMAL" }, { state: "NORMAL" });
    const next = resolveRound(prev, "PAPER", "ROCK");
    expect(next.p1.hp).toBe(INITIAL_HP);
    expect(next.p2.hp).toBe(INITIAL_HP);
    expect(next.p2.state).toBe("CHARGING_LV1");
  });

  it("10. Paper does not counter Rock hold charge", () => {
    const prev = withPlayers({ state: "NORMAL" }, { state: "CHARGING_LV1", hp: INITIAL_HP });
    const next = resolveRound(prev, "PAPER", "HOLD");
    expect(next.p1.hp).toBe(INITIAL_HP);
    expect(next.p2.hp).toBe(INITIAL_HP);
    expect(next.p2.state).toBe("CHARGING_LV2");
  });

  it("11. Scissors beats Paper and staggers the Paper user", () => {
    const prev = withPlayers({ state: "NORMAL" }, { state: "NORMAL" });
    const next = resolveRound(prev, "SCISSORS", "PAPER");
    expect(next.p2.hp).toBe(INITIAL_HP - 3);
    expect(next.p2.state).toBe("STAGGERED");
  });

  it("12. Second consecutive Paper takes 5 damage when beaten by Scissors", () => {
    const prev = withPlayers({ state: "NORMAL" }, { paperStreak: 1, state: "NORMAL" });
    const next = resolveRound(prev, "SCISSORS", "PAPER");
    expect(next.p2.hp).toBe(INITIAL_HP - 5);
  });

  it("13. Third consecutive Paper becomes PAPER_EXHAUSTED", () => {
    const prev = withPlayers({ state: "NORMAL" }, { paperStreak: 2, state: "NORMAL" });
    const next = resolveRound(prev, "ROCK", "PAPER");
    expect(next.lastEffectiveActions?.p2).toBe("PAPER_EXHAUSTED");
  });

  it("14. PAPER_EXHAUSTED cannot counter Rock release", () => {
    const prev = withPlayers(
      { state: "CHARGING_LV1" },
      { paperStreak: 2, state: "CHARGING_LV1" },
    );
    const next = resolveRound(prev, "ROCK", "PAPER");
    expect(next.lastEffectiveActions?.p2).toBe("PAPER_EXHAUSTED");
    expect(next.p2.hp).toBe(INITIAL_HP - ROCK_LV1_DAMAGE);
    expect(next.p2.state).not.toBe("STAGGERED");
  });

  it("15. Scissors vs Rock charging deals only 1 chip damage", () => {
    const prev = withPlayers({ state: "NORMAL" }, { state: "NORMAL" });
    const next = resolveRound(prev, "SCISSORS", "ROCK");
    expect(next.p2.hp).toBe(INITIAL_HP - 1);
    expect(next.p2.state).toBe("CHARGING_LV1");
  });

  it("16. Rock release beats Scissors", () => {
    const prev = withPlayers({ state: "CHARGING_LV1" }, { state: "NORMAL", hp: 30 });
    const next = resolveRound(prev, "ROCK", "SCISSORS");
    expect(next.p2.hp).toBe(INITIAL_HP - ROCK_LV1_DAMAGE);
    expect(next.p1.state).toBe("NORMAL");
  });

  it("17. Third consecutive Scissors becomes forced Rock Lv1 release", () => {
    const prev = withPlayers(
      { scissorsStreak: 2, state: "NORMAL" },
      { state: "NORMAL" },
    );
    const next = resolveRound(prev, "SCISSORS", "SCISSORS");
    expect(next.lastEffectiveActions?.p1).toBe("ROCK_RELEASE_LV1");
    expect(next.p1.scissorsStreak).toBe(0);
  });

  it("18. STAGGERED player skips one round", () => {
    const prev = withPlayers({ state: "STAGGERED" }, { state: "NORMAL" });
    const next = resolveRound(prev, "SCISSORS", "ROCK");
    expect(next.lastEffectiveActions?.p1).toBe("STUNNED_SKIP");
  });

  it("19. STAGGERED player returns to NORMAL after skipping if not staggered again", () => {
    const prev = withPlayers({ state: "STAGGERED" }, { state: "NORMAL" });
    const next = resolveRound(prev, "PAPER", "ROCK");
    expect(next.p1.state).toBe("NORMAL");
  });

  it("20. Both players using Scissors take 3 damage each", () => {
    const prev = createInitialGameState("ROUND_END");
    const next = resolveRound(prev, "SCISSORS", "SCISSORS");
    expect(next.p1.hp).toBe(INITIAL_HP - 3);
    expect(next.p2.hp).toBe(INITIAL_HP - 3);
  });

  it("21. Both players releasing Rock damage each other", () => {
    const prev = withPlayers({ state: "CHARGING_LV1" }, { state: "CHARGING_LV1" });
    const next = resolveRound(prev, "ROCK", "ROCK");
    expect(next.p1.hp).toBe(INITIAL_HP - ROCK_LV1_DAMAGE);
    expect(next.p2.hp).toBe(INITIAL_HP - ROCK_LV1_DAMAGE);
  });

  it("22. HP never goes below 0", () => {
    const prev = withPlayers({ state: "NORMAL", hp: 4 }, { state: "CHARGING_LV1" });
    const next = resolveRound(prev, "SCISSORS", "ROCK");
    expect(next.p1.hp).toBe(0);
  });

  it("23. P1 reaches 0 HP, P2 wins", () => {
    const prev = withPlayers(
      { state: "NORMAL", hp: ROCK_LV1_DAMAGE },
      { state: "CHARGING_LV1" },
    );
    const next = resolveRound(prev, "SCISSORS", "ROCK");
    expect(next.p1.hp).toBe(0);
    expect(next.winner).toBe("P2");
    expect(next.phase).toBe("GAME_OVER");
  });

  it("24. P2 reaches 0 HP, P1 wins", () => {
    const prev = withPlayers(
      { state: "CHARGING_LV1" },
      { state: "NORMAL", hp: ROCK_LV1_DAMAGE },
    );
    const next = resolveRound(prev, "ROCK", "SCISSORS");
    expect(next.p2.hp).toBe(0);
    expect(next.winner).toBe("P1");
    expect(next.phase).toBe("GAME_OVER");
  });

  it("25. Both players reach 0 HP in the same round, result is DRAW", () => {
    const prev = withPlayers(
      { state: "NORMAL", hp: 3 },
      { state: "NORMAL", hp: 3 },
    );
    const next = resolveRound(prev, "SCISSORS", "SCISSORS");
    expect(next.p1.hp).toBe(0);
    expect(next.p2.hp).toBe(0);
    expect(next.winner).toBe("DRAW");
    expect(next.phase).toBe("GAME_OVER");
  });

  it("26. Invalid action is handled safely and logged", () => {
    const prev = createInitialGameState("ROUND_END");
    const next = resolveRound(prev, "HOLD", "ROCK");
    expect(next.p1.state).toBe("NORMAL");
    expect(next.lastEffectiveActions?.p1).toBe("INVALID");
    expect(next.p1.hp).toBe(INITIAL_HP);
    const msgs = next.logs.at(-1)?.messages.join("\n") ?? "";
    expect(msgs).toContain("attempted HOLD");
    expect(msgs).toContain("invalid");
  });

  it("does not mutate the previous GameState", () => {
    const prev = withPlayers({ state: "CHARGING_LV2" }, { state: "NORMAL" });
    const snapshot = cloneState(prev);
    resolveRound(prev, "SCISSORS", "ROCK");
    expect(prev).toEqual(snapshot);
  });

  it("ROUND_END result omits the winner field", () => {
    const prev = createInitialGameState("ROUND_END");
    const next = resolveRound(prev, "ROCK", "ROCK");
    expect(next.phase).toBe("ROUND_END");
    expect(Object.prototype.hasOwnProperty.call(next, "winner")).toBe(false);
  });

  it("GAME_OVER result includes winner", () => {
    const prev = withPlayers(
      { state: "NORMAL", hp: ROCK_LV1_DAMAGE },
      { state: "CHARGING_LV1" },
    );
    const next = resolveRound(prev, "SCISSORS", "ROCK");
    expect(next.phase).toBe("GAME_OVER");
    expect(next).toHaveProperty("winner");
  });

  it("INVALID input preserves CHARGING_LV2 unless stagger changes it", () => {
    const prev = withPlayers({ state: "CHARGING_LV2" }, { state: "NORMAL" });
    const next = resolveRound(prev, "SCISSORS", "ROCK");
    expect(next.p1.state).toBe("CHARGING_LV2");
    expect(next.lastEffectiveActions?.p1).toBe("INVALID");
  });

  it("third consecutive SCISSORS becomes ROCK_RELEASE_LV1 and uses Rock vs Scissors rules", () => {
    const prev = withPlayers(
      { scissorsStreak: 2, state: "NORMAL" },
      { state: "NORMAL", hp: INITIAL_HP },
    );
    const next = resolveRound(prev, "SCISSORS", "SCISSORS");
    expect(next.lastEffectiveActions?.p1).toBe("ROCK_RELEASE_LV1");
    expect(next.lastEffectiveActions?.p2).toBe("SCISSORS_ATTACK");
    expect(next.p2.hp).toBe(INITIAL_HP - ROCK_LV1_DAMAGE);
    expect(next.p1.scissorsStreak).toBe(0);
  });

  it("PAPER_EXHAUSTED loses to Scissors for 5 damage and is staggered", () => {
    const prev = withPlayers({ state: "NORMAL" }, { paperStreak: 2, state: "NORMAL" });
    const next = resolveRound(prev, "SCISSORS", "PAPER");
    expect(next.lastEffectiveActions?.p2).toBe("PAPER_EXHAUSTED");
    expect(next.p2.hp).toBe(INITIAL_HP - 5);
    expect(next.p2.state).toBe("STAGGERED");
  });

  it("leaves a GAME_OVER snapshot unchanged while returning a detached copy", () => {
    const prev: GameState = {
      ...createInitialGameState("GAME_OVER"),
      roundNumber: 7,
      winner: "DRAW",
      p1: { ...createInitialGameState().p1, hp: 0 },
      p2: { ...createInitialGameState().p2, hp: 0 },
    };
    const snapshot = cloneState(prev);
    const out = resolveRound(prev, "ROCK", "ROCK");
    expect(prev).toEqual(snapshot);
    expect(out.phase).toBe("GAME_OVER");
    expect(out.winner).toBe("DRAW");
    expect(out.logs.length).toBe(prev.logs.length);
    expect(out).not.toBe(prev);
    expect(out.logs).not.toBe(prev.logs);
  });
});
