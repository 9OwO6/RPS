import { describe, expect, it } from "vitest";

import {
  advanceOnlineRoomToNextRound,
  createRoomForP1,
  getRoom,
  joinRoomAsP2,
  markDisconnected,
  purgeStaleRooms,
  toPublicRoomState,
} from "../../server/src/rooms.ts";

describe("toPublicRoomState", () => {
  it("never exposes raw pending InputAction values", () => {
    const room = createRoomForP1("sock-test-a");
    room.pendingActions.p1 = "SCISSORS";
    room.pendingActions.p2 = "PAPER";
    room.pendingActions.p1Locked = true;
    room.pendingActions.p2Locked = true;

    const pub = toPublicRoomState(room);
    expect(pub).not.toHaveProperty("pendingActions");

    const json = JSON.stringify(pub);
    expect(json).not.toContain('"SCISSORS"');
    expect(json).not.toContain('"PAPER"');
    expect(json).not.toContain('"HOLD"');
    expect(json).not.toContain('"ROCK"');

    expect(pub.p1Locked).toBe(true);
    expect(pub.p2Locked).toBe(true);
    expect(pub.p1NextReady).toBe(false);
    expect(pub.p2NextReady).toBe(false);
  });

  it("exposes next-round readiness only during ROUND_END", () => {
    const room = createRoomForP1("sock-a");
    joinRoomAsP2(room, "sock-b");
    room.gameState = { ...room.gameState, phase: "ROUND_END" };
    room.status = "ROUND_END";
    room.nextRoundReady.P1 = true;
    room.nextRoundCountdownEndsAt = 9_000_000;

    const pub = toPublicRoomState(room);
    expect(pub.p1NextReady).toBe(true);
    expect(pub.p2NextReady).toBe(false);
    expect(pub.nextRoundCountdownEndsAt).toBe(9_000_000);

    room.gameState = { ...room.gameState, phase: "P1_PICK" };
    room.status = "IN_GAME";

    const pubPicking = toPublicRoomState(room);
    expect(pubPicking.p1NextReady).toBe(false);
    expect(pubPicking.p2NextReady).toBe(false);
    expect(pubPicking.nextRoundCountdownEndsAt).toBeUndefined();
  });

  it("clears next-round readiness fields after server advance", () => {
    const room = createRoomForP1("s1");
    joinRoomAsP2(room, "s2");
    room.gameState = { ...room.gameState, phase: "ROUND_END" };
    room.status = "ROUND_END";
    room.nextRoundReady.P1 = true;

    expect(toPublicRoomState(room).p1NextReady).toBe(true);

    advanceOnlineRoomToNextRound(room);
    const pub = toPublicRoomState(room);
    expect(pub.p1NextReady).toBe(false);
    expect(pub.p2NextReady).toBe(false);
    expect(pub.gameState.phase).toBe("P1_PICK");
  });
});

describe("purgeStaleRooms", () => {
  it("removes rooms when nobody is connected and updatedAt is past TTL", () => {
    const room = createRoomForP1("purge-a");
    joinRoomAsP2(room, "purge-b");
    markDisconnected(room, "P1");
    markDisconnected(room, "P2");
    room.updatedAt = Date.now() - 120_000;
    expect(purgeStaleRooms(Date.now(), 60_000)).toBeGreaterThanOrEqual(1);
    expect(getRoom(room.roomCode)).toBeUndefined();
  });

  it("keeps room while at least one player is connected", () => {
    const room = createRoomForP1("live-a");
    joinRoomAsP2(room, "live-b");
    room.updatedAt = Date.now() - 120_000;
    expect(purgeStaleRooms(Date.now(), 60_000)).toBe(0);
    expect(getRoom(room.roomCode)).toBeDefined();
  });
});
