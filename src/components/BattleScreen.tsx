"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useSound } from "@/audio/SoundContext";
import Image from "next/image";

import { ActionButtons } from "@/components/ActionButtons";
import { CollapsibleBattleLog } from "@/components/CollapsibleBattleLog";
import { CombatReveal } from "@/components/CombatReveal";
import { DamageFloat } from "@/components/DamageFloat";
import { GameOverPanel } from "@/components/GameOverPanel";
import { PassDeviceOverlay } from "@/components/PassDeviceOverlay";
import { PlayerPanel } from "@/components/PlayerPanel";
import { SoundToggle } from "@/components/SoundToggle";
import { RoundResultSummary } from "@/components/RoundResultSummary";
import { RulesReminder } from "@/components/RulesReminder";
import type { RoundSummary } from "@/components/roundSummary";
import { buildRoundSummary } from "@/components/roundSummary";
import { chooseAiAction, type AiDifficulty } from "@/game/ai";
import { createInitialGameState } from "@/game/initialState";
import { ASSETS } from "@/lib/assetPaths";
import { getBattleFeedback } from "@/presentation/battleFeedback";
import { getCombatAnimationType } from "@/presentation/combatAnimation";
import {
  getDamageFloatAccentForVictim,
  getDamageFloatTier,
} from "@/presentation/combatMotion";
import type { GamePhase, GameState, InputAction } from "@/game/types";
import { resolveRound } from "@/game/resolveRound";

const DUMMY_STAGGER_INPUT: InputAction = "ROCK";

type BattleMode = "LOCAL_2P" | "VS_AI";

function phaseLabel(phase: GamePhase, mode: BattleMode): string {
  switch (phase) {
    case "P1_PICK":
      return mode === "VS_AI" ? "Player commits" : "Player 1 commits";
    case "PASS_TO_P2":
      return "Seal & pass device";
    case "P2_PICK":
      return "Player 2 commits (hidden)";
    case "RESOLVE":
      return "Crossing blows";
    case "ROUND_END":
      return "Stand down — reconcile";
    case "GAME_OVER":
      return "Arena closed";
    default: {
      const _e: never = phase;
      return _e;
    }
  }
}

interface BattleScreenProps {
  battleMode?: BattleMode;
  aiDifficulty?: AiDifficulty;
}

