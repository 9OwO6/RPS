"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";

import type { Socket } from "socket.io-client";

import { useSound } from "@/audio/SoundContext";
import { ActionButtons } from "@/components/ActionButtons";
import { CollapsibleBattleLog } from "@/components/CollapsibleBattleLog";
import { CombatReveal } from "@/components/CombatReveal";
import { DamageFloat } from "@/components/DamageFloat";
import { GameOverPanel } from "@/components/GameOverPanel";
import { PlayerPanel } from "@/components/PlayerPanel";
import { RoundResultSummary } from "@/components/RoundResultSummary";
import { SoundToggle } from "@/components/SoundToggle";
import type { RoundSummary } from "@/components/roundSummary";
import { buildRoundSummary } from "@/components/roundSummary";
import type { GameState, InputAction, PlayerId } from "@/game/types";
import { ASSETS } from "@/lib/assetPaths";
import { getBattleFeedback } from "@/presentation/battleFeedback";
import { getCombatAnimationType } from "@/presentation/combatAnimation";
import {
  getDamageFloatAccentForVictim,
  getDamageFloatTier,
} from "@/presentation/combatMotion";
import type {
  ActionLockedPayload,
  ErrorMessagePayload,
  MatchRestartedPayload,
  PlayerLeftPayload,
  PublicOnlineRoomState,
  RoundResolvedPayload,
  RoomStatePayload,
} from "@/online/onlineTypes";
import { clearOnlineSession } from "@/online/onlineSession";

interface OnlineBattleScreenProps {
  socket: Socket;
  roomCode: string;
  playerId: PlayerId;
  initialRoomState: PublicOnlineRoomState;
  /** Leave room and return to main menu. */
  onLeaveOnlineMode: () => void;
  /** Leave room and return to online lobby (same socket). */
  onBackToLobby: () => void;
}

