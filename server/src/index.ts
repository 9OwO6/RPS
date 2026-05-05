/**
 * Start via repo-root `socket-server.ts` (npm run dev:server). Loading this file
 * directly under tsx without pre-loading ./rooms.ts breaks shared game imports.
 */
import { createServer } from "node:http";

import type { GameState, InputAction } from "../../src/game/types.ts";

import type { ErrorMessagePayload, PlayerId } from "./onlineTypes.js";

import { Server } from "socket.io";

import {
  advanceOnlineRoomToNextRound,
  clearNextRoundCountdown,
  createRoomForP1,
  findRoomBySocketId,
  getRoom,
  joinRoomAsP2,
  markDisconnected,
  markNextRoundReady,
  ONLINE_SEAT_GRACE_MS,
  purgeStaleRooms,
  removePlayerFromRoom,
  resolveLockedRound,
  restartMatch,
  scheduleNextRoundCountdownIfNeeded,
  strictBothPlayersReadyForNextRound,
  submitActionForPlayer,
  toPublicRoomState,
  tryRejoinSeat,
} from "./rooms.js";

/** Bind address for containers / PaaS (Render, Railway, Koyeb). Override with HOST if needed. */
function parseListenHost(): string {
  const raw = process.env.HOST?.trim();
  if (raw) return raw;
  return "0.0.0.0";
}

/**
 * Vercel preview + prod: set CORS_ORIGIN=https://app.vercel.app,https://preview.vercel.app
 * Local: CORS_ORIGIN=http://localhost:3000
 */
function parseCorsOrigin(): string | string[] {
  const raw =
    process.env.CORS_ORIGIN?.trim() || process.env.FRONTEND_ORIGIN?.trim();
  if (!raw) return "http://localhost:3000";
  const parts = raw.split(",").map((s) => s.trim()).filter(Boolean);
  if (parts.length === 0) return "http://localhost:3000";
  return parts.length === 1 ? parts[0]! : parts;
}

function parseListenPort(): number {
  const raw = process.env.PORT?.trim();
  if (!raw) return 3001;
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0 || n > 65535) {
    // eslint-disable-next-line no-console
    console.warn(`Invalid PORT="${raw}", using default 3001.`);
    return 3001;
  }
  return Math.floor(n);
}

const listenPort = parseListenPort();
const listenHost = parseListenHost();
const corsOrigin = parseCorsOrigin();

const ROOM_IDLE_PURGE_MS = Math.max(
  60_000,
  Number(process.env.ROOM_IDLE_PURGE_MS ?? 7_200_000),
);
const ROOM_SWEEP_INTERVAL_MS = Math.max(
  30_000,
  Number(process.env.ROOM_SWEEP_INTERVAL_MS ?? 300_000),
);

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: corsOrigin,
    methods: ["GET", "POST"],
  },
});

setInterval(() => {
  const removed = purgeStaleRooms(Date.now(), ROOM_IDLE_PURGE_MS);
  if (removed > 0 && process.env.DEBUG_ROOM_SWEEP === "1") {
    // eslint-disable-next-line no-console
    console.log(`[room-sweep] removed ${removed} stale room(s)`);
  }
}, ROOM_SWEEP_INTERVAL_MS);

function emitError(socketId: string, payload: ErrorMessagePayload): void {
  io.to(socketId).emit("error_message", payload);
}

function logOnlineNextRound(...args: unknown[]): void {
  if (process.env.DEBUG_ONLINE_NEXT_ROUND !== "1") return;
  // eslint-disable-next-line no-console
  console.log("[online-next-round]", ...args);
}

function broadcastRoundResolved(
  roomCode: string,
  resolved: {
    previousGameState: GameState;
    nextGameState: GameState;
  },
): void {
  const room = getRoom(roomCode);
  if (!room) return;
  io.to(roomCode).emit("round_resolved", {
    roomCode,
    previousGameState: resolved.previousGameState,
    gameState: resolved.nextGameState,
    roomState: toPublicRoomState(room),
  });
}

