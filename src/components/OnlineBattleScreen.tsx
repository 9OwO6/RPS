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
import { LanguageToggle } from "@/i18n/LanguageToggle";
import { localizedGamePhase, localizedRoomStatus } from "@/i18n/gameTerms";
import { localizedSocketError } from "@/i18n/onlineErrors";
import { useI18n } from "@/i18n/useI18n";
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

type OpponentNotice = { playerId: string };

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
  const { t } = useI18n();
  const [roomState, setRoomState] =
    useState<PublicOnlineRoomState>(initialRoomState);
  const [notice, setNotice] = useState<OpponentNotice | null>(null);
  const [error, setError] = useState<{
    code?: string;
    message?: string;
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
        oppDisconnectedNow ? { code: "OPPONENT_DISCONNECTED" } : null,
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
      setNotice({ playerId: payload.playerId });
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

  const noticeText = useMemo(
    () =>
      notice
        ? t("online.notice.playerDisconnected", { id: notice.playerId })
        : null,
    [notice, t],
  );

  const errorText =
    error === null
      ? null
      : localizedSocketError(t, error.code, error.message ?? "");

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
    if (opponentDisconnected) return t("online.hud.disconnected");
    if (game.phase === "GAME_OVER") return t("online.hud.matchSettled");
    if (!picking) {
      if (game.phase === "ROUND_END") {
        return t("online.hud.roundResolvedReview");
      }
      return localizedRoomStatus(t, roomState.status);
    }
    if (localSnap.state === "STAGGERED") return t("online.hud.staggerServer");
    if (localLocked && opponentLocked) return t("online.hud.bothLocked");
    if (localLocked) return t("online.hud.youLocked");
    return t("online.hud.pickLock");
  }, [
    game.phase,
    localLocked,
    localSnap.state,
    opponentDisconnected,
    opponentLocked,
    picking,
    roomState.status,
    t,
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

      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-1 flex-col gap-3 px-3 pb-20 pt-4 md:max-w-4xl xl:max-w-5xl lg:min-h-0 lg:gap-2 lg:overflow-hidden lg:px-5 lg:pb-2 lg:pt-2">
        <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3 lg:gap-2 lg:border-slate-800/60 lg:pb-2 lg:pt-0">
          <div className="min-w-0">
            <p className="text-[0.55rem] font-bold uppercase tracking-[0.35em] text-amber-600/90 lg:text-[0.5rem] lg:tracking-[0.32em]">
              {t("online.battle.header", { code: roomCodeUpper })}
            </p>
            <h1 className="truncate text-2xl font-black tracking-tight text-white md:text-3xl lg:text-xl lg:leading-tight">
              {t("battle.tacticalDuel")}
            </h1>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <LanguageToggle />
            <SoundToggle compact />
            <button
              type="button"
              onClick={exitWithLeave}
              className="shrink-0 rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-[0.6rem] font-bold uppercase tracking-widest text-slate-200 hover:border-amber-900/70 lg:rounded-lg lg:px-2 lg:text-[0.55rem]"
            >
              {t("common.backToStartShort")}
            </button>
          </div>
        </header>

        {noticeText ? (
          <p className="rounded-lg border border-amber-900/40 bg-amber-950/25 px-3 py-2 text-xs text-amber-100 lg:text-[0.65rem]">
            {noticeText}
          </p>
        ) : null}
        {opponentDisconnected ? (
          <div className="rounded-lg border border-red-900/50 bg-red-950/25 px-3 py-3 text-xs text-red-100 lg:text-[0.65rem]">
            <p className="font-bold">{t("online.error.OPPONENT_DISCONNECTED")}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={backToLobby}
                className="rounded-lg border border-red-800/60 bg-red-950/40 px-3 py-2 text-[0.6rem] font-bold uppercase tracking-widest text-red-100 hover:border-amber-700/50 hover:text-amber-100"
              >
                {t("online.backToOnlineLobby")}
              </button>
              <button
                type="button"
                onClick={exitWithLeave}
                className="rounded-lg border border-slate-600 bg-slate-900/90 px-3 py-2 text-[0.6rem] font-bold uppercase tracking-widest text-slate-200 hover:border-amber-700/50"
              >
                {t("common.backToStartShort")}
              </button>
            </div>
          </div>
        ) : null}
        {errorText && !opponentDisconnected ? (
          <div className="rounded-lg border border-red-900/40 bg-red-950/20 px-3 py-2 text-xs text-red-100 lg:text-[0.65rem]">
            <p>{errorText}</p>
            {error?.code ? (
              <p className="mt-1 font-mono text-[0.55rem] text-red-300/80">
                {error.code}
              </p>
            ) : null}
          </div>
        ) : null}
        {picking ? (
          <ul className="rounded-lg border border-slate-800/70 bg-slate-950/35 px-3 py-2 text-[0.65rem] text-slate-400 lg:text-[0.6rem]">
            <li>
              {t("online.battle.youStatus")}{" "}
              <span className="font-semibold text-slate-200">
                {localLocked ? t("online.battle.lockedIn") : t("online.battle.selecting")}
              </span>
            </li>
            <li>
              {t("online.battle.opponentStatus")}{" "}
              <span className="font-semibold text-slate-200">
                {opponentLocked
                  ? t("online.battle.lockedIn")
                  : t("online.battle.notLocked")}
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
              subtitle={t("battle.opponentLabel", { id: opponentId })}
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
                {t("battle.roundCounter", { n: game.roundNumber })}
              </span>
              <span className="max-w-[14rem] text-right text-[0.65rem] font-bold uppercase leading-snug tracking-wide text-amber-300/90 md:max-w-none md:text-xs lg:text-[0.58rem]">
                {t("online.battle.phaseLabel", {
                  phase: localizedGamePhase(t, game.phase),
                })}
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
                    {t("battle.skirmishLine")}
                  </p>
                  <p className="max-w-sm text-sm leading-relaxed text-slate-500 lg:max-w-md lg:text-xs">
                    {t("battle.skirmishHint.online")}
                  </p>
                </div>
              )}
            </div>

            {game.phase === "ROUND_END" ? (
              <div className="shrink-0 space-y-3 border-t border-slate-800/65 bg-slate-950/45 px-3 py-3 lg:space-y-2 lg:py-2">
                {!localNextReady ? (
                  <button
                    type="button"
                    disabled={opponentDisconnected}
                    onClick={signalReadyForNextRound}
                    className="w-full rounded-xl border border-amber-700/50 bg-amber-950/30 px-6 py-2.5 text-xs font-black uppercase tracking-widest text-amber-200 transition hover:border-amber-500 hover:bg-amber-950/50 disabled:cursor-not-allowed disabled:opacity-40 lg:rounded-lg lg:py-2 lg:text-[0.65rem]"
                  >
                    {t("online.battle.readyNext")}
                  </button>
                ) : (
                  <p className="text-center text-sm font-semibold text-emerald-200/95 lg:text-xs">
                    {t("online.battle.youReady")}
                  </p>
                )}
                {opponentNextReady ? (
                  <p className="text-center text-sm font-semibold text-slate-200 lg:text-xs">
                    {t("online.battle.opponentReady")}
                  </p>
                ) : null}
                {roomState.nextRoundCountdownEndsAt !== undefined ? (
                  <p className="text-center text-xs tabular-nums text-amber-200/90 lg:text-[0.65rem]">
                    {countdownSeconds !== null && countdownSeconds > 0
                      ? t("online.battle.countdown", {
                          n: countdownSeconds,
                        })
                      : t("online.battle.countdownSoon")}
                  </p>
                ) : null}
              </div>
            ) : null}
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
              subtitle={t("battle.youLabel", { id: playerId })}
              snapshot={localSnap}
              isActiveTurn={picking && !localLocked}
              selectedFocusAction={picking && selected !== null ? selected : null}
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
              heroControls={
                picking ? (
                  <div className="space-y-3 lg:space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h2 className="text-[0.58rem] font-black uppercase tracking-[0.3em] text-slate-500 sm:text-[0.62rem] lg:text-[0.56rem]">
                        {t("battle.modeDeck")}
                      </h2>
                      {!localLocked ? (
                        <span className="rounded-md border border-amber-900/40 bg-amber-950/30 px-2 py-0.5 text-[0.58rem] font-bold uppercase tracking-widest text-amber-300/90 sm:text-[0.6rem]">
                          {t("online.battle.lockWhenReady")}
                        </span>
                      ) : null}
                    </div>
                    {localSnap.state === "STAGGERED" ? (
                      <p className="rounded-xl border border-red-900/40 bg-red-950/20 px-3 py-2.5 text-sm leading-snug text-red-100">
                        {t("online.battle.staggerAuto")}
                      </p>
                    ) : (
                      <>
                        {!localLocked ? (
                          <ActionButtons
                            variant="deck"
                            density="hud"
                            playerSnapshot={localSnap}
                            selected={selected}
                            onSelect={setSelected}
                            disabled={
                              localLocked || opponentDisconnected || !picking
                            }
                          />
                        ) : (
                          <p className="rounded-lg border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-[0.75rem] leading-snug text-slate-300 lg:text-[0.68rem]">
                            {t("online.hud.youLocked")}
                          </p>
                        )}
                        {!localLocked ? (
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              disabled={
                                selected === null ||
                                opponentDisconnected ||
                                !picking
                              }
                              onClick={lockIn}
                              className="rounded-xl bg-amber-500 px-6 py-2.5 text-xs font-black uppercase tracking-widest text-slate-950 shadow-lg transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-600 lg:rounded-lg lg:px-5 lg:py-2 lg:text-[0.65rem]"
                            >
                              {t("online.battle.lockIn")}
                            </button>
                          </div>
                        ) : null}
                      </>
                    )}
                    <p className="text-[0.68rem] leading-snug text-slate-500 lg:text-[0.62rem]">
                      {t("battle.deckHint")}
                    </p>
                    <p className="rounded-lg border border-slate-800 bg-black/35 px-2 py-1.5 text-[0.65rem] leading-snug text-slate-500 lg:text-[0.6rem]">
                      {t("online.battle.hiddenNote")}
                    </p>
                  </div>
                ) : undefined
              }
            />
          </div>

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
