"use client";

/**
 * Online Duel socket API (Phase 5C/5D):
 * Client → Server: create_room, join_room, rejoin_room, leave_room, submit_action,
 * next_round, restart_match.
 * Server → Client: room_created, room_joined, room_rejoined, room_state, action_locked,
 * round_resolved, match_restarted, player_left, error_message.
 */
import { io, type Socket } from "socket.io-client";

export function resolveSocketUrl(): string {
  const env = process.env.NEXT_PUBLIC_SOCKET_URL?.trim();
  if (env) return env;
  return "http://localhost:3001";
}

export function createOnlineSocket(): Socket {
  return io(resolveSocketUrl(), {
    autoConnect: true,
    transports: ["websocket", "polling"],
  });
}
