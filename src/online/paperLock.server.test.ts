import { describe, expect, it } from "vitest";

import {
  createRoomForP1,
  joinRoomAsP2,
  submitActionForPlayer,
  toPublicRoomState,
} from "../../server/src/rooms.ts";

describe("online paper lock validation", () => {
  it("rejects Paper when paperStreak >= 2", () => {
    const room = createRoomForP1("sock-p1");
    joinRoomAsP2(room, "sock-p2");
    room.gameState.p1.paperStreak = 2;

    const out = submitActionForPlayer(room, "P1", "PAPER");
    expect(out.ok).toBe(false);
    if (out.ok) return;
    expect(out.code).toBe("PAPER_LOCKED");
  });

  it("public room state does not expose pending actions or playerToken", () => {
    const room = createRoomForP1("sock-a");
    joinRoomAsP2(room, "sock-b");
    room.pendingActions.p1 = "SCISSORS";
    room.pendingActions.p2 = "ROCK";
    const pub = toPublicRoomState(room);
    const json = JSON.stringify(pub);
    expect(json).not.toContain("pendingActions");
    expect(json).not.toContain("playerToken");
    expect(json).not.toContain('"SCISSORS"');
    expect(json).not.toContain('"ROCK"');
  });
});

