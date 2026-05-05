import type { GameState, InputAction, PlayerId } from "@/game/types";

export type OnlineRoomStatus = "WAITING" | "IN_GAME" | "GAME_OVER" | "CLOSED";

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
  createdAt: number;
  updatedAt: number;
}

export interface CreateRoomPayload {}

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

export interface RoomCreatedPayload {
  roomCode: string;
  playerId: "P1";
  roomState: PublicOnlineRoomState;
}

export interface RoomJoinedPayload {
  roomCode: string;
  playerId: "P2";
  roomState: PublicOnlineRoomState;
}

export interface RoomStatePayload {
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
