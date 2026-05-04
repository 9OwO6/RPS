import { INITIAL_HP } from "./constants";
import type { GamePhase, GameState, PlayerSnapshot } from "./types";

export function createInitialPlayerSnapshot(
  id: PlayerSnapshot["id"],
): PlayerSnapshot {
  return {
    id,
    hp: INITIAL_HP,
    state: "NORMAL",
    scissorsStreak: 0,
    paperStreak: 0,
  };
}

export function createInitialGameState(phase: GamePhase = "P1_PICK"): GameState {
  return {
    roundNumber: 1,
    phase,
    p1: createInitialPlayerSnapshot("P1"),
    p2: createInitialPlayerSnapshot("P2"),
    logs: [],
  };
}
