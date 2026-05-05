import { createServer } from "node:http";

import { Server } from "socket.io";

import {
  createRoomForP1,
  findRoomBySocketId,
  getRoom,
  joinRoomAsP2,
  markDisconnected,
  removePlayerFromRoom,
  toPublicRoomState,
} from "./rooms.js";
import type { ErrorMessagePayload, PlayerId } from "./onlineTypes.js";

const PORT = Number(process.env.PORT ?? 3001);
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN ?? "http://localhost:3000";

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: [FRONTEND_ORIGIN],
    methods: ["GET", "POST"],
  },
});

function emitError(socketId: string, payload: ErrorMessagePayload): void {
  io.to(socketId).emit("error_message", payload);
}

io.on("connection", (socket) => {
  socket.on("create_room", () => {
    const room = createRoomForP1(socket.id);
    socket.join(room.roomCode);
    io.to(socket.id).emit("room_created", {
      roomCode: room.roomCode,
      playerId: "P1",
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
        message: "Room not found.",
      });
      return;
    }
    const joined = joinRoomAsP2(room, socket.id);
    if (!joined.ok) {
      emitError(socket.id, { code: joined.code, message: joined.message });
      return;
    }
    socket.join(room.roomCode);
    io.to(socket.id).emit("room_joined", {
      roomCode: room.roomCode,
      playerId: "P2",
      roomState: toPublicRoomState(room),
    });
    io.to(room.roomCode).emit("room_state", {
      roomState: toPublicRoomState(room),
    });
  });

  socket.on("leave_room", (payload: { roomCode?: string }) => {
    const roomCode = payload.roomCode?.trim().toUpperCase();
    if (!roomCode) return;
    const room = getRoom(roomCode);
    if (!room) return;
    const found = findRoomBySocketId(socket.id);
    if (!found || found.room.roomCode !== roomCode) return;

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
    socket.to(room.roomCode).emit("player_left", {
      roomCode: room.roomCode,
      playerId,
      reason: "Player disconnected.",
    });
    io.to(room.roomCode).emit("room_state", { roomState: toPublicRoomState(room) });
  });
});

httpServer.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Socket server listening on http://localhost:${PORT}`);
});
