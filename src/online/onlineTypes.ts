import type { GameState, InputAction, PlayerId } from "@/game/types";

export type OnlineRoomStatus =
  | "WAITING"
  | "IN_GAME"
  | "ROUND_END"
  | "GAME_OVER"
  | "CLOSED";

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
  /** Epoch ms when server auto-advances (ROUND_END only). */
  nextRoundCountdownEndsAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface JoinRoomPayload {
  roomCode: string;
}

export interface LeaveRoomPayload {
  roomCode: string;
}

export interface SubmitActionPayload {
  roomCode: string;
  action: InputAction;
}

export interface NextRoundPayload {
  roomCode: string;
}

export interface RestartMatchPayload {
  roomCode: string;
}

export interface RoomCreatedPayload {
  roomCode: string;
  playerId: "P1";
  /** Private to this socket — persist only locally for reconnect. */
  playerToken: string;
  roomState: PublicOnlineRoomState;
}

export interface RoomJoinedPayload {
  roomCode: string;
  playerId: "P2";
  playerToken: string;
  roomState: PublicOnlineRoomState;
}

export interface RoomRejoinedPayload {
  roomCode: string;
  playerId: "P1" | "P2";
  playerToken: string;
  roomState: PublicOnlineRoomState;
}

export interface RejoinRoomPayload {
  roomCode: string;
  playerId: "P1" | "P2";
  playerToken: string;
}

export interface RoomStatePayload {
  roomState: PublicOnlineRoomState;
}

export interface ActionLockedPayload {
  roomCode: string;
  p1Locked: boolean;
  p2Locked: boolean;
}

export interface RoundResolvedPayload {
  roomCode: string;
  previousGameState: GameState;
  gameState: GameState;
  roomState: PublicOnlineRoomState;
}

export interface MatchRestartedPayload {
  roomCode: string;
  roomState: PublicOnlineRoomState;
}

export interface PlayerLeftPayload {
  roomCode: string;
  playerId: PlayerId;
  reason?: string;
}

export interface ErrorMessagePayload {
  code: string;
  message: string;
}
