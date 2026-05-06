"use client";

import { useCallback, useEffect, useState } from "react";
import type { Socket } from "socket.io-client";

import type { PublicOnlineRoomState } from "@/online/onlineTypes";
import { createOnlineSocket } from "@/online/socketClient";

import { OnlineBattleScreen } from "@/components/OnlineBattleScreen";
import { OnlineLobbyScreen } from "@/components/OnlineLobbyScreen";
import { useI18n } from "@/i18n/useI18n";

interface OnlineDuelRouteProps {
  onBackToStart: () => void;
}

export function OnlineDuelRoute({ onBackToStart }: OnlineDuelRouteProps) {
  const { t } = useI18n();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [phase, setPhase] = useState<"lobby" | "battle">("lobby");
  const [battleCtx, setBattleCtx] = useState<{
    roomCode: string;
    playerId: "P1" | "P2";
    roomState: PublicOnlineRoomState;
  } | null>(null);

  useEffect(() => {
    const s = createOnlineSocket();
    setSocket(s);
    return () => {
      s.removeAllListeners();
      s.disconnect();
    };
  }, []);

  const enterBattle = useCallback(
    (ctx: {
      roomCode: string;
      playerId: "P1" | "P2";
      roomState: PublicOnlineRoomState;
    }) => {
      setBattleCtx(ctx);
      setPhase("battle");
    },
    [],
  );

  if (!socket) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-sm text-slate-400">
        {t("online.bootLoading")}
      </div>
    );
  }

  if (phase === "battle" && battleCtx) {
    return (
      <OnlineBattleScreen
        socket={socket}
        roomCode={battleCtx.roomCode}
        playerId={battleCtx.playerId}
        initialRoomState={battleCtx.roomState}
        onLeaveOnlineMode={() => {
          onBackToStart();
        }}
        onBackToLobby={() => {
          setBattleCtx(null);
          setPhase("lobby");
        }}
      />
    );
  }

  return (
      <OnlineLobbyScreen
      socket={socket}
      onBack={() => {
        onBackToStart();
      }}
      onEnterBattle={enterBattle}
    />
  );
}
