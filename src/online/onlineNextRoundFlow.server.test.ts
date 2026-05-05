import { afterEach, describe, expect, it, vi } from "vitest";

import {
  advanceOnlineRoomToNextRound,
  clearNextRoundCountdown,
  createRoomForP1,
  ensureNextRoundRoomShape,
  joinRoomAsP2,
  markNextRoundReady,
  scheduleNextRoundCountdownIfNeeded,
  strictBothPlayersReadyForNextRound,
  toPublicRoomState,
} from "../../server/src/rooms.ts";

function setupRoundEndRoomTwoPlayers() {
  const room = createRoomForP1("sock-p1");
  joinRoomAsP2(room, "sock-p2");
  room.gameState = { ...room.gameState, phase: "ROUND_END" };
  room.status = "ROUND_END";
  return room;
}

describe("online next-round ready flow (server)", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("one player ready does not advance phase immediately", () => {
    vi.useFakeTimers();
    const room = setupRoundEndRoomTwoPlayers();
    expect(markNextRoundReady(room, "P1")).toEqual({ ok: true });
    expect(strictBothPlayersReadyForNextRound(room)).toBe(false);
    expect(room.gameState.phase).toBe("ROUND_END");

    const onExpire = vi.fn();
    scheduleNextRoundCountdownIfNeeded(room, onExpire);
    expect(onExpire).not.toHaveBeenCalled();

    vi.advanceTimersByTime(4999);
    expect(onExpire).not.toHaveBeenCalled();

    vi.advanceTimersByTime(2);
    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it("public room state after one ready exposes flags and countdown end time", () => {
    vi.useFakeTimers();
    const nowSpy = vi.spyOn(Date, "now").mockReturnValue(1_000_000);
    const room = setupRoundEndRoomTwoPlayers();
    markNextRoundReady(room, "P1");
    scheduleNextRoundCountdownIfNeeded(room, vi.fn());

    const pub = toPublicRoomState(room);
    expect(pub.p1NextReady).toBe(true);
    expect(pub.p2NextReady).toBe(false);
    expect(pub.gameState.phase).toBe("ROUND_END");
    expect(pub.status).toBe("ROUND_END");
    expect(pub.nextRoundCountdownEndsAt).toBe(1_000_000 + 5000);

    nowSpy.mockRestore();
  });

  it("both strictly ready advances immediately when countdown is cleared (timer path)", () => {
    vi.useFakeTimers();
    const room = setupRoundEndRoomTwoPlayers();
    const spy = vi.fn();

    markNextRoundReady(room, "P1");
    scheduleNextRoundCountdownIfNeeded(room, spy);

    markNextRoundReady(room, "P2");
    expect(strictBothPlayersReadyForNextRound(room)).toBe(true);

    clearNextRoundCountdown(room);
    advanceOnlineRoomToNextRound(room);

    expect(room.gameState.phase).toBe("P1_PICK");
    expect(room.status).toBe("IN_GAME");

    vi.advanceTimersByTime(120_000);
    expect(spy).not.toHaveBeenCalled();
  });

  it("countdown expiry alone advances via callback side effect on room", () => {
    vi.useFakeTimers();
    const room = setupRoundEndRoomTwoPlayers();
    markNextRoundReady(room, "P1");

    scheduleNextRoundCountdownIfNeeded(room, () => {
      clearNextRoundCountdown(room);
      advanceOnlineRoomToNextRound(room);
    });

    expect(room.gameState.phase).toBe("ROUND_END");
    vi.advanceTimersByTime(5000);
    expect(room.gameState.phase).toBe("P1_PICK");
  });

  it("toPublicRoomState still does not expose raw pending InputAction values", () => {
    const room = createRoomForP1("sock-a");
    room.pendingActions.p1 = "SCISSORS";
    room.pendingActions.p2 = "PAPER";
    room.pendingActions.p1Locked = true;
    room.pendingActions.p2Locked = true;

    const pub = toPublicRoomState(room);
    const json = JSON.stringify(pub);
    expect(json).not.toContain('"SCISSORS"');
    expect(json).not.toContain('"PAPER"');
    expect(pub).not.toHaveProperty("pendingActions");
  });

  it("ensureNextRoundRoomShape rejects truthy non-boolean ready slots", () => {
    const room = setupRoundEndRoomTwoPlayers();
    Object.assign(room, {
      nextRoundReady: { P1: "truthy" as unknown as boolean, P2: false },
    });
    ensureNextRoundRoomShape(room);
    expect(room.nextRoundReady).toEqual({ P1: false, P2: false });

    markNextRoundReady(room, "P1");
    expect(strictBothPlayersReadyForNextRound(room)).toBe(false);
    expect(room.nextRoundReady.P1 === true && room.nextRoundReady.P2 === true).toBe(
      false,
    );
  });
});
