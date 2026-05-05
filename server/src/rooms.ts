import { randomBytes } from "node:crypto";

import { isInputAllowed } from "../../src/game/actionAvailability.ts";
import { createInitialGameState } from "../../src/game/initialState.ts";
import { resolveRound } from "../../src/game/resolveRound.ts";
import type { GameState, InputAction } from "../../src/game/types.ts";

import type {
  PlayerId,
  PublicOnlineRoomState,
  ServerOnlineRoom,
} from "./onlineTypes.js";

const rooms = new Map<string, ServerOnlineRoom>();

/** Seat reclaim TTL after disconnect before slot may be freed for new joins. */
export const ONLINE_SEAT_GRACE_MS = Number(
  process.env.ONLINE_SEAT_GRACE_MS ?? 300_000,
);

export function generatePlayerToken(): string {
  return randomBytes(24).toString("base64url");
}

const STAGGER_DUMMY_INPUT: InputAction = "ROCK";

export const NEXT_ROUND_COUNTDOWN_MS = 5000;

export function ensureNextRoundRoomShape(room: ServerOnlineRoom): void {
  if (
    !room.nextRoundReady ||
    typeof room.nextRoundReady.P1 !== "boolean" ||
    typeof room.nextRoundReady.P2 !== "boolean"
  ) {
    room.nextRoundReady = { P1: false, P2: false };
  }
}

/** Strict booleans — avoids truthy non-boolean values counting as "ready". */
export function strictBothPlayersReadyForNextRound(
  room: ServerOnlineRoom,
): boolean {
  ensureNextRoundRoomShape(room);
  return room.nextRoundReady.P1 === true && room.nextRoundReady.P2 === true;
}

export function clearNextRoundCountdown(room: ServerOnlineRoom): void {
  if (room.nextRoundTimer !== undefined) {
    clearTimeout(room.nextRoundTimer);
    room.nextRoundTimer = undefined;
  }
  room.nextRoundCountdownEndsAt = undefined;
  room.updatedAt = Date.now();
}

export function clearNextRoundFlow(room: ServerOnlineRoom): void {
  ensureNextRoundRoomShape(room);
  clearNextRoundCountdown(room);
  room.nextRoundReady.P1 = false;
  room.nextRoundReady.P2 = false;
  room.updatedAt = Date.now();
}

/** Starts countdown exactly once; returns whether a new timer was armed. */
export function scheduleNextRoundCountdownIfNeeded(
  room: ServerOnlineRoom,
  onExpire: () => void,
): boolean {
  ensureNextRoundRoomShape(room);
  if (strictBothPlayersReadyForNextRound(room)) return false;
  if (room.nextRoundTimer !== undefined) return false;

  const delayMs =
    Number.isFinite(NEXT_ROUND_COUNTDOWN_MS) && NEXT_ROUND_COUNTDOWN_MS > 0
      ? NEXT_ROUND_COUNTDOWN_MS
      : 5000;

  room.nextRoundCountdownEndsAt = Date.now() + delayMs;
  room.updatedAt = Date.now();

  room.nextRoundTimer = setTimeout(() => {
    room.nextRoundTimer = undefined;
    room.nextRoundCountdownEndsAt = undefined;
    room.updatedAt = Date.now();
    onExpire();
  }, delayMs);
  return true;
}

export function markNextRoundReady(
  room: ServerOnlineRoom,
  playerId: PlayerId,
): { ok: true } | { ok: false; code: string; message: string } {
  ensureNextRoundRoomShape(room);
  if (room.status !== "ROUND_END" || room.gameState.phase !== "ROUND_END") {
    return {
      ok: false,
      code: "INVALID_PHASE",
      message: "Ready is only available between rounds.",
    };
  }
  if (room.nextRoundReady[playerId] === true) {
    return { ok: true };
  }
  room.nextRoundReady[playerId] = true;
  room.updatedAt = Date.now();
  return { ok: true };
}

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

/** Clears pending slots (does not touch locks until applyStaggerAutoLocks). */
export function resetPendingActions(room: ServerOnlineRoom): void {
  room.pendingActions = {
    p1Locked: false,
    p2Locked: false,
  };
}

/**
 * Auto-locks staggered players with the same dummy input used by local play.
 */
export function applyStaggerAutoLocks(room: ServerOnlineRoom): void {
  const g = room.gameState;
  if (g.p1.state === "STAGGERED") {
    room.pendingActions.p1 = STAGGER_DUMMY_INPUT;
    room.pendingActions.p1Locked = true;
  }
  if (g.p2.state === "STAGGERED") {
    room.pendingActions.p2 = STAGGER_DUMMY_INPUT;
    room.pendingActions.p2Locked = true;
  }
  room.updatedAt = Date.now();
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
        playerToken: generatePlayerToken(),
        joinedAt: now,
        connected: true,
      },
    },
    gameState: createInitialGameState("P1_PICK"),
    pendingActions: {
      p1Locked: false,
      p2Locked: false,
    },
    nextRoundReady: { P1: false, P2: false },
    status: "WAITING",
    createdAt: now,
    updatedAt: now,
  };
  resetPendingActions(room);
  applyStaggerAutoLocks(room);
  rooms.set(roomCode, room);
  return room;
}

