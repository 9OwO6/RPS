"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { Socket } from "socket.io-client";

import { ArenaBackdrop } from "@/components/ArenaBackdrop";
import { SoundToggle } from "@/components/SoundToggle";
import type {
  ErrorMessagePayload,
  PlayerLeftPayload,
  PublicOnlineRoomState,
  RoomCreatedPayload,
  RoomJoinedPayload,
  RoomRejoinedPayload,
  RoomStatePayload,
} from "@/online/onlineTypes";
import {
  clearOnlineSession,
  loadOnlineSession,
  saveOnlineSession,
  type OnlineSessionPersisted,
} from "@/online/onlineSession";
import { resolveSocketUrl } from "@/online/socketClient";

type ConnectionState = "connecting" | "connected" | "disconnected" | "error";

interface OnlineLobbyScreenProps {
  socket: Socket;
  onBack: () => void;
  onEnterBattle: (ctx: {
    roomCode: string;
    playerId: "P1" | "P2";
    roomState: PublicOnlineRoomState;
  }) => void;
}

export function OnlineLobbyScreen({
  socket,
  onBack,
  onEnterBattle,
}: OnlineLobbyScreenProps) {
  const [connection, setConnection] = useState<ConnectionState>("connecting");
  const [myRole, setMyRole] = useState<"P1" | "P2" | null>(null);
  const [roomCodeInput, setRoomCodeInput] = useState("");
  const [roomState, setRoomState] = useState<PublicOnlineRoomState | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<{
    message: string;
    code?: string;
  } | null>(null);
  const [savedSession, setSavedSession] =
    useState<OnlineSessionPersisted | null>(null);

  const persistSession = useCallback((session: OnlineSessionPersisted) => {
    saveOnlineSession(session);
    setSavedSession(session);
  }, []);

  const wipeSession = useCallback(() => {
    clearOnlineSession();
    setSavedSession(null);
  }, []);

  useEffect(() => {
    setSavedSession(loadOnlineSession());
  }, []);

  useEffect(() => {
    const onConnect = () => {
      setConnection("connected");
      setError(null);
    };
    const onDisconnect = () => {
      setConnection("disconnected");
    };
    const onConnectError = () => {
      setConnection("error");
      setError({
        message: "Could not connect to online room server.",
        code: "CONNECT_ERROR",
      });
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);

    socket.on("room_created", (payload: RoomCreatedPayload) => {
      setMyRole(payload.playerId);
      setRoomState(payload.roomState);
      persistSession({
        roomCode: payload.roomCode,
        playerId: payload.playerId,
        playerToken: payload.playerToken,
      });
      setNotice("Room created. Waiting for opponent to join.");
      setError(null);
    });

    socket.on("room_joined", (payload: RoomJoinedPayload) => {
      setMyRole(payload.playerId);
      setRoomState(payload.roomState);
      persistSession({
        roomCode: payload.roomCode,
        playerId: payload.playerId,
        playerToken: payload.playerToken,
      });
      setNotice("Joined room successfully.");
      setError(null);
    });

    socket.on("room_rejoined", (payload: RoomRejoinedPayload) => {
      setMyRole(payload.playerId);
      setRoomState(payload.roomState);
      persistSession({
        roomCode: payload.roomCode,
        playerId: payload.playerId,
        playerToken: payload.playerToken,
      });
      setNotice("Reconnected to your seat.");
      setError(null);
      onEnterBattle({
        roomCode: payload.roomCode,
        playerId: payload.playerId,
        roomState: payload.roomState,
      });
    });

    socket.on("room_state", (payload: RoomStatePayload) => {
      setRoomState(payload.roomState);
    });

    socket.on("player_left", (payload: PlayerLeftPayload) => {
      setNotice(`Player ${payload.playerId} left the room.`);
    });

    socket.on("error_message", (payload: ErrorMessagePayload) => {
      setError({ message: payload.message, code: payload.code });
      if (payload.code === "REJOIN_FAILED") {
        wipeSession();
      }
    });

    if (socket.connected) setConnection("connected");

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("room_created");
      socket.off("room_joined");
      socket.off("room_rejoined");
      socket.off("room_state");
      socket.off("player_left");
      socket.off("error_message");
    };
  }, [onEnterBattle, persistSession, socket, wipeSession]);

  const waitingForOpponent = useMemo(() => {
    if (!roomState) return false;
    return roomState.status === "WAITING" || !roomState.players.P2;
  }, [roomState]);

  const canEnterBattle = useMemo(() => {
    if (!roomState || !myRole) return false;
    return (
      !waitingForOpponent &&
      roomState.players.P1?.connected &&
      roomState.players.P2?.connected
    );
  }, [roomState, myRole, waitingForOpponent]);

  const createRoom = () => {
    setNotice(null);
    setError(null);
    socket.emit("create_room", {});
  };

  const joinRoom = () => {
    const roomCode = roomCodeInput.trim().toUpperCase();
    if (!roomCode) {
      setError({
        message: "Enter a room code first.",
        code: "CLIENT_VALIDATION",
      });
      return;
    }
    setNotice(null);
    setError(null);
    socket.emit("join_room", { roomCode });
  };

  const leaveRoom = () => {
    if (roomState?.roomCode) {
      socket.emit("leave_room", { roomCode: roomState.roomCode });
    }
    wipeSession();
    setRoomState(null);
    setMyRole(null);
    setNotice(null);
    setError(null);
  };

  const handleBackToStart = () => {
    if (roomState?.roomCode) {
      socket.emit("leave_room", { roomCode: roomState.roomCode });
    }
    wipeSession();
    onBack();
  };

  const rejoinLastRoom = () => {
    const s = savedSession ?? loadOnlineSession();
    if (!s) {
      setError({
        message: "No saved online session.",
        code: "CLIENT_VALIDATION",
      });
      return;
    }
    setNotice(null);
    setError(null);
    socket.emit("rejoin_room", {
      roomCode: s.roomCode,
      playerId: s.playerId,
      playerToken: s.playerToken,
    });
  };

  const connectionLabel =
    connection === "connecting"
      ? "Connecting..."
      : connection === "connected"
        ? "Connected"
        : connection === "disconnected"
          ? "Disconnected"
          : "Connection error";

  return (
    <div className="relative z-10 min-h-screen">
      <ArenaBackdrop />

      <div className="pointer-events-none absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
        <div className="pointer-events-auto">
          <SoundToggle />
        </div>
      </div>

      <main className="relative mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 pb-12 pt-10 sm:pt-14">
        <header>
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.38em] text-amber-600/90">
            Online duel
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-white">
            Room Lobby
          </h1>
          <p className="mt-2 max-w-xl text-sm text-slate-400">
            Create or join a room. When both duelists are present, enter the arena.
          </p>
        </header>

        {savedSession ? (
          <section className="rounded-xl border border-amber-900/40 bg-amber-950/20 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-400">
              Reconnect
            </p>
            <p className="mt-2 text-sm text-slate-200">
              Last room:{" "}
              <span className="font-mono font-black tracking-wider text-amber-200">
                {savedSession.roomCode}
              </span>
              <span className="text-slate-400"> · You were </span>
              <span className="font-semibold text-white">
                {savedSession.playerId}
              </span>
            </p>
            <button
              type="button"
              onClick={rejoinLastRoom}
              className="mt-3 rounded-xl border border-amber-600/60 bg-amber-950/40 px-4 py-2 text-xs font-bold uppercase tracking-widest text-amber-100 transition hover:border-amber-400"
            >
              Rejoin Last Room
            </button>
          </section>
        ) : null}

        <section className="rounded-xl border border-slate-800/80 bg-slate-950/55 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Server
          </p>
          <p className="mt-1 text-sm text-slate-300">{resolveSocketUrl()}</p>
          <p className="mt-2 text-sm text-slate-400">
            Status:{" "}
            <span className="font-semibold text-slate-200">{connectionLabel}</span>
          </p>
        </section>

        <section className="grid gap-3 rounded-xl border border-slate-800/80 bg-slate-950/55 p-4 sm:grid-cols-[1fr_auto]">
          <button
            type="button"
            onClick={createRoom}
            className="rounded-xl border border-amber-700/50 bg-amber-950/35 px-4 py-3 text-sm font-bold uppercase tracking-widest text-amber-100 transition hover:border-amber-500"
          >
            Create Room
          </button>
          <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
            <input
              value={roomCodeInput}
              onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
              placeholder="Enter room code"
              className="rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 outline-none focus:border-amber-600/70"
            />
            <button
              type="button"
              onClick={joinRoom}
              className="rounded-lg border border-slate-600 bg-slate-900/90 px-3 py-2 text-sm font-bold uppercase tracking-widest text-slate-200 transition hover:border-amber-700/50"
            >
              Join
            </button>
          </div>
        </section>

        {roomState ? (
          <section className="rounded-xl border border-slate-800/80 bg-slate-950/55 p-4 text-sm text-slate-300">
            <p>
              Room Code:{" "}
              <span className="font-black tracking-wider text-amber-200">
                {roomState.roomCode}
              </span>
            </p>
            <p className="mt-1">
              Role:{" "}
              <span className="font-semibold text-slate-100">
                {myRole ? `You are ${myRole}` : "Unassigned"}
              </span>
            </p>
            <p className="mt-1">
              Room Status:{" "}
              <span className="font-semibold text-slate-100">{roomState.status}</span>
            </p>
            <p className="mt-1">
              Opponent:{" "}
              <span className="font-semibold text-slate-100">
                {waitingForOpponent ? "Waiting for player 2..." : "Both players joined."}
              </span>
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={leaveRoom}
                className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs font-bold uppercase tracking-widest text-slate-200 transition hover:border-amber-700/50"
              >
                Leave Room
              </button>
              {canEnterBattle ? (
                <button
                  type="button"
                  onClick={() => {
                    if (!myRole || !roomState) return;
                    onEnterBattle({
                      roomCode: roomState.roomCode,
                      playerId: myRole,
                      roomState,
                    });
                  }}
                  className="rounded-lg border border-amber-700/50 bg-amber-950/40 px-3 py-2 text-xs font-bold uppercase tracking-widest text-amber-100 transition hover:border-amber-500"
                >
                  Enter Online Duel
                </button>
              ) : null}
            </div>
          </section>
        ) : null}

        {notice ? (
          <p className="rounded-lg border border-slate-800/80 bg-slate-950/45 px-3 py-2 text-sm text-slate-300">
            {notice}
          </p>
        ) : null}
        {error ? (
          <div className="rounded-lg border border-red-900/50 bg-red-950/20 px-3 py-2 text-sm text-red-200">
            <p>{error.message}</p>
            {error.code ? (
              <p className="mt-1 font-mono text-xs text-red-300/85">{error.code}</p>
            ) : null}
          </div>
        ) : null}

        <button
          type="button"
          onClick={handleBackToStart}
          className="mt-2 self-start rounded-xl border border-slate-600 bg-slate-800/90 px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-100 hover:border-amber-500/50"
        >
          Back to Start
        </button>
      </main>
    </div>
  );
}
