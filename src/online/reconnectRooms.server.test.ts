import { describe, expect, it } from "vitest";

import {
  createRoomForP1,
  generatePlayerToken,
  getRoom,
  joinRoomAsP2,
  markDisconnected,
  normalizePartialOccupancy,
  purgeStaleRooms,
  reapExpiredDisconnectedSeats,
  removePlayerFromRoom,
  toPublicRoomState,
  tryRejoinSeat,
} from "../../server/src/rooms.ts";

describe("online reconnect & seats", () => {
  it("rejoin with valid token reclaims seat without resetting gameState", () => {
    const room = createRoomForP1("sock-p1");
    joinRoomAsP2(room, "sock-p2");
    room.gameState = {
      ...room.gameState,
      p1: { ...room.gameState.p1, hp: 7 },
    };

    const p1Token = room.players.P1!.playerToken;
    markDisconnected(room, "P1");

    const ok = tryRejoinSeat(room, "P1", p1Token, "sock-p1-new");
    expect(ok).toEqual({ ok: true });
    expect(room.players.P1?.connected).toBe(true);
    expect(room.players.P1?.socketId).toBe("sock-p1-new");
    expect(room.players.P1?.disconnectedAt).toBeUndefined();
    expect(room.gameState.p1.hp).toBe(7);
  });

  it("rejoin with invalid token fails", () => {
    const room = createRoomForP1("a");
    joinRoomAsP2(room, "b");
    markDisconnected(room, "P1");
    const bad = tryRejoinSeat(room, "P1", "wrong-token", "z");
    expect(bad.ok).toBe(false);
    if (bad.ok) throw new Error("expected failure");
    expect(bad.code).toBe("REJOIN_FAILED");
  });

  it("join_room rejects taking a disconnected seat without token", () => {
    const room = createRoomForP1("p1");
    joinRoomAsP2(room, "p2");
    markDisconnected(room, "P2");
    const stranger = joinRoomAsP2(room, "p3");
    expect(stranger.ok).toBe(false);
    if (stranger.ok) throw new Error("expected failure");
    expect(stranger.code).toBe("SEAT_RESERVED");
  });

  it("after grace reaps disconnected seat, stranger may join as P2", () => {
    const room = createRoomForP1("x1");
    joinRoomAsP2(room, "x2");
    markDisconnected(room, "P2");
    room.players.P2!.disconnectedAt = Date.now() - 400_000;

    reapExpiredDisconnectedSeats(room, Date.now(), 300_000);
    normalizePartialOccupancy(room);

    expect(room.players.P2).toBeUndefined();
    const joined = joinRoomAsP2(room, "x3");
    expect(joined.ok).toBe(true);
    expect(room.players.P2?.socketId).toBe("x3");
  });

  it("intentional leave removes seat so join can succeed", () => {
    const room = createRoomForP1("h1");
    joinRoomAsP2(room, "h2");
    removePlayerFromRoom(room, "P2");
    const j = joinRoomAsP2(room, "h3");
    expect(j.ok).toBe(true);
  });

  it("public room state never exposes playerToken", () => {
    const room = createRoomForP1("t1");
    joinRoomAsP2(room, "t2");
    const pub = toPublicRoomState(room);
    const json = JSON.stringify(pub);
    expect(json).not.toContain("playerToken");
    expect(pub.players.P1?.playerId).toBe("P1");
  });

  it("purgeStaleRooms still removes idle rooms with nobody connected", () => {
    const room = createRoomForP1("s1");
    joinRoomAsP2(room, "s2");
    markDisconnected(room, "P1");
    markDisconnected(room, "P2");
    room.updatedAt = Date.now() - 120_000;
    expect(purgeStaleRooms(Date.now(), 60_000)).toBeGreaterThanOrEqual(1);
    expect(getRoom(room.roomCode)).toBeUndefined();
  });
});

describe("generatePlayerToken", () => {
  it("produces distinct tokens", () => {
    expect(generatePlayerToken()).not.toBe(generatePlayerToken());
  });
});