export function getRoom(roomCode: string): ServerOnlineRoom | undefined {
  return rooms.get(roomCode.toUpperCase());
}

export function reapExpiredDisconnectedSeats(
  room: ServerOnlineRoom,
  nowMs: number,
  graceMs: number,
): void {
  for (const pid of ["P1", "P2"] as PlayerId[]) {
    const p = room.players[pid];
    if (!p || p.connected) continue;
    const dc = p.disconnectedAt;
    if (dc === undefined || nowMs - dc <= graceMs) continue;
    delete room.players[pid];
    clearNextRoundFlow(room);
  }
}

/** When exactly one seat remains empty after reap, park waiting for a fill without wiping duel HP. */
export function normalizePartialOccupancy(room: ServerOnlineRoom): void {
  const hasP1 = Boolean(room.players.P1);
  const hasP2 = Boolean(room.players.P2);
  if ((hasP1 && !hasP2) || (!hasP1 && hasP2)) {
    room.status = "WAITING";
    clearNextRoundFlow(room);
    room.updatedAt = Date.now();
  }
}

/**
 * Reaps disconnected seats past grace, drops fully empty rooms, then removes idle rooms with nobody connected.
 */
export function purgeStaleRooms(nowMs: number, maxIdleMs: number): number {
  let removed = 0;
  const graceMs = Math.max(60_000, ONLINE_SEAT_GRACE_MS);

  for (const [code, room] of [...rooms.entries()]) {
    reapExpiredDisconnectedSeats(room, nowMs, graceMs);

    const p1 = room.players.P1;
    const p2 = room.players.P2;

    if (!p1 && !p2) {
      clearNextRoundCountdown(room);
      rooms.delete(code);
      removed += 1;
      continue;
    }

    normalizePartialOccupancy(room);

    const p1Live = room.players.P1?.connected === true;
    const p2Live = room.players.P2?.connected === true;
    if (p1Live || p2Live) continue;

    if (nowMs - room.updatedAt <= maxIdleMs) continue;

    clearNextRoundCountdown(room);
    rooms.delete(code);
    removed += 1;
  }
  return removed;
}

export function findRoomBySocketId(
  socketId: string,
): { room: ServerOnlineRoom; playerId: PlayerId } | null {
  for (const room of rooms.values()) {
    if (room.players.P1?.socketId === socketId)
      return { room, playerId: "P1" };
    if (room.players.P2?.socketId === socketId)
      return { room, playerId: "P2" };
  }
  return null;
}

export function tryRejoinSeat(
  room: ServerOnlineRoom,
  playerId: PlayerId,
  token: string,
  socketId: string,
): { ok: true } | { ok: false; code: string; message: string } {
  const seat = room.players[playerId];
  if (!seat) {
    return {
      ok: false,
      code: "REJOIN_FAILED",
      message: "Seat is no longer available.",
    };
  }
  if (seat.playerToken !== token) {
    return {
      ok: false,
      code: "REJOIN_FAILED",
      message: "Invalid reconnect token.",
    };
  }
  seat.socketId = socketId;
  seat.connected = true;
  seat.disconnectedAt = undefined;
  room.updatedAt = Date.now();
  return { ok: true };
}

export function joinRoomAsP2(
  room: ServerOnlineRoom,
  socketId: string,
): { ok: true } | { ok: false; code: string; message: string } {
  const existing = room.players.P2;
  if (existing) {
    if (existing.connected) {
      return {
        ok: false,
        code: "ROOM_FULL",
        message: "Room already has two players.",
      };
    }
    return {
      ok: false,
      code: "SEAT_RESERVED",
      message:
        "This seat is reserved for the disconnected duelist. Use Rejoin with your saved session.",
    };
  }
  room.players.P2 = {
    playerId: "P2",
    socketId,
    playerToken: generatePlayerToken(),
    joinedAt: Date.now(),
    connected: true,
  };
  room.status = "IN_GAME";
  resetPendingActions(room);
  applyStaggerAutoLocks(room);
  room.updatedAt = Date.now();
  return { ok: true };
}

