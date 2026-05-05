import { describe, expect, it } from "vitest";

import { createInitialGameState } from "@/game/initialState";
import {
  createRoomForP1,
  getRoom,
  joinRoomAsP2,
  markDisconnected,
  purgeStaleRooms,
} from "../../server/src/rooms.ts";

/** Imports server room helpers without starting the Socket.IO HTTP listener. */
describe("server room smoke", () => {
  it("resolves the same initial-state helper the socket server uses", () => {
    const gs = createInitialGameState("P1_PICK");
    expect(gs.roundNumber).toBe(1);
    expect(gs.phase).toBe("P1_PICK");
  });

  it("creates a room after socket.io is on the module graph (startup order regression)", async () => {
    await import("../../server/node_modules/socket.io/wrapper.mjs");
    const { createRoomForP1 } = await import("../../server/src/rooms.ts");
    expect(createRoomForP1("after-sio").roomCode.length).toBeGreaterThanOrEqual(4);
  });

  it("creates rooms with independent GameState objects", () => {
    const r1 = createRoomForP1("smoke-room-a");
    const r2 = createRoomForP1("smoke-room-b");
    expect(r1.gameState).not.toBe(r2.gameState);
    expect(r1.gameState.p1).not.toBe(r2.gameState.p1);
  });

  it("purges abandoned idle rooms and preserves rooms with connected players", () => {
    const abandoned = createRoomForP1("smoke-ab-a");
    joinRoomAsP2(abandoned, "smoke-ab-b");
    markDisconnected(abandoned, "P1");
    markDisconnected(abandoned, "P2");
    abandoned.updatedAt = Date.now() - 120_000;

    expect(purgeStaleRooms(Date.now(), 60_000)).toBeGreaterThanOrEqual(1);
    expect(getRoom(abandoned.roomCode)).toBeUndefined();

    const active = createRoomForP1("smoke-live-a");
    joinRoomAsP2(active, "smoke-live-b");
    active.updatedAt = Date.now() - 120_000;

    expect(purgeStaleRooms(Date.now(), 60_000)).toBe(0);
    expect(getRoom(active.roomCode)).toBeDefined();
  });
});
