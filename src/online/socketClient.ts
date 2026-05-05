"use client";

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