/** Auto-advance after ready queue / countdown; skips if phase or connectivity invalid. */
function tryAdvanceOnlineRound(roomCode: string, reason: string): void {
  const room = getRoom(roomCode);
  if (
    !room ||
    room.gameState.phase !== "ROUND_END" ||
    room.status !== "ROUND_END"
  ) {
    logOnlineNextRound("tryAdvanceOnlineRound:abort", reason, {
      roomCode,
      hasRoom: Boolean(room),
      phase: room?.gameState.phase,
      status: room?.status,
    });
    return;
  }
  if (!room.players.P1?.connected || !room.players.P2?.connected) {
    logOnlineNextRound(
      "tryAdvanceOnlineRound:abort-disconnected",
      reason,
      roomCode,
    );
    clearNextRoundCountdown(room);
    io.to(roomCode).emit("room_state", {
      roomState: toPublicRoomState(room),
    });
    return;
  }

  logOnlineNextRound("tryAdvanceOnlineRound:advance", reason, roomCode);

  const prep = advanceOnlineRoomToNextRound(room);
  if (!prep.ok) return;

  io.to(roomCode).emit("room_state", {
    roomState: toPublicRoomState(room),
  });

  const resolved = resolveLockedRound(room);
  if (resolved) {
    broadcastRoundResolved(roomCode, resolved);
  }
}

