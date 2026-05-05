import type { GameState, InputAction } from "../../src/game/types.ts";

export type PlayerId = "P1" | "P2";

export type OnlineRoomStatus =
  | "WAITING"
  | "IN_GAME"
  | "ROUND_END"
  | "GAME_OVER"
  | "CLOSED";

export interface PlayerConnection {
  playerId: PlayerId;
  socketId: string | null;
  /** Stable seat credential for reconnect (never broadcast publicly). */
  playerToken: string;
  joinedAt: number;
  connected: boolean;
  disconnectedAt?: number;
}

export interface PendingActions {
  p1?: InputAction;
  p2?: InputAction;
  p1Locked: boolean;
  p2Locked: boolean;
}

export interface ServerOnlineRoom {
  roomCode: string;
  players: Partial<Record<PlayerId, PlayerConnection>>;
  gameState: GameState;
  pendingActions: PendingActions;
  /** Online-only: readiness to leave ROUND_END (server-authoritative). */
  nextRoundReady: { P1: boolean; P2: boolean };
  /** Epoch ms when auto-advance fires if still only one player ready. */
  nextRoundCountdownEndsAt?: number;
  /** Server-only timer handle (never serialized). */
  nextRoundTimer?: ReturnType<typeof setTimeout>;
  status: OnlineRoomStatus;
  createdAt: number;
  updatedAt: number;
}

export interface PublicPlayerConnection {
  playerId: PlayerId;
  connected: boolean;
}

export interface PublicOnlineRoomState {
  roomCode: string;
  players: Partial<Record<PlayerId, PublicPlayerConnection>>;
  gameState: GameState;
  status: OnlineRoomStatus;
  p1Locked: boolean;
  p2Locked: boolean;
  p1NextReady: boolean;
  p2NextReady: boolean;
  /** Epoch ms when the server will auto-advance (ROUND_END only). */
  nextRoundCountdownEndsAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface ErrorMessagePayload {
  code: string;
  message: string;
}