export function OnlineBattleScreen({
  socket,
  roomCode,
  playerId,
  initialRoomState,
  onLeaveOnlineMode,
  onBackToLobby,
}: OnlineBattleScreenProps) {
  const [roomState, setRoomState] =
    useState<PublicOnlineRoomState>(initialRoomState);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<{
    message: string;
    code?: string;
  } | null>(null);
  const [selected, setSelected] = useState<InputAction | null>(null);
  const [combatFrame, setCombatFrame] = useState<{
    prev: GameState;
    next: GameState;
  } | null>(null);
  const [roundSummary, setRoundSummary] = useState<RoundSummary | null>(null);

  const roomCodeUpper = roomCode.trim().toUpperCase();
  const game = roomState.gameState;

  const opponentId: PlayerId = playerId === "P1" ? "P2" : "P1";
  const opponentConn = roomState.players[opponentId];

  useEffect(() => {
    const onRoomState = (payload: RoomStatePayload) => {
      if (payload.roomState.roomCode !== roomCodeUpper) return;
      setRoomState(payload.roomState);
      const opp = payload.roomState.players[opponentId];
      const oppDisconnectedNow =
        opp !== undefined && opp.connected === false;
      setError(
        oppDisconnectedNow
          ? {
              message:
                "Opponent disconnected. Waiting for reconnect…",
              code: "OPPONENT_DISCONNECTED",
            }
          : null,
      );
    };

    const onActionLocked = (payload: ActionLockedPayload) => {
      if (payload.roomCode !== roomCodeUpper) return;
      setRoomState((prev) =>
        prev.roomCode !== roomCodeUpper
          ? prev
          : {
              ...prev,
              p1Locked: payload.p1Locked,
              p2Locked: payload.p2Locked,
            },
      );
    };

    const onRoundResolved = (payload: RoundResolvedPayload) => {
      if (payload.roomCode !== roomCodeUpper) return;
      setRoomState(payload.roomState);
      setCombatFrame({
        prev: payload.previousGameState,
        next: payload.gameState,
      });
      setRoundSummary(
        buildRoundSummary(payload.previousGameState, payload.gameState),
      );
      setSelected(null);
      setError(null);
    };

    const onMatchRestarted = (payload: MatchRestartedPayload) => {
      if (payload.roomCode !== roomCodeUpper) return;
      setRoomState(payload.roomState);
      setCombatFrame(null);
      setRoundSummary(null);
      setSelected(null);
      setNotice(null);
      setError(null);
    };

    const onPlayerLeft = (payload: PlayerLeftPayload) => {
      if (payload.roomCode !== roomCodeUpper) return;
      setNotice(`Player ${payload.playerId} disconnected or left the room.`);
    };

    const onErr = (payload: ErrorMessagePayload) => {
      setError({ message: payload.message, code: payload.code });
    };

    socket.on("room_state", onRoomState);
    socket.on("action_locked", onActionLocked);
    socket.on("round_resolved", onRoundResolved);
    socket.on("match_restarted", onMatchRestarted);
    socket.on("player_left", onPlayerLeft);
    socket.on("error_message", onErr);

    return () => {
      socket.off("room_state", onRoomState);
      socket.off("action_locked", onActionLocked);
      socket.off("round_resolved", onRoundResolved);
      socket.off("match_restarted", onMatchRestarted);
      socket.off("player_left", onPlayerLeft);
      socket.off("error_message", onErr);
    };
  }, [socket, roomCodeUpper, opponentId]);

  useEffect(() => {
    if (roomState.status === "IN_GAME" && roomState.gameState.phase === "P1_PICK") {
      setCombatFrame(null);
      setRoundSummary(null);
    }
  }, [roomState.status, roomState.gameState.phase]);

  const picking =
    roomState.status === "IN_GAME" && roomState.gameState.phase === "P1_PICK";

  const localLocked =
    playerId === "P1" ? roomState.p1Locked : roomState.p2Locked;
  const opponentLocked =
    playerId === "P1" ? roomState.p2Locked : roomState.p1Locked;

  const opponentDisconnected =
    opponentConn !== undefined && opponentConn.connected === false;

  const localSnap = playerId === "P1" ? game.p1 : game.p2;
  const oppSnap = playerId === "P1" ? game.p2 : game.p1;

  const showRoundLedger =
    (game.phase === "ROUND_END" || game.phase === "GAME_OVER") &&
    combatFrame !== null &&
    roundSummary !== null;

  const battleFeedback = useMemo(() => {
    if (!combatFrame) return null;
    return getBattleFeedback(combatFrame.prev, combatFrame.next);
  }, [combatFrame]);

  const oppDamage =
    battleFeedback !== null
      ? opponentId === "P2"
        ? battleFeedback.p2Damage
        : battleFeedback.p1Damage
      : 0;

  const localDamage =
    battleFeedback !== null
      ? playerId === "P2"
        ? battleFeedback.p2Damage
        : battleFeedback.p1Damage
      : 0;

  const oppHit =
    battleFeedback !== null
      ? opponentId === "P2"
        ? battleFeedback.p2Hit
        : battleFeedback.p1Hit
      : false;

  const localHit =
    battleFeedback !== null
      ? playerId === "P2"
        ? battleFeedback.p2Hit
        : battleFeedback.p1Hit
      : false;

  const oppStaggerIntro =
    battleFeedback !== null
      ? opponentId === "P2"
        ? battleFeedback.p2BecameStaggered
        : battleFeedback.p1BecameStaggered
      : false;

  const localStaggerIntro =
    battleFeedback !== null
      ? playerId === "P2"
        ? battleFeedback.p2BecameStaggered
        : battleFeedback.p1BecameStaggered
      : false;

  const feedbackRoundKey = combatFrame?.next.roundNumber ?? 0;
  const feedbackNext = combatFrame?.next ?? null;

  const { pauseBgm, play, playBgm, stopEndStinger } = useSound();
  const endSoundRoundRef = useRef<number | null>(null);

  useEffect(() => {
    if (!showRoundLedger || !combatFrame || !battleFeedback) return;
    const anim = getCombatAnimationType(combatFrame.prev, combatFrame.next);
    const staggered =
      battleFeedback.p1BecameStaggered || battleFeedback.p2BecameStaggered;
    if (!staggered || anim === "STAGGER_SKIP") return;
    const id = window.setTimeout(() => {
      play("STAGGER");
    }, 230);
    return () => window.clearTimeout(id);
  }, [showRoundLedger, combatFrame, battleFeedback, play]);

  useEffect(() => {
    if (game.phase !== "GAME_OVER" || !game.winner) return;
    const resolvedRound = combatFrame?.next.roundNumber ?? game.roundNumber;
    if (endSoundRoundRef.current === resolvedRound) return;
    endSoundRoundRef.current = resolvedRound;
    pauseBgm();
    if (game.winner === "DRAW") {
      play("GAME_OVER");
      return;
    }
    if (game.winner === playerId) {
      play("GAME_WIN");
      return;
    }
    play("GAME_OVER");
  }, [
    combatFrame,
    game.phase,
    game.roundNumber,
    game.winner,
    pauseBgm,
    playerId,
    play,
  ]);

  const lockIn = useCallback(() => {
    if (
      !picking ||
      localLocked ||
      opponentDisconnected ||
      localSnap.state === "STAGGERED"
    ) {
      return;
    }
    if (selected === null) return;
    play("UI_CONFIRM");
    socket.emit("submit_action", {
      roomCode: roomCodeUpper,
      action: selected,
    });
  }, [
    localLocked,
    localSnap.state,
    opponentDisconnected,
    picking,
    play,
    roomCodeUpper,
    selected,
    socket,
  ]);

  const localNextReady =
    playerId === "P1" ? roomState.p1NextReady : roomState.p2NextReady;
  const opponentNextReady =
    playerId === "P1" ? roomState.p2NextReady : roomState.p1NextReady;

  const [, bumpCountdownTick] = useReducer((x: number) => x + 1, 0);

  useEffect(() => {
    if (
      roomState.nextRoundCountdownEndsAt === undefined ||
      opponentDisconnected ||
      game.phase !== "ROUND_END"
    ) {
      return;
    }
    const id = window.setInterval(() => {
      bumpCountdownTick();
    }, 250);
    return () => window.clearInterval(id);
  }, [game.phase, opponentDisconnected, roomState.nextRoundCountdownEndsAt]);

  const countdownSeconds =
    roomState.nextRoundCountdownEndsAt !== undefined &&
    game.phase === "ROUND_END"
      ? Math.max(
          0,
          Math.ceil(
            (roomState.nextRoundCountdownEndsAt - Date.now()) / 1000,
          ),
        )
      : null;

  const signalReadyForNextRound = useCallback(() => {
    if (game.phase !== "ROUND_END" || opponentDisconnected) return;
    if (playerId === "P1" ? roomState.p1NextReady : roomState.p2NextReady) {
      return;
    }
    play("UI_CONFIRM");
    socket.emit("next_round", { roomCode: roomCodeUpper });
  }, [
    game.phase,
    opponentDisconnected,
    playerId,
    play,
    roomCodeUpper,
    roomState.p1NextReady,
    roomState.p2NextReady,
    socket,
  ]);

  const restartMatch = useCallback(() => {
    endSoundRoundRef.current = null;
    stopEndStinger();
    play("UI_CONFIRM");
    socket.emit("restart_match", { roomCode: roomCodeUpper });
    playBgm();
  }, [play, playBgm, roomCodeUpper, socket, stopEndStinger]);

  const exitWithLeave = useCallback(() => {
    stopEndStinger();
    socket.emit("leave_room", { roomCode: roomCodeUpper });
    clearOnlineSession();
    onLeaveOnlineMode();
  }, [onLeaveOnlineMode, roomCodeUpper, socket, stopEndStinger]);

  const backToLobby = useCallback(() => {
    stopEndStinger();
    socket.emit("leave_room", { roomCode: roomCodeUpper });
    clearOnlineSession();
    onBackToLobby();
  }, [onBackToLobby, roomCodeUpper, socket, stopEndStinger]);

  const hudPrompt = useMemo(() => {
    if (opponentDisconnected)
      return "Opponent disconnected — waiting for reconnect…";
    if (game.phase === "GAME_OVER") return "Match settled.";
    if (!picking) {
      if (game.phase === "ROUND_END") {
        return "Round resolved — review the tableau, then signal when you are ready.";
      }
      return roomState.status;
    }
    if (localSnap.state === "STAGGERED") return "Staggered — server auto-resolves your lane.";
    if (localLocked && opponentLocked) return "Both duelists locked. Resolving…";
    if (localLocked) return "You locked in. Waiting for opponent…";
    return "Choose a legal maneuver, then lock in.";
  }, [
    game.phase,
    localLocked,
    localSnap.state,
    opponentDisconnected,
    opponentLocked,
    picking,
    roomState.status,
  ]);

  return (
    <div className="relative min-h-screen lg:flex lg:h-[100dvh] lg:max-h-[100dvh] lg:flex-col lg:overflow-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
        <Image
          src={ASSETS.duelArenaBg}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_30%]"
        />
        <div className="absolute inset-0 bg-slate-950/74" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/88 via-slate-950/50 to-slate-950/92" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_0%,rgba(251,191,36,0.06),transparent_55%)]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-1 flex-col gap-3 px-3 pb-28 pt-4 md:max-w-3xl lg:min-h-0 lg:gap-2 lg:overflow-hidden lg:px-5 lg:pb-2 lg:pt-2">
        <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3 lg:gap-2 lg:border-slate-800/60 lg:pb-2 lg:pt-0">
          <div className="min-w-0">
            <p className="text-[0.55rem] font-bold uppercase tracking-[0.35em] text-amber-600/90 lg:text-[0.5rem] lg:tracking-[0.32em]">
              Online duel · Room {roomCodeUpper}
            </p>
            <h1 className="truncate text-2xl font-black tracking-tight text-white md:text-3xl lg:text-xl lg:leading-tight">
              Tactical Duel
            </h1>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <SoundToggle compact />
            <button
              type="button"
              onClick={exitWithLeave}
              className="shrink-0 rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-[0.6rem] font-bold uppercase tracking-widest text-slate-200 hover:border-amber-900/70 lg:rounded-lg lg:px-2 lg:text-[0.55rem]"
            >
              Back to Start
            </button>
          </div>
        </header>

        {notice ? (
          <p className="rounded-lg border border-amber-900/40 bg-amber-950/25 px-3 py-2 text-xs text-amber-100 lg:text-[0.65rem]">
            {notice}
          </p>
        ) : null}
        {opponentDisconnected ? (
          <div className="rounded-lg border border-red-900/50 bg-red-950/25 px-3 py-3 text-xs text-red-100 lg:text-[0.65rem]">
            <p className="font-bold">
              Opponent disconnected. Waiting for reconnect…
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={backToLobby}
                className="rounded-lg border border-red-800/60 bg-red-950/40 px-3 py-2 text-[0.6rem] font-bold uppercase tracking-widest text-red-100 hover:border-amber-700/50 hover:text-amber-100"
              >
                Back to Online Lobby
              </button>
              <button
                type="button"
                onClick={exitWithLeave}
                className="rounded-lg border border-slate-600 bg-slate-900/90 px-3 py-2 text-[0.6rem] font-bold uppercase tracking-widest text-slate-200 hover:border-amber-700/50"
              >
                Back to Start
              </button>
            </div>
          </div>
        ) : null}
        {error && !opponentDisconnected ? (
          <div className="rounded-lg border border-red-900/40 bg-red-950/20 px-3 py-2 text-xs text-red-100 lg:text-[0.65rem]">
            <p>{error.message}</p>
            {error.code ? (
              <p className="mt-1 font-mono text-[0.55rem] text-red-300/80">
                {error.code}
              </p>
            ) : null}
          </div>
        ) : null}
        {picking ? (
          <ul className="rounded-lg border border-slate-800/70 bg-slate-950/35 px-3 py-2 text-[0.65rem] text-slate-400 lg:text-[0.6rem]">
            <li>
              You:{" "}
              <span className="font-semibold text-slate-200">
                {localLocked ? "Locked in" : "Selecting"}
              </span>
            </li>
            <li>
              Opponent:{" "}
              <span className="font-semibold text-slate-200">
                {opponentLocked ? "Locked in" : "Not locked"}
              </span>
            </li>
          </ul>
        ) : null}

        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-visible lg:min-h-0 lg:gap-1.5 lg:overflow-hidden">
          <div className="relative shrink-0">
            {showRoundLedger &&
            combatFrame &&
            battleFeedback &&
            oppDamage > 0 &&
            feedbackNext ? (
              <DamageFloat
                key={`df-top-${feedbackRoundKey}`}
                amount={oppDamage}
                tier={getDamageFloatTier(oppDamage)}
                accent={getDamageFloatAccentForVictim(
                  opponentId,
                  combatFrame.prev,
                  feedbackNext,
                )}
              />
            ) : null}
            <PlayerPanel
              duelSide="right"
              subtitle={`Opponent · ${opponentId}`}
              snapshot={oppSnap}
              isActiveTurn={false}
              layoutVariant="hero"
              arenaBand="opponent"
              resolveFeedback={
                showRoundLedger && combatFrame && battleFeedback
                  ? {
                      roundKey: feedbackRoundKey,
                      tookDamage: oppHit,
                      staggerIntro: oppStaggerIntro,
                      damageTaken: oppDamage,
                    }
                  : null
              }
            />
          </div>

          <section
            aria-label="Combat stage"
            className="flex min-h-[12rem] flex-1 flex-col rounded-2xl border border-amber-900/30 bg-slate-950/55 shadow-[0_0_56px_-18px_rgba(0,0,0,0.7)] backdrop-blur-md lg:min-h-0 lg:flex-[1_1_0%] lg:overflow-hidden lg:shadow-md"
          >
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-slate-800/70 px-3 py-2.5 md:px-4 lg:py-1.5">
              <span className="font-mono text-xs font-black tabular-nums text-white md:text-sm lg:text-[0.7rem]">
                Round {game.roundNumber}
              </span>
              <span className="max-w-[14rem] text-right text-[0.65rem] font-bold uppercase leading-snug tracking-wide text-amber-300/90 md:max-w-none md:text-xs lg:text-[0.58rem]">
                Online · {game.phase}
              </span>
            </div>
            <p className="shrink-0 border-b border-slate-800/50 px-3 py-2 text-[0.75rem] leading-relaxed text-slate-400 md:px-4 md:text-sm lg:py-1.5 lg:text-[0.68rem] lg:leading-snug">
              {hudPrompt}
            </p>

            <div className="battle-hud-scroll flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-y-contain p-3 [-webkit-overflow-scrolling:touch] md:gap-4 md:p-4 lg:min-h-0 lg:gap-2 lg:p-2">
              {showRoundLedger && combatFrame && roundSummary ? (
                <>
                  <CombatReveal
                    key={combatFrame.next.roundNumber}
                    prevState={combatFrame.prev}
                    nextState={combatFrame.next}
                    replayKey={combatFrame.next.roundNumber}
                  />
                  <RoundResultSummary
                    summary={roundSummary}
                    variant="embedded"
                  />
                </>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-800/80 bg-black/20 px-4 py-10 text-center lg:min-h-[6rem] lg:py-4">
                  <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-500">
                    Skirmish line
                  </p>
                  <p className="max-w-sm text-sm leading-relaxed text-slate-500 lg:max-w-md lg:text-xs">
                    Outcome tableau appears here once the server resolves the round.
                  </p>
                </div>
              )}
            </div>
          </section>

          <div className="relative shrink-0">
            {showRoundLedger &&
            combatFrame &&
            battleFeedback &&
            localDamage > 0 &&
            feedbackNext ? (
              <DamageFloat
                key={`df-bot-${feedbackRoundKey}`}
                amount={localDamage}
                tier={getDamageFloatTier(localDamage)}
                accent={getDamageFloatAccentForVictim(
                  playerId,
                  combatFrame.prev,
                  feedbackNext,
                )}
              />
            ) : null}
            <PlayerPanel
              duelSide="left"
              subtitle={`You · ${playerId}`}
              snapshot={localSnap}
              isActiveTurn={picking && !localLocked}
              layoutVariant="hero"
              arenaBand="local"
              resolveFeedback={
                showRoundLedger && combatFrame && battleFeedback
                  ? {
                      roundKey: feedbackRoundKey,
                      tookDamage: localHit,
                      staggerIntro: localStaggerIntro,
                      damageTaken: localDamage,
                    }
                  : null
              }
            />
          </div>

          <section
            aria-label="Maneuver selection"
            className="shrink-0 rounded-2xl border border-slate-800/90 bg-slate-950/60 p-3 shadow-xl backdrop-blur-md md:p-5 lg:p-2.5 lg:shadow-lg"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3 lg:pb-1.5">
              <h2 className="text-[0.65rem] font-black uppercase tracking-[0.32em] text-slate-500 lg:text-[0.58rem]">
                Maneuver deck
              </h2>
              {picking && !localLocked ? (
                <span className="rounded-md border border-amber-900/40 bg-amber-950/30 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-widest text-amber-300/90 lg:py-0 lg:text-[0.55rem]">
                  Lock when ready
                </span>
              ) : null}
            </div>

            <div className="mt-4 space-y-4 lg:mt-2 lg:space-y-2">
              {picking && localSnap.state !== "STAGGERED" ? (
                <>
                  <ActionButtons
                    variant="deck"
                    density="hud"
                    playerState={localSnap.state}
                    selected={selected}
                    onSelect={setSelected}
                    disabled={
                      localLocked || opponentDisconnected || !picking
                    }
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={
                        selected === null ||
                        localLocked ||
                        opponentDisconnected ||
                        !picking
                      }
                      onClick={lockIn}
                      className="rounded-xl bg-amber-500 px-6 py-2.5 text-xs font-black uppercase tracking-widest text-slate-950 shadow-lg transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-600 lg:rounded-lg lg:px-5 lg:py-2 lg:text-[0.65rem]"
                    >
                      Lock in maneuver
                    </button>
                  </div>
                </>
              ) : null}

              {picking && localSnap.state === "STAGGERED" ? (
                <p className="rounded-xl border border-red-900/40 bg-red-950/20 px-3 py-2.5 text-sm text-red-100">
                  Staggered — your lane locks automatically for this round.
                </p>
              ) : null}

              {game.phase === "ROUND_END" ? (
                <div className="space-y-3 rounded-xl border border-slate-800/80 bg-slate-950/40 p-3">
                  {!localNextReady ? (
                    <button
                      type="button"
                      disabled={opponentDisconnected}
                      onClick={signalReadyForNextRound}
                      className="rounded-xl border border-amber-700/50 bg-amber-950/30 px-6 py-2.5 text-xs font-black uppercase tracking-widest text-amber-200 transition hover:border-amber-500 hover:bg-amber-950/50 disabled:cursor-not-allowed disabled:opacity-40 lg:rounded-lg lg:px-5 lg:py-2 lg:text-[0.65rem]"
                    >
                      Ready for Next Round
                    </button>
                  ) : (
                    <p className="text-sm font-semibold text-emerald-200/95">
                      You are ready.
                    </p>
                  )}
                  {opponentNextReady ? (
                    <p className="text-sm font-semibold text-slate-200">
                      Opponent is ready.
                    </p>
                  ) : null}
                  {roomState.nextRoundCountdownEndsAt !== undefined &&
                  game.phase === "ROUND_END" ? (
                    <p className="text-xs tabular-nums text-amber-200/90">
                      {countdownSeconds !== null && countdownSeconds > 0
                        ? `Next round starts in ${countdownSeconds}…`
                        : "Next round starting soon…"}
                    </p>
                  ) : null}
                </div>
              ) : null}

              <p className="rounded-lg border border-slate-800 bg-black/35 px-2 py-1.5 text-[0.7rem] text-slate-500">
                Online resolves on the server — picks stay hidden until the official
                clash result arrives.
              </p>
            </div>
          </section>
        </div>

        <div className="mt-2 lg:mt-1 lg:shrink-0">
          <CollapsibleBattleLog
            logs={game.logs}
            tone="muted"
            className="lg:min-h-0"
          />
        </div>
      </div>

      {game.phase === "GAME_OVER" &&
      game.winner !== undefined &&
      !opponentDisconnected ? (
        <GameOverPanel
          open
          winner={game.winner}
          onRestart={restartMatch}
          onBackToStart={() => {
            exitWithLeave();
          }}
        />
      ) : null}
    </div>
  );
}