export function BattleScreen({
  battleMode = "LOCAL_2P",
  aiDifficulty = "NORMAL",
}: BattleScreenProps) {
  const [game, setGame] = useState<GameState>(() =>
    createInitialGameState("P1_PICK"),
  );
  const gameRef = useRef(game);
  gameRef.current = game;

  const [p1Pick, setP1Pick] = useState<InputAction | null>(null);
  const [p2Pick, setP2Pick] = useState<InputAction | null>(null);
  const [roundSummary, setRoundSummary] = useState<RoundSummary | null>(null);
  const [combatFrame, setCombatFrame] = useState<{
    prev: GameState;
    next: GameState;
  } | null>(null);
  const [aiThinking, setAiThinking] = useState(false);
  const aiThinkTimerRef = useRef<number | null>(null);

  const resetMatch = useCallback(() => {
    if (aiThinkTimerRef.current !== null) {
      window.clearTimeout(aiThinkTimerRef.current);
      aiThinkTimerRef.current = null;
    }
    setAiThinking(false);
    setGame(createInitialGameState("P1_PICK"));
    setP1Pick(null);
    setP2Pick(null);
    setRoundSummary(null);
    setCombatFrame(null);
  }, []);

  const handleP1Confirm = useCallback(() => {
    const g = gameRef.current;
    if (g.phase !== "P1_PICK") return;
    const a1 = g.p1.state === "STAGGERED" ? DUMMY_STAGGER_INPUT : p1Pick ?? null;
    if (g.p1.state !== "STAGGERED" && a1 === null) return;

    if (battleMode === "VS_AI") {
      if (aiThinking) return;
      const p1ResolvedInput =
        g.p1.state === "STAGGERED" ? DUMMY_STAGGER_INPUT : (a1 as InputAction);
      setAiThinking(true);
      setGame({ ...g, phase: "RESOLVE" });
      const delayMs = 500 + Math.floor(Math.random() * 401);
      aiThinkTimerRef.current = window.setTimeout(() => {
        aiThinkTimerRef.current = null;
        const latest = gameRef.current;
        const aiAction = chooseAiAction(latest, "P2", aiDifficulty);
        const next = resolveRound(
          latest,
          p1ResolvedInput,
          latest.p2.state === "STAGGERED" ? DUMMY_STAGGER_INPUT : aiAction,
        );
        const summary = buildRoundSummary(latest, next);
        if (summary) setRoundSummary(summary);
        setCombatFrame({ prev: latest, next });
        setGame(next);
        setAiThinking(false);
      }, delayMs);
      return;
    }

    setGame({ ...g, phase: "PASS_TO_P2" });
  }, [aiDifficulty, aiThinking, battleMode, p1Pick]);

  const handleContinueAsP2 = useCallback(() => {
    if (battleMode !== "LOCAL_2P") return;
    setGame((g) => {
      if (g.phase !== "PASS_TO_P2") return g;
      return { ...g, phase: "P2_PICK" };
    });
  }, [battleMode]);

  const handleP2Confirm = useCallback(() => {
    const g = gameRef.current;
    if (g.phase !== "P2_PICK") return;

    const a1 =
      g.p1.state === "STAGGERED" ? DUMMY_STAGGER_INPUT : p1Pick ?? null;
    const a2 =
      g.p2.state === "STAGGERED" ? DUMMY_STAGGER_INPUT : p2Pick ?? null;
    if (g.p1.state !== "STAGGERED" && a1 === null) return;
    if (g.p2.state !== "STAGGERED" && a2 === null) return;

    const next = resolveRound(
      g,
      g.p1.state === "STAGGERED"
        ? DUMMY_STAGGER_INPUT
        : (a1 as InputAction),
      g.p2.state === "STAGGERED"
        ? DUMMY_STAGGER_INPUT
        : (a2 as InputAction),
    );
    const summary = buildRoundSummary(g, next);
    if (summary) setRoundSummary(summary);
    setCombatFrame({ prev: g, next });
    setGame(next);
  }, [p1Pick, p2Pick]);

  useEffect(() => {
    if (game.phase === "ROUND_END" || game.phase === "GAME_OVER") {
      setP1Pick(null);
      setP2Pick(null);
    }
  }, [game.phase]);

  useEffect(() => {
    return () => {
      if (aiThinkTimerRef.current !== null) {
        window.clearTimeout(aiThinkTimerRef.current);
      }
    };
  }, []);

  const handleNextRound = useCallback(() => {
    setRoundSummary(null);
    setCombatFrame(null);
    setGame((g) => {
      if (g.phase !== "ROUND_END") return g;
      return { ...g, phase: "P1_PICK" };
    });
  }, []);

  const prompt = useMemo(() => {
    switch (game.phase) {
      case "P1_PICK":
        return battleMode === "VS_AI"
          ? "Choose a legal maneuver, then confirm to resolve against the training bot."
          : "Player 1: choose a legal maneuver, then tap Seal Player 1. Player 2 still cannot see your pick.";
      case "RESOLVE":
        return battleMode === "VS_AI" && aiThinking
          ? "Training bot is choosing a maneuver..."
          : "Crossing blows.";
      case "PASS_TO_P2":
        return "Pass the device. Player 2 must confirm on the overlay before the blind pick opens.";
      case "P2_PICK":
        return "Player 2: choose your maneuver, then tap Seal & resolve round. Player 1’s pick stays hidden until you resolve.";
      case "ROUND_END":
        return "Review the clash tableau and ledger below. When ready, tap Next round.";
      case "GAME_OVER":
        return "A fighter reached 0 HP — use Restart on the overlay or Reset match above.";
      default:
        return "";
    }
  }, [aiThinking, battleMode, game.phase]);

  const activePlayer: "P1" | "P2" | null =
    game.phase === "P1_PICK"
      ? "P1"
      : battleMode === "LOCAL_2P" && game.phase === "P2_PICK"
        ? "P2"
        : null;

  const p1ConfirmDisabled =
    game.phase !== "P1_PICK" ||
    aiThinking ||
    (game.p1.state !== "STAGGERED" && p1Pick === null);

  const p2ConfirmDisabled =
    battleMode !== "LOCAL_2P" ||
    game.phase !== "P2_PICK" ||
    (game.p2.state !== "STAGGERED" && p2Pick === null);

  const showRoundLedger =
    (game.phase === "ROUND_END" || game.phase === "GAME_OVER") &&
    roundSummary !== null;

  const battleFeedback = useMemo(() => {
    if (!combatFrame) return null;
    return getBattleFeedback(combatFrame.prev, combatFrame.next);
  }, [combatFrame]);

  const feedbackRoundKey = combatFrame?.next.roundNumber ?? 0;
  const feedbackNext = combatFrame?.next ?? null;

  const { pauseBgm, play, playBgm } = useSound();
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
  }, [
    showRoundLedger,
    combatFrame,
    battleFeedback,
    feedbackRoundKey,
    play,
  ]);

  useEffect(() => {
    if (game.phase !== "GAME_OVER" || !game.winner) return;
    const resolvedRound = combatFrame?.next.roundNumber ?? game.roundNumber;
    if (endSoundRoundRef.current === resolvedRound) return;
    endSoundRoundRef.current = resolvedRound;
    pauseBgm();
    if (game.winner === "P1") {
      play("GAME_WIN");
      return;
    }
    play("GAME_OVER");
  }, [combatFrame, game.phase, game.roundNumber, game.winner, pauseBgm, play]);

  const resetWithSound = useCallback(() => {
    endSoundRoundRef.current = null;
    play("UI_CONFIRM");
    resetMatch();
    playBgm();
  }, [play, playBgm, resetMatch]);

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
              {battleMode === "VS_AI" ? "Player vs AI" : "Pass-and-play"}
              {battleMode === "VS_AI"
                ? ` · ${aiDifficulty === "NORMAL" ? "Normal" : "Easy"}`
                : ""}
            </p>
            <h1 className="truncate text-2xl font-black tracking-tight text-white md:text-3xl lg:text-xl lg:leading-tight">
              Tactical Duel
            </h1>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <SoundToggle compact />
            <button
              type="button"
              onClick={resetWithSound}
              className="shrink-0 rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-2 text-[0.65rem] font-bold uppercase tracking-widest text-slate-200 shadow backdrop-blur-md hover:border-amber-900/70 hover:bg-slate-900/85 md:px-5 md:text-xs lg:rounded-lg lg:px-3 lg:py-1.5 lg:text-[0.6rem]"
            >
              Reset match
            </button>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-visible lg:min-h-0 lg:gap-1.5 lg:overflow-hidden">
        {/* Opponent (P2) — top band */}
        <div className="relative shrink-0">
          {showRoundLedger &&
          combatFrame &&
          battleFeedback &&
          battleFeedback.p2Damage > 0 &&
          feedbackNext ? (
            <DamageFloat
              key={`df-p2-${feedbackRoundKey}`}
              amount={battleFeedback.p2Damage}
              tier={getDamageFloatTier(battleFeedback.p2Damage)}
              accent={getDamageFloatAccentForVictim(
                "P2",
                combatFrame.prev,
                feedbackNext,
              )}
            />
          ) : null}
          <PlayerPanel
            duelSide="right"
            subtitle={battleMode === "VS_AI" ? "AI Duelist · Player 2" : "Opponent · Player 2"}
            snapshot={game.p2}
            isActiveTurn={activePlayer === "P2"}
            layoutVariant="hero"
            arenaBand="opponent"
            resolveFeedback={
              showRoundLedger && combatFrame && battleFeedback
                ? {
                    roundKey: feedbackRoundKey,
                    tookDamage: battleFeedback.p2Hit,
                    staggerIntro: battleFeedback.p2BecameStaggered,
                    damageTaken: battleFeedback.p2Damage,
                  }
                : null
            }
          />
        </div>

        {/* Central combat stage */}
        <section
          aria-label="Combat stage"
          className="flex min-h-[12rem] flex-1 flex-col rounded-2xl border border-amber-900/30 bg-slate-950/55 shadow-[0_0_56px_-18px_rgba(0,0,0,0.7)] backdrop-blur-md lg:min-h-0 lg:flex-[1_1_0%] lg:overflow-hidden lg:shadow-md"
        >
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-slate-800/70 px-3 py-2.5 md:px-4 lg:py-1.5">
            <span className="font-mono text-xs font-black tabular-nums text-white md:text-sm lg:text-[0.7rem]">
              Round {game.roundNumber}
            </span>
            <span className="max-w-[14rem] text-right text-[0.65rem] font-bold uppercase leading-snug tracking-wide text-amber-300/90 md:max-w-none md:text-xs lg:text-[0.58rem]">
              {phaseLabel(game.phase, battleMode)}
            </span>
          </div>
          <p className="shrink-0 border-b border-slate-800/50 px-3 py-2 text-[0.75rem] leading-relaxed text-slate-400 md:px-4 md:text-sm lg:py-1.5 lg:text-[0.68rem] lg:leading-snug">
            {prompt}
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
                  {battleMode === "VS_AI" && aiThinking
                    ? "AI is reading your stance..."
                    : "Maneuver tableau, clash motion, and outcome ledger render here after Player 2 seals the round."}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Local duelist (P1) */}
        <div className="relative shrink-0">
          {showRoundLedger &&
          combatFrame &&
          battleFeedback &&
          battleFeedback.p1Damage > 0 &&
          feedbackNext ? (
            <DamageFloat
              key={`df-p1-${feedbackRoundKey}`}
              amount={battleFeedback.p1Damage}
              tier={getDamageFloatTier(battleFeedback.p1Damage)}
              accent={getDamageFloatAccentForVictim(
                "P1",
                combatFrame.prev,
                feedbackNext,
              )}
            />
          ) : null}
          <PlayerPanel
            duelSide="left"
            subtitle="You · Player 1"
            snapshot={game.p1}
            isActiveTurn={activePlayer === "P1"}
            layoutVariant="hero"
            arenaBand="local"
            resolveFeedback={
              showRoundLedger && combatFrame && battleFeedback
                ? {
                    roundKey: feedbackRoundKey,
                    tookDamage: battleFeedback.p1Hit,
                    staggerIntro: battleFeedback.p1BecameStaggered,
                    damageTaken: battleFeedback.p1Damage,
                  }
                : null
            }
          />
        </div>

        {/* Maneuver deck + seals */}
        <section
          aria-label="Maneuver selection"
          className="shrink-0 rounded-2xl border border-slate-800/90 bg-slate-950/60 p-3 shadow-xl backdrop-blur-md md:p-5 lg:p-2.5 lg:shadow-lg"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3 lg:pb-1.5">
            <h2 className="text-[0.65rem] font-black uppercase tracking-[0.32em] text-slate-500 lg:text-[0.58rem]">
              Maneuver deck
            </h2>
            {activePlayer ? (
              <span className="rounded-md border border-amber-900/40 bg-amber-950/30 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-widest text-amber-300/90 lg:py-0 lg:text-[0.55rem]">
                Live · {activePlayer}
              </span>
            ) : null}
          </div>

          <div className="mt-4 space-y-4 lg:mt-2 lg:space-y-2">
            {activePlayer === "P1" && game.p1.state !== "STAGGERED" && (
              <ActionButtons
                variant="deck"
                density="hud"
                playerState={game.p1.state}
                selected={p1Pick}
                onSelect={setP1Pick}
                disabled={game.phase !== "P1_PICK"}
              />
            )}

            {activePlayer === "P1" && game.p1.state === "STAGGERED" && (
              <p className="rounded-xl border border-red-900/40 bg-red-950/20 px-3 py-2.5 text-sm text-red-100">
                Staggered — no maneuver. Seal with confirm to pass the hidden skip.
              </p>
            )}

            {battleMode === "LOCAL_2P" &&
              activePlayer === "P2" &&
              game.p2.state !== "STAGGERED" && (
              <ActionButtons
                variant="deck"
                density="hud"
                playerState={game.p2.state}
                selected={p2Pick}
                onSelect={setP2Pick}
                disabled={game.phase !== "P2_PICK"}
              />
            )}

            {battleMode === "LOCAL_2P" &&
              activePlayer === "P2" &&
              game.p2.state === "STAGGERED" && (
              <p className="rounded-xl border border-red-900/40 bg-red-950/20 px-3 py-2.5 text-sm text-red-100">
                Staggered — confirm to resolve against Player 1&apos;s sealed action.
              </p>
            )}

            {activePlayer === null &&
              game.phase !== "GAME_OVER" &&
              game.phase !== "ROUND_END" && (
                <p className="text-center text-sm text-slate-500">
                  Waiting for pass overlay or round reset…
                </p>
              )}

            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start lg:gap-1.5">
              {game.phase === "P1_PICK" && (
                <button
                  type="button"
                  disabled={p1ConfirmDisabled}
                  onClick={() => {
                    if (!p1ConfirmDisabled) play("UI_CONFIRM");
                    handleP1Confirm();
                  }}
                  className="rounded-xl bg-amber-500 px-6 py-2.5 text-xs font-black uppercase tracking-widest text-slate-950 shadow-lg transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-600 md:px-7 md:py-3 md:text-sm lg:rounded-lg lg:px-5 lg:py-2 lg:text-[0.65rem]"
                >
                  {battleMode === "VS_AI"
                    ? "Confirm & resolve round"
                    : "Seal Player 1 pick"}
                </button>
              )}
              {battleMode === "LOCAL_2P" && game.phase === "P2_PICK" && (
                <button
                  type="button"
                  disabled={p2ConfirmDisabled}
                  onClick={() => {
                    if (!p2ConfirmDisabled) play("UI_CONFIRM");
                    handleP2Confirm();
                  }}
                  className="rounded-xl bg-amber-500 px-6 py-2.5 text-xs font-black uppercase tracking-widest text-slate-950 shadow-lg transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-600 md:px-7 md:py-3 md:text-sm lg:rounded-lg lg:px-5 lg:py-2 lg:text-[0.65rem]"
                >
                  Seal &amp; resolve round
                </button>
              )}
              {game.phase === "ROUND_END" && (
                <button
                  type="button"
                  onClick={() => {
                    play("UI_CONFIRM");
                    handleNextRound();
                  }}
                  className="rounded-xl border border-amber-700/50 bg-amber-950/30 px-6 py-2.5 text-xs font-black uppercase tracking-widest text-amber-200 transition hover:border-amber-500 hover:bg-amber-950/50 md:px-7 md:py-3 md:text-sm lg:rounded-lg lg:px-5 lg:py-2 lg:text-[0.65rem]"
                >
                  Next round
                </button>
              )}
            </div>

            {battleMode === "LOCAL_2P" && game.phase === "P2_PICK" && (
              <p className="rounded-lg border border-slate-800 bg-black/35 px-2 py-1.5 text-[0.7rem] text-slate-500">
                <span className="font-semibold text-slate-400">Hidden pick:</span>{" "}
                Player 1&apos;s maneuver is not shown until you resolve.
              </p>
            )}
          </div>
        </section>
        </div>

        <div className="mt-2 flex flex-col gap-2 lg:mt-1 lg:shrink-0 lg:flex-row lg:gap-2 lg:border-t lg:border-slate-900/35 lg:pt-1">
          <CollapsibleBattleLog
            logs={game.logs}
            tone="muted"
            className="lg:min-h-0 lg:min-w-0 lg:flex-1"
          />

          <details className="rounded-xl border border-slate-900/60 bg-black/25 text-slate-400 backdrop-blur-sm lg:min-h-0 lg:min-w-0 lg:flex-1 [&_summary::-webkit-details-marker]:hidden">
            <summary className="cursor-pointer px-3 py-2.5 text-[0.65rem] font-bold uppercase tracking-[0.26em] text-slate-500 md:px-4 md:py-3 md:text-xs lg:py-1.5 lg:text-[0.58rem]">
              Tactical rules reference
            </summary>
            <div className="border-t border-slate-800/70 px-3 pb-3 pt-2 lg:max-h-[min(40vh,16rem)] lg:overflow-y-auto">
              <RulesReminder />
            </div>
          </details>
        </div>
      </div>

      <PassDeviceOverlay
        open={battleMode === "LOCAL_2P" && game.phase === "PASS_TO_P2"}
        onContinueAsP2={handleContinueAsP2}
      />

      {game.phase === "GAME_OVER" && game.winner !== undefined ? (
        <GameOverPanel open winner={game.winner} onRestart={resetWithSound} />
      ) : null}
    </div>
  );
}
