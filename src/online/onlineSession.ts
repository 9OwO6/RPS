"use client";

export const RPS_ONLINE_SESSION_KEY = "rps-online-session";

export interface OnlineSessionPersisted {
  roomCode: string;
  playerId: "P1" | "P2";
  playerToken: string;
}

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function saveOnlineSession(session: OnlineSessionPersisted): void {
  if (!canUseStorage()) return;
  try {
    localStorage.setItem(RPS_ONLINE_SESSION_KEY, JSON.stringify(session));
  } catch {
    /* ignore quota / private mode */
  }
}

export function loadOnlineSession(): OnlineSessionPersisted | null {
  if (!canUseStorage()) return null;
  try {
    const raw = localStorage.getItem(RPS_ONLINE_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<OnlineSessionPersisted>;
    if (
      typeof parsed.roomCode !== "string" ||
      (parsed.playerId !== "P1" && parsed.playerId !== "P2") ||
      typeof parsed.playerToken !== "string" ||
      parsed.playerToken.length < 8
    ) {
      return null;
    }
    return {
      roomCode: parsed.roomCode.trim().toUpperCase(),
      playerId: parsed.playerId,
      playerToken: parsed.playerToken,
    };
  } catch {
    return null;
  }
}

export function clearOnlineSession(): void {
  if (!canUseStorage()) return;
  try {
    localStorage.removeItem(RPS_ONLINE_SESSION_KEY);
  } catch {
    /* ignore */
  }
}
