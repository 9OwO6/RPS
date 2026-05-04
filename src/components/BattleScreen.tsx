"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

import { ActionButtons } from "@/components/ActionButtons";
import { BattleLog } from "@/components/BattleLog";
import { GameOverPanel } from "@/components/GameOverPanel";
import { PassDeviceOverlay } from "@/components/PassDeviceOverlay";
import { PlayerPanel } from "@/components/PlayerPanel";
import { RoundResultSummary } from "@/components/RoundResultSummary";
import { RulesReminder } from "@/components/RulesReminder";
import type { RoundSummary } from "@/components/roundSummary";
import { buildRoundSummary } from "@/components/roundSummary";
import { createInitialGameState } from "@/game/initialState";
import { ASSETS } from "@/lib/assetPaths";
import type { GamePhase, GameState, InputAction } from "@/game/types";
import { resolveRound } from "@/game/resolveRound";

const DUMMY_STAGGER_INPUT: InputAction = "ROCK";

function phaseLabel(phase: GamePhase): string {
  switch (phase) {
    case "P1_PICK":
      return "Player 1 commits";
    case "PASS_TO_P2":
      return "Seal & pass device";
    case "P2_PICK":
      return "Player 2 commits blindly";
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

export function BattleScreen() {
  const [game, setGame] = useState<GameState>(() =>
    createInitialGameState("P1_PICK"),
  );
  const gameRef = useRef(game);
  gameRef.current = game;

  const [p1Pick, setP1Pick] = useState<InputAction | null>(null);
  const [p2Pick, setP2Pick] = useState<InputAction | null>(null);
  const [roundSummary, setRoundSummary] = useState<RoundSummary | null>(null);

  const resetMatch = useCallback(() => {
    setGame(createInitialGameState("P1_PICK"));
    setP1Pick(null);
    setP2Pick(null);
    setRoundSummary(null);
  }, []);

  const handleP1Confirm = useCallback(() => {
    setGame((g) => {
      if (g.phase !== "P1_PICK") return g;
      if (g.p1.state !== "STAGGERED" && p1Pick === null) return g;
      return { ...g, phase: "PASS_TO_P2" };
    });
  }, [p1Pick]);

  const handleContinueAsP2 = useCallback(() => {
    setGame((g) => {
      if (g.phase !== "PASS_TO_P2") return g;
      return { ...g, phase: "P2_PICK" };
    });
  }, []);

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
    setGame(next);
  }, [p1Pick, p2Pick]);

  useEffect(() => {
    if (game.phase === "ROUND_END" || game.phase === "GAME_OVER") {
      setP1Pick(null);
      setP2Pick(null);
    }
  }, [game.phase]);

  const handleNextRound = useCallback(() => {
    setRoundSummary(null);
    setGame((g) => {
      if (g.phase !== "ROUND_END") return g;
      return { ...g, phase: "P1_PICK" };
    });
  }, []);

  const prompt = useMemo(() => {
    switch (game.phase) {
      case "P1_PICK":
        return "Player 1 — select a legal maneuver, then seal the pick. Nothing is revealed to Player 2 yet.";
      case "PASS_TO_P2":
        return "Screen is sealed. Player 2 must accept the handoff on the overlay.";
      case "P2_PICK":
        return "Player 2 — read only your own panel. Player 1’s maneuver remains sealed until you resolve.";
      case "ROUND_END":
        return "Cross-check the outcome ledger and chronicle, then advance when both agree.";
      case "GAME_OVER":
        return "The duel is decided.";
      default:
        return "";
    }
  }, [game.phase]);

  const activePlayer: "P1" | "P2" | null =
    game.phase === "P1_PICK"
      ? "P1"
      : game.phase === "P2_PICK"
        ? "P2"
        : null;

  const p1ConfirmDisabled =
    game.phase !== "P1_PICK" ||
    (game.p1.state !== "STAGGERED" && p1Pick === null);

  const p2ConfirmDisabled =
    game.phase !== "P2_PICK" ||
    (game.p2.state !== "STAGGERED" && p2Pick === null);

  const showRoundLedger =
    (game.phase === "ROUND_END" || game.phase === "GAME_OVER") &&
    roundSummary !== null;

  return (
    <div className="relative min-h-screen">
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

      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-24 pt-6 md:pb-28 md:pt-10">
        <header className="mb-10 flex flex-col gap-6 border-b border-slate-800/90 pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.45em] text-amber-600/90">
              Pass-and-play arena
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-tight text-white md:text-5xl">
              RPS Tactical Duel
            </h1>
            <p className="mt-2 max-w-xl text-sm text-slate-400">
              Martial card timing: charge Rock, punish with Scissors or Paper —
              momentum is readable, variance is slim.
            </p>
          </div>
          <button
            type="button"
            onClick={resetMatch}
            className="rounded-xl border border-slate-700 bg-slate-950/65 px-5 py-2.5 text-sm font-bold uppercase tracking-widest text-slate-200 shadow backdrop-blur-md hover:border-amber-900/70 hover:bg-slate-900/85"
          >
            Hard reset
          </button>
        </header>

        <div className="grid gap-10 lg:grid-cols-[1fr,minmax(15rem,18rem)]">
          <div className="flex min-w-0 flex-col gap-10">
            <section className="rounded-2xl border border-slate-800/90 bg-slate-950/55 p-5 shadow-xl backdrop-blur-md md:p-7">
              <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-800/80 pb-5">
                <div>
                  <p className="text-[0.65rem] font-bold uppercase tracking-[0.4em] text-slate-500">
                    Encounter counter
                  </p>
                  <p className="mt-2 text-5xl font-black tabular-nums text-white">
                    {game.roundNumber}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[0.65rem] font-bold uppercase tracking-[0.35em] text-slate-500">
                    Field status
                  </p>
                  <p className="mt-2 text-sm font-bold uppercase tracking-wide text-amber-300/95">
                    {phaseLabel(game.phase)}
                  </p>
                </div>
              </div>
              <p className="mt-5 text-sm leading-relaxed text-slate-300">
                {prompt}
              </p>
            </section>

            <section aria-label="Duel pit" className="space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-stretch lg:gap-2">
                <div className="min-w-0 flex-1">
                  <PlayerPanel
                    duelSide="left"
                    subtitle="Forward line · P1"
                    snapshot={game.p1}
                    isActiveTurn={activePlayer === "P1"}
                  />
                </div>

                <div className="flex shrink-0 items-center justify-center py-3 lg:w-14 lg:flex-col lg:py-0">
                  <span className="hidden h-[2px] w-full max-w-[4rem] bg-gradient-to-r from-transparent via-slate-600 to-transparent lg:block lg:h-full lg:w-[2px] lg:max-h-[6rem] lg:bg-gradient-to-b" />
                  <span className="rounded-md border border-amber-950/70 bg-black/60 px-3 py-1.5 font-mono text-xs font-black uppercase tracking-[0.4em] text-amber-500">
                    VS
                  </span>
                  <span className="hidden h-[2px] w-full max-w-[4rem] bg-gradient-to-l from-transparent via-slate-600 to-transparent lg:block lg:h-full lg:w-[2px] lg:max-h-[6rem] lg:bg-gradient-to-b" />
                </div>

                <div className="min-w-0 flex-1">
                  <PlayerPanel
                    duelSide="right"
                    subtitle="Back line · P2"
                    snapshot={game.p2}
                    isActiveTurn={activePlayer === "P2"}
                  />
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-800/90 bg-slate-950/55 p-5 shadow-2xl backdrop-blur-md md:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <h2 className="text-xs font-black uppercase tracking-[0.4em] text-slate-500">
                  Maneuver matrix
                </h2>
                {activePlayer && (
                  <span className="rounded-md border border-amber-900/40 bg-amber-950/30 px-2 py-1 text-[0.65rem] font-bold uppercase tracking-widest text-amber-300/90">
                    Live — {activePlayer}
                  </span>
                )}
              </div>

              <div className="mt-6 space-y-6">
                {activePlayer === "P1" && game.p1.state !== "STAGGERED" && (
                  <ActionButtons
                    playerState={game.p1.state}
                    selected={p1Pick}
                    onSelect={setP1Pick}
                    disabled={game.phase !== "P1_PICK"}
                  />
                )}

                {activePlayer === "P1" && game.p1.state === "STAGGERED" && (
                  <p className="rounded-xl border border-red-900/40 bg-red-950/20 px-4 py-3 text-sm text-red-100">
                    Staggered — no matrix entry. Seal with confirm to pass the
                    hidden skip.
                  </p>
                )}

                {activePlayer === "P2" && game.p2.state !== "STAGGERED" && (
                  <ActionButtons
                    playerState={game.p2.state}
                    selected={p2Pick}
                    onSelect={setP2Pick}
                    disabled={game.phase !== "P2_PICK"}
                  />
                )}

                {activePlayer === "P2" && game.p2.state === "STAGGERED" && (
                  <p className="rounded-xl border border-red-900/40 bg-red-950/20 px-4 py-3 text-sm text-red-100">
                    Staggered — no matrix entry. Confirm to resolve against
                    Player 1&apos;s sealed action.
                  </p>
                )}

                {activePlayer === null &&
                  game.phase !== "GAME_OVER" &&
                  game.phase !== "ROUND_END" && (
                    <p className="text-center text-sm text-slate-500">
                      Awaiting pass overlay or table reset…
                    </p>
                  )}

                <div className="flex flex-wrap gap-3">
                  {game.phase === "P1_PICK" && (
                    <button
                      type="button"
                      disabled={p1ConfirmDisabled}
                      onClick={handleP1Confirm}
                      className="rounded-xl bg-amber-500 px-7 py-3 text-sm font-black uppercase tracking-widest text-slate-950 shadow-lg transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-600"
                    >
                      Seal Player 1
                    </button>
                  )}
                  {game.phase === "P2_PICK" && (
                    <button
                      type="button"
                      disabled={p2ConfirmDisabled}
                      onClick={handleP2Confirm}
                      className="rounded-xl bg-amber-500 px-7 py-3 text-sm font-black uppercase tracking-widest text-slate-950 shadow-lg transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-600"
                    >
                      Seal Player 2 &amp; resolve
                    </button>
                  )}
                  {game.phase === "ROUND_END" && (
                    <button
                      type="button"
                      onClick={handleNextRound}
                      className="rounded-xl border border-amber-700/50 bg-amber-950/30 px-7 py-3 text-sm font-black uppercase tracking-widest text-amber-200 transition hover:border-amber-500 hover:bg-amber-950/50"
                    >
                      Next round
                    </button>
                  )}
                </div>

                {game.phase === "P2_PICK" && (
                  <p className="rounded-lg border border-slate-800 bg-black/35 px-3 py-2 text-[0.75rem] text-slate-500">
                    <span className="font-semibold text-slate-400">
                      Sealed stance:
                    </span>{" "}
                    Player 1&apos;s card is facedown. This UI never prints their
                    label until resolve — read the ledger below after both seals.
                  </p>
                )}
              </div>
            </section>

            {showRoundLedger && roundSummary ? (
              <RoundResultSummary summary={roundSummary} />
            ) : null}

            <BattleLog logs={game.logs} />

            <div className="lg:hidden">
              <RulesReminder />
            </div>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-28">
              <RulesReminder />
            </div>
          </aside>
        </div>

        <PassDeviceOverlay
          open={game.phase === "PASS_TO_P2"}
          onContinueAsP2={handleContinueAsP2}
        />

        {game.phase === "GAME_OVER" && game.winner !== undefined ? (
          <GameOverPanel
            open
            winner={game.winner}
            onRestart={resetMatch}
          />
        ) : null}
      </div>
    </div>
  );
}
