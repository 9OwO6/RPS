"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { ArenaBackdrop } from "@/components/ArenaBackdrop";
import { SoundToggle } from "@/components/SoundToggle";
import { createOnlineSocket, resolveSocketUrl } from "@/online/socketClient";
import type {
  ErrorMessagePayload,
  PlayerLeftPayload,
  PublicOnlineRoomState,
  RoomCreatedPayload,
  RoomJoinedPayload,
  RoomStatePayload,
} from "@/online/onlineTypes";

type ConnectionState = "connecting" | "connected" | "disconnected" | "error";

interface OnlineLobbyScreenProps {
  onBack: () => void;
}

export function OnlineLobbyScreen({ onBack }: OnlineLobbyScreenProps) {
  const socketRef = useRef<ReturnType<typeof createOnlineSocket> | null>(null);
  const [connection, setConnection] = useState<ConnectionState>("connecting");
  const [myRole, setMyRole] = useState<"P1" | "P2" | null>(null);
  const [roomCodeInput, setRoomCodeInput] = useState("");
  const [roomState, setRoomState] = useState<PublicOnlineRoomState | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const socket = createOnlineSocket();
    socketRef.current = socket;

    const onConnect = () => {
      setConnection("connected");
      setError(null);
    };
    const onDisconnect = () => {
      setConnection("disconnected");
    };
    const onConnectError = () => {
      setConnection("error");
      setError("Could not connect to online room server.");
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);

    socket.on("room_created", (payload: RoomCreatedPayload) => {
      setMyRole(payload.playerId);
      setRoomState(payload.roomState);
      setNotice("Room created. Waiting for opponent to join.");
      setError(null);
    });

    socket.on("room_joined", (payload: RoomJoinedPayload) => {
      setMyRole(payload.playerId);
      setRoomState(payload.roomState);
      setNotice("Joined room successfully.");
      setError(null);
    });

    socket.on("room_state", (payload: RoomStatePayload) => {
      setRoomState(payload.roomState);
      setError(null);
    });

    socket.on("player_left", (payload: PlayerLeftPayload) => {
      setNotice(`Player ${payload.playerId} left the room.`);
    });

    socket.on("error_message", (payload: ErrorMessagePayload) => {
      setError(payload.message);
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const waitingForOpponent = useMemo(() => {
    if (!roomState) return false;
    return roomState.status === "WAITING" || !roomState.players.P2;
  }, [roomState]);

  const createRoom = () => {
    setNotice(null);
    setError(null);
    socketRef.current?.emit("create_room", {});
  };

  const joinRoom = () => {
    const roomCode = roomCodeInput.trim().toUpperCase();
    if (!roomCode) {
      setError("Enter a room code first.");
      return;
    }
    setNotice(null);
    setError(null);
    socketRef.current?.emit("join_room", { roomCode });
  };

  const leaveRoom = () => {
    if (roomState?.roomCode) {
      socketRef.current?.emit("leave_room", { roomCode: roomState.roomCode });
    }
    setRoomState(null);
    setMyRole(null);
    setNotice(null);
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
            Create a room code or join an existing one. This phase supports room
            setup only.
          </p>
        </header>

        <section className="rounded-xl border border-slate-800/80 bg-slate-950/55 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Server
          </p>
          <p className="mt-1 text-sm text-slate-300">{resolveSocketUrl()}</p>
          <p className="mt-2 text-sm text-slate-400">
            Status: <span className="font-semibold text-slate-200">{connectionLabel}</span>
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
              Room Code: <span className="font-black tracking-wider text-amber-200">{roomState.roomCode}</span>
            </p>
            <p className="mt-1">
              Role: <span className="font-semibold text-slate-100">{myRole ? `You are ${myRole}` : "Unassigned"}</span>
            </p>
            <p className="mt-1">
              Room Status: <span className="font-semibold text-slate-100">{roomState.status}</span>
            </p>
            <p className="mt-1">
              Opponent:{" "}
              <span className="font-semibold text-slate-100">
                {waitingForOpponent ? "Waiting for player 2..." : "Both players joined."}
              </span>
            </p>
            <button
              type="button"
              onClick={leaveRoom}
              className="mt-3 rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs font-bold uppercase tracking-widest text-slate-200 transition hover:border-amber-700/50"
            >
              Leave Room
            </button>
          </section>
        ) : null}

        {notice ? (
          <p className="rounded-lg border border-slate-800/80 bg-slate-950/45 px-3 py-2 text-sm text-slate-300">
            {notice}
          </p>
        ) : null}
        {error ? (
          <p className="rounded-lg border border-red-900/50 bg-red-950/20 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        ) : null}

        <button
          type="button"
          onClick={onBack}
          className="mt-2 self-start rounded-xl border border-slate-600 bg-slate-800/90 px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-100 hover:border-amber-500/50"
        >
          Back to Start
        </button>
      </main>
    </div>
  );
}
