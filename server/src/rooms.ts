import type {
  PlayerId,
  PublicOnlineRoomState,
  ServerOnlineRoom,
} from "./onlineTypes.js";

const rooms = new Map<string, ServerOnlineRoom>();

function randomCode(length = 5): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)] ?? "A";
  }
  return out;
}

export function generateRoomCode(): string {
  for (let i = 0; i < 100; i += 1) {
    const code = randomCode(5);
    if (!rooms.has(code)) return code;
  }
  throw new Error("Could not generate unique room code");
}

export function createRoomForP1(socketId: string): ServerOnlineRoom {
  const now = Date.now();
  const roomCode = generateRoomCode();
  const room: ServerOnlineRoom = {
    roomCode,
    players: {
      P1: {
        playerId: "P1",
        socketId,
        joinedAt: now,
        connected: true,
      },
    },
    gameState: {
      phase: "P1_PICK",
      roundNumber: 1,
    },
    pendingActions: {
      p1Locked: false,
      p2Locked: false,
    },
    status: "WAITING",
    createdAt: now,
    updatedAt: now,
  };
  rooms.set(roomCode, room);
  return room;
}

export function getRoom(roomCode: string): ServerOnlineRoom | undefined {
  return rooms.get(roomCode.toUpperCase());
}

export function findRoomBySocketId(
  socketId: string,
): { room: ServerOnlineRoom; playerId: PlayerId } | null {
  for (const room of rooms.values()) {
    if (room.players.P1?.socketId === socketId) return { room, playerId: "P1" };
    if (room.players.P2?.socketId === socketId) return { room, playerId: "P2" };
  }
  return null;
}

export function joinRoomAsP2(
  room: ServerOnlineRoom,
  socketId: string,
): { ok: true } | { ok: false; code: string; message: string } {
  if (room.players.P2) {
    return {
      ok: false,
      code: "ROOM_FULL",
      message: "Room already has two players.",
    };
  }
  room.players.P2 = {
    playerId: "P2",
    socketId,
    joinedAt: Date.now(),
    connected: true,
  };
  room.status = "IN_GAME";
  room.updatedAt = Date.now();
  return { ok: true };
}

export function removePlayerFromRoom(
  room: ServerOnlineRoom,
  playerId: PlayerId,
): { roomEmpty: boolean } {
  delete room.players[playerId];
  room.updatedAt = Date.now();

  if (!room.players.P1 && !room.players.P2) {
    rooms.delete(room.roomCode);
    return { roomEmpty: true };
  }

  if (!room.players.P2) {
    room.status = "WAITING";
  }
  return { roomEmpty: false };
}

export function markDisconnected(
  room: ServerOnlineRoom,
  playerId: PlayerId,
): void {
  const p = room.players[playerId];
  if (!p) return;
  p.connected = false;
  room.updatedAt = Date.now();
}

export function toPublicRoomState(room: ServerOnlineRoom): PublicOnlineRoomState {
  return {
    roomCode: room.roomCode,
    players: {
      ...(room.players.P1
        ? {
            P1: {
              playerId: "P1" as const,
              connected: room.players.P1.connected,
            },
          }
        : {}),
      ...(room.players.P2
        ? {
            P2: {
              playerId: "P2" as const,
              connected: room.players.P2.connected,
            },
          }
        : {}),
    },
    gameState: room.gameState,
    status: room.status,
    p1Locked: room.pendingActions.p1Locked,
    p2Locked: room.pendingActions.p2Locked,
    createdAt: room.createdAt,
    updatedAt: room.updatedAt,
  };
}
