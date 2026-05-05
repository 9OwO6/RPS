export type PlayerId = "P1" | "P2";
export type OnlineRoomStatus = "WAITING" | "IN_GAME" | "GAME_OVER" | "CLOSED";
export type InputAction = "SCISSORS" | "ROCK" | "PAPER" | "HOLD";

export interface PlayerConnection {
  playerId: PlayerId;
  socketId: string;
  joinedAt: number;
  connected: boolean;
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
  gameState: {
    phase: string;
    roundNumber: number;
  };
  pendingActions: PendingActions;
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
  gameState: {
    phase: string;
    roundNumber: number;
  };
  status: OnlineRoomStatus;
  p1Locked: boolean;
  p2Locked: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface ErrorMessagePayload {
  code: string;
  message: string;
}