export function removePlayerFromRoom(
  room: ServerOnlineRoom,
  playerId: PlayerId,
): { roomEmpty: boolean } {
  clearNextRoundFlow(room);
  delete room.players[playerId];
  room.updatedAt = Date.now();

  if (!room.players.P1 && !room.players.P2) {
    rooms.delete(room.roomCode);
    return { roomEmpty: true };
  }

  if (!room.players.P2 || !room.players.P1) {
    room.status = "WAITING";
    room.gameState = createInitialGameState("P1_PICK");
    resetPendingActions(room);
    applyStaggerAutoLocks(room);
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
  p.socketId = null;
  p.disconnectedAt = Date.now();
  room.updatedAt = Date.now();
}

export function toPublicRoomState(room: ServerOnlineRoom): PublicOnlineRoomState {
  ensureNextRoundRoomShape(room);
  const inRoundEnd =
    room.status === "ROUND_END" && room.gameState.phase === "ROUND_END";

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
    p1NextReady: inRoundEnd ? room.nextRoundReady.P1 : false,
    p2NextReady: inRoundEnd ? room.nextRoundReady.P2 : false,
    nextRoundCountdownEndsAt: inRoundEnd
      ? room.nextRoundCountdownEndsAt
      : undefined,
    createdAt: room.createdAt,
    updatedAt: room.updatedAt,
  };
}

export function submitActionForPlayer(
  room: ServerOnlineRoom,
  playerId: PlayerId,
  action: InputAction,
): { ok: true } | { ok: false; code: string; message: string } {
  if (room.status !== "IN_GAME") {
    return {
      ok: false,
      code: "NOT_IN_GAME",
      message: "Room is not ready for submissions.",
    };
  }
  if (room.gameState.phase !== "P1_PICK") {
    return {
      ok: false,
      code: "INVALID_PHASE",
      message: "Submissions are closed for this phase.",
    };
  }
  if (!room.players.P1?.connected || !room.players.P2?.connected) {
    return {
      ok: false,
      code: "PLAYER_DISCONNECTED",
      message: "Opponent disconnected.",
    };
  }

  const snapshot = playerId === "P1" ? room.gameState.p1 : room.gameState.p2;
  if (snapshot.state === "STAGGERED") {
    return {
      ok: false,
      code: "STAGGER_AUTO",
      message: "Stagger is resolved automatically.",
    };
  }

  if (playerId === "P1") {
    if (room.pendingActions.p1Locked) {
      return {
        ok: false,
        code: "ALREADY_LOCKED",
        message: "You already locked in this round.",
      };
    }
  } else if (room.pendingActions.p2Locked) {
    return {
      ok: false,
      code: "ALREADY_LOCKED",
      message: "You already locked in this round.",
    };
  }

  if (!isInputAllowed(snapshot.state, action)) {
    return {
      ok: false,
      code: "INVALID_ACTION",
      message: "That maneuver is illegal from your current stance.",
    };
  }

  if (playerId === "P1") {
    room.pendingActions.p1 = action;
    room.pendingActions.p1Locked = true;
  } else {
    room.pendingActions.p2 = action;
    room.pendingActions.p2Locked = true;
  }
  room.updatedAt = Date.now();
  return { ok: true };
}

export function resolveLockedRound(room: ServerOnlineRoom): {
  previousGameState: GameState;
  nextGameState: GameState;
} | null {
  const pa = room.pendingActions;
  if (!pa.p1Locked || !pa.p2Locked) return null;
  const p1 = pa.p1;
  const p2 = pa.p2;
  if (p1 === undefined || p2 === undefined) return null;

  const previousGameState = structuredClone(room.gameState);
  const nextGameState = resolveRound(previousGameState, p1, p2);
  room.gameState = nextGameState;
  resetPendingActions(room);
  room.status = nextGameState.phase === "GAME_OVER" ? "GAME_OVER" : "ROUND_END";
  room.updatedAt = Date.now();
  clearNextRoundFlow(room);
  return { previousGameState, nextGameState };
}

export function prepareNextPickingRound(
  room: ServerOnlineRoom,
): { ok: true } | { ok: false; code: string; message: string } {
  if (room.gameState.phase !== "ROUND_END") {
    return {
      ok: false,
      code: "INVALID_PHASE",
      message: "Next round is only available after a completed round.",
    };
  }
  room.gameState = { ...room.gameState, phase: "P1_PICK" };
  room.status = "IN_GAME";
  resetPendingActions(room);
  applyStaggerAutoLocks(room);
  room.updatedAt = Date.now();
  return { ok: true };
}

export function advanceOnlineRoomToNextRound(
  room: ServerOnlineRoom,
): ReturnType<typeof prepareNextPickingRound> {
  clearNextRoundFlow(room);
  return prepareNextPickingRound(room);
}

export function restartMatch(room: ServerOnlineRoom): void {
  clearNextRoundFlow(room);
  room.gameState = createInitialGameState("P1_PICK");
  room.status = room.players.P1 && room.players.P2 ? "IN_GAME" : "WAITING";
  resetPendingActions(room);
  applyStaggerAutoLocks(room);
  room.updatedAt = Date.now();
}