io.on("connection", (socket) => {
  socket.on("create_room", () => {
    const room = createRoomForP1(socket.id);
    socket.join(room.roomCode);
    const token = room.players.P1?.playerToken;
    io.to(socket.id).emit("room_created", {
      roomCode: room.roomCode,
      playerId: "P1",
      playerToken: token ?? "",
      roomState: toPublicRoomState(room),
    });
  });

  socket.on("join_room", (payload: { roomCode?: string }) => {
    const roomCode = payload.roomCode?.trim().toUpperCase();
    if (!roomCode) {
      emitError(socket.id, {
        code: "INVALID_ROOM_CODE",
        message: "Room code is required.",
      });
      return;
    }
    const room = getRoom(roomCode);
    if (!room) {
      emitError(socket.id, {
        code: "ROOM_NOT_FOUND",
        message: "Room not found or expired.",
      });
      return;
    }
    const joined = joinRoomAsP2(room, socket.id);
    if (!joined.ok) {
      emitError(socket.id, { code: joined.code, message: joined.message });
      return;
    }
    socket.join(room.roomCode);
    const token = room.players.P2?.playerToken;
    io.to(socket.id).emit("room_joined", {
      roomCode: room.roomCode,
      playerId: "P2",
      playerToken: token ?? "",
      roomState: toPublicRoomState(room),
    });
    io.to(room.roomCode).emit("room_state", {
      roomState: toPublicRoomState(room),
    });

    const resolved = resolveLockedRound(room);
    if (resolved) {
      broadcastRoundResolved(room.roomCode, resolved);
    }
  });

  socket.on(
    "rejoin_room",
    (payload: {
      roomCode?: string;
      playerId?: PlayerId;
      playerToken?: string;
    }) => {
      const roomCode = payload.roomCode?.trim().toUpperCase();
      const playerId = payload.playerId;
      const token = payload.playerToken?.trim();
      if (!roomCode || !playerId || !token) {
        emitError(socket.id, {
          code: "INVALID_PAYLOAD",
          message: "Room code, seat, and reconnect token are required.",
        });
        return;
      }
      if (playerId !== "P1" && playerId !== "P2") {
        emitError(socket.id, {
          code: "INVALID_PAYLOAD",
          message: "Seat must be P1 or P2.",
        });
        return;
      }
      const room = getRoom(roomCode);
      if (!room) {
        emitError(socket.id, {
          code: "ROOM_NOT_FOUND",
          message: "Room not found or expired.",
        });
        return;
      }
      const prev = findRoomBySocketId(socket.id);
      if (prev && prev.room.roomCode !== roomCode) {
        emitError(socket.id, {
          code: "NOT_IN_ROOM",
          message: "Leave your current room before rejoining another.",
        });
        return;
      }
      const rj = tryRejoinSeat(room, playerId, token, socket.id);
      if (!rj.ok) {
        emitError(socket.id, { code: rj.code, message: rj.message });
        return;
      }
      socket.join(room.roomCode);
      const stableToken = room.players[playerId]?.playerToken ?? token;
      io.to(socket.id).emit("room_rejoined", {
        roomCode: room.roomCode,
        playerId,
        playerToken: stableToken,
        roomState: toPublicRoomState(room),
      });
      io.to(room.roomCode).emit("room_state", {
        roomState: toPublicRoomState(room),
      });

      const resolved = resolveLockedRound(room);
      if (resolved) {
        broadcastRoundResolved(room.roomCode, resolved);
      }
    },
  );

  socket.on(
    "submit_action",
    (payload: { roomCode?: string; action?: InputAction }) => {
      const roomCode = payload.roomCode?.trim().toUpperCase();
      if (!roomCode || payload.action === undefined) {
        emitError(socket.id, {
          code: "INVALID_PAYLOAD",
          message: "Room code and action are required.",
        });
        return;
      }

      const found = findRoomBySocketId(socket.id);
      if (!found || found.room.roomCode !== roomCode) {
        emitError(socket.id, {
          code: "NOT_IN_ROOM",
          message: "You are not in that room.",
        });
        return;
      }

      const { room, playerId } = found;
      const submitted = submitActionForPlayer(room, playerId, payload.action);
      if (!submitted.ok) {
        emitError(socket.id, {
          code: submitted.code,
          message: submitted.message,
        });
        return;
      }

      io.to(room.roomCode).emit("action_locked", {
        roomCode: room.roomCode,
        p1Locked: room.pendingActions.p1Locked,
        p2Locked: room.pendingActions.p2Locked,
      });

      const resolved = resolveLockedRound(room);
      if (resolved) {
        broadcastRoundResolved(room.roomCode, resolved);
      }
    },
  );

  socket.on("next_round", (payload: { roomCode?: string }) => {
    const roomCode = payload.roomCode?.trim().toUpperCase();
    if (!roomCode) {
      emitError(socket.id, {
        code: "INVALID_ROOM_CODE",
        message: "Room code is required.",
      });
      return;
    }

    const found = findRoomBySocketId(socket.id);
    if (!found || found.room.roomCode !== roomCode) {
      emitError(socket.id, {
        code: "NOT_IN_ROOM",
        message: "You are not in that room.",
      });
      return;
    }

    const { room, playerId } = found;

    if (!room.players.P1?.connected || !room.players.P2?.connected) {
      emitError(socket.id, {
        code: "PLAYER_DISCONNECTED",
        message: "Opponent disconnected.",
      });
      return;
    }

    logOnlineNextRound("recv next_round", {
      roomCode,
      playerId,
      phase: room.gameState.phase,
      status: room.status,
    });

    const marked = markNextRoundReady(room, playerId);
    if (!marked.ok) {
      emitError(socket.id, {
        code: marked.code,
        message: marked.message,
      });
      return;
    }

    logOnlineNextRound("after markNextRoundReady", {
      p1NextReady: room.nextRoundReady.P1,
      p2NextReady: room.nextRoundReady.P2,
      strictBothReady: strictBothPlayersReadyForNextRound(room),
    });

    if (strictBothPlayersReadyForNextRound(room)) {
      logOnlineNextRound(
        "immediate advance path (both strictly ready)",
        roomCode,
      );
      clearNextRoundCountdown(room);
      tryAdvanceOnlineRound(room.roomCode, "both-ready");
      return;
    }

    const scheduledNewTimer = scheduleNextRoundCountdownIfNeeded(room, () => {
      logOnlineNextRound("countdown timer fired", roomCode);
      tryAdvanceOnlineRound(roomCode, "countdown-expired");
    });

    logOnlineNextRound("scheduled new countdown timer?", scheduledNewTimer, {
      endsAt: room.nextRoundCountdownEndsAt,
    });

    io.to(room.roomCode).emit("room_state", {
      roomState: toPublicRoomState(room),
    });
  });

  socket.on("restart_match", (payload: { roomCode?: string }) => {
    const roomCode = payload.roomCode?.trim().toUpperCase();
    if (!roomCode) {
      emitError(socket.id, {
        code: "INVALID_ROOM_CODE",
        message: "Room code is required.",
      });
      return;
    }

    const found = findRoomBySocketId(socket.id);
    if (!found || found.room.roomCode !== roomCode) {
      emitError(socket.id, {
        code: "NOT_IN_ROOM",
        message: "You are not in that room.",
      });
      return;
    }

    const { room } = found;

    if (!room.players.P1?.connected || !room.players.P2?.connected) {
      emitError(socket.id, {
        code: "PLAYER_DISCONNECTED",
        message: "Opponent disconnected.",
      });
      return;
    }

    restartMatch(room);
    io.to(room.roomCode).emit("match_restarted", {
      roomCode: room.roomCode,
      roomState: toPublicRoomState(room),
    });
    io.to(room.roomCode).emit("room_state", {
      roomState: toPublicRoomState(room),
    });

    const resolved = resolveLockedRound(room);
    if (resolved) {
      broadcastRoundResolved(room.roomCode, resolved);
    }
  });

  socket.on("leave_room", (payload: { roomCode?: string }) => {
    const roomCode = payload.roomCode?.trim().toUpperCase();
    if (!roomCode) {
      emitError(socket.id, {
        code: "INVALID_ROOM_CODE",
        message: "Room code is required.",
      });
      return;
    }
    const room = getRoom(roomCode);
    if (!room) {
      emitError(socket.id, {
        code: "ROOM_NOT_FOUND",
        message: "Room not found or expired.",
      });
      return;
    }
    const found = findRoomBySocketId(socket.id);
    if (!found || found.room.roomCode !== roomCode) {
      emitError(socket.id, {
        code: "NOT_IN_ROOM",
        message: "You are not in that room.",
      });
      return;
    }

    const playerId: PlayerId = found.playerId;
    removePlayerFromRoom(room, playerId);
    socket.leave(roomCode);
    socket.to(roomCode).emit("player_left", {
      roomCode,
      playerId,
      reason: "Player left the room.",
    });
    io.to(roomCode).emit("room_state", { roomState: toPublicRoomState(room) });
  });

  socket.on("disconnect", () => {
    const found = findRoomBySocketId(socket.id);
    if (!found) return;
    const { room, playerId } = found;
    markDisconnected(room, playerId);
    clearNextRoundCountdown(room);
    socket.to(room.roomCode).emit("player_left", {
      roomCode: room.roomCode,
      playerId,
      reason: "Player disconnected.",
    });
    io.to(room.roomCode).emit("room_state", {
      roomState: toPublicRoomState(room),
    });

    const otherId: PlayerId = playerId === "P1" ? "P2" : "P1";
    const other = room.players[otherId];
    if (other?.connected && other.socketId) {
      emitError(other.socketId, {
        code: "OPPONENT_DISCONNECTED",
        message: "Opponent disconnected.",
      });
    }
  });
});

httpServer.once("error", (err: NodeJS.ErrnoException) => {
  if (err.code === "EADDRINUSE") {
    // eslint-disable-next-line no-console
    console.error(
      `Port ${listenPort} is already in use. Stop the existing server or run with PORT=3002.`,
    );
    process.exit(1);
  }
  // eslint-disable-next-line no-console
  console.error("HTTP server failed to start:", err.message || err);
  process.exit(1);
});

httpServer.listen(listenPort, listenHost, () => {
  const corsLabel = Array.isArray(corsOrigin)
    ? corsOrigin.join(", ")
    : corsOrigin;
  // eslint-disable-next-line no-console
  console.log(
    `[socket] Listening on http://${listenHost}:${listenPort} (bind=${listenHost}, PORT=${listenPort})`,
  );
  // eslint-disable-next-line no-console
  console.log(`[socket] CORS origin(s): ${corsLabel}`);
  // eslint-disable-next-line no-console
  console.log(
    `[socket] Seat reclaim grace ONLINE_SEAT_GRACE_MS=${ONLINE_SEAT_GRACE_MS} (purge uses max(60000, this))`,
  );
});
