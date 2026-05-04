export type PlayerId = "P1" | "P2";

export type PlayerState =
  | "NORMAL"
  | "CHARGING_LV1"
  | "CHARGING_LV2"
  | "STAGGERED";

export type InputAction =
  | "SCISSORS"
  | "ROCK"
  | "PAPER"
  | "HOLD";

export type EffectiveAction =
  | "SCISSORS_ATTACK"
  | "PAPER_COUNTER"
  | "PAPER_EXHAUSTED"
  | "ROCK_START_CHARGE"
  | "ROCK_HOLD_CHARGE"
  | "ROCK_RELEASE_LV1"
  | "ROCK_RELEASE_LV2"
  | "STUNNED_SKIP"
  | "INVALID";

export type GamePhase =
  | "P1_PICK"
  | "PASS_TO_P2"
  | "P2_PICK"
  | "RESOLVE"
  | "ROUND_END"
  | "GAME_OVER";

export interface PlayerSnapshot {
  id: PlayerId;
  hp: number;
  state: PlayerState;
  scissorsStreak: number;
  paperStreak: number;
}

export interface RoundLog {
  round: number;
  messages: string[];
}

export interface GameState {
  roundNumber: number;
  phase: GamePhase;
  p1: PlayerSnapshot;
  p2: PlayerSnapshot;
  p1PendingAction?: InputAction;
  p2PendingAction?: InputAction;
  lastEffectiveActions?: {
    p1: EffectiveAction;
    p2: EffectiveAction;
  };
  logs: RoundLog[];
  winner?: PlayerId | "DRAW";
}
