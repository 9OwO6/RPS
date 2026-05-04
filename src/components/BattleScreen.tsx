"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { ActionButtons } from "@/components/ActionButtons";
import { BattleLog } from "@/components/BattleLog";
import { GameOverPanel } from "@/components/GameOverPanel";
import { PassDeviceOverlay } from "@/components/PassDeviceOverlay";
import { PlayerPanel } from "@/components/PlayerPanel";
import { createInitialGameState } from "@/game/initialState";
import { describeEffectiveAction } from "@/game/logMessages";
import { resolveRound } from "@/game/resolveRound";
import type { GamePhase, GameState, InputAction } from "@/game/types";

const DUMMY_STAGGER_INPUT: InputAction = "ROCK";

function phaseLabel(phase: GamePhase): string {
  switch (phase) {
    case "P1_PICK":
      return "Player 1’s turn";
    case "PASS_TO_P2":
      return "Pass device to Player 2";
    case "P2_PICK":
      return "Player 2’s turn";
    case "RESOLVE":
      return "Resolving";
    case "ROUND_END":
      return "Round resolved — review";
    case "GAME_OVER":
      return "Game over";
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
  const [p1Pick, setP1Pick] = useState<InputAction | null>(null);
  const [p2Pick, setP2Pick] = useState<InputAction | null>(null);

  const resetMatch = useCallback(() => {
    setGame(createInitialGameState("P1_PICK"));
    setP1Pick(null);
    setP2Pick(null);
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
    setGame((g) => {
      if (g.phase !== "P2_PICK") return g;
      const a1 =
        g.p1.state === "STAGGERED" ? DUMMY_STAGGER_INPUT : p1Pick ?? null;
      const a2 =
        g.p2.state === "STAGGERED" ? DUMMY_STAGGER_INPUT : p2Pick ?? null;
      if (g.p1.state !== "STAGGERED" && a1 === null) return g;
      if (g.p2.state !== "STAGGERED" && a2 === null) return g;
      return resolveRound(
        g,
        g.p1.state === "STAGGERED"
          ? DUMMY_STAGGER_INPUT
          : (a1 as InputAction),
        g.p2.state === "STAGGERED"
          ? DUMMY_STAGGER_INPUT
          : (a2 as InputAction),
      );
    });
  }, [p1Pick, p2Pick]);

  useEffect(() => {
    if (game.phase === "ROUND_END" || game.phase === "GAME_OVER") {
      setP1Pick(null);
      setP2Pick(null);
    }
  }, [game.phase]);

  const handleNextRound = useCallback(() => {
    setGame((g) => {
      if (g.phase !== "ROUND_END") return g;
      return { ...g, phase: "P1_PICK" };
    });
  }, []);

  const prompt = useMemo(() => {
    switch (game.phase) {
      case "P1_PICK":
        return "Player 1: select a legal action, then confirm.";
      case "PASS_TO_P2":
        return "Player 2 must take the device (overlay).";
      case "P2_PICK":
        return "Player 2: select a legal action, then confirm. Player 1’s choice stays hidden until the round resolves.";
      case "ROUND_END":
        return "Round finished. Check the log, then continue.";
      case "GAME_OVER":
        return "Match ended.";
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

  const lastReveal = useMemo(() => {
    if (game.phase !== "ROUND_END" && game.phase !== "GAME_OVER") return null;
    const le = game.lastEffectiveActions;
    if (!le) return null;
    return {
      p1: describeEffectiveAction("P1", le.p1),
      p2: describeEffectiveAction("P2", le.p2),
    };
  }, [game.phase, game.lastEffectiveActions]);

  return (
    <div className="mx-auto max-w-4xl px-4">
      <header className="mb-8 flex flex-col gap-4 border-b border-slate-800 pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            RPS Tactical Duel
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Local pass-and-play · hidden picks · same rules as the spec
          </p>
        </div>
        <button
          type="button"
          onClick={resetMatch}
          className="self-start rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800"
        >
          Restart game
        </button>
      </header>

      <section className="mb-6 grid gap-3 rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-sm text-slate-300">
        <div className="flex flex-wrap justify-between gap-2">
          <span>
            <span className="text-slate-500">Round </span>
            <span className="font-semibold text-white tabular-nums">
              {game.roundNumber}
            </span>
          </span>
          <span>
            <span className="text-slate-500">Phase: </span>
            <span className="font-medium text-amber-200/90">
              {phaseLabel(game.phase)}
            </span>
          </span>
        </div>
        <p className="text-slate-200">{prompt}</p>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <PlayerPanel
          snapshot={game.p1}
          subtitle="Attacker side"
          isActiveTurn={activePlayer === "P1"}
        />
        <PlayerPanel
          snapshot={game.p2}
          subtitle="Defender side"
          isActiveTurn={activePlayer === "P2"}
        />
      </div>

      <section className="mt-6 rounded-xl border border-slate-700 bg-slate-900/50 p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Actions
        </h2>

        {activePlayer === "P1" && game.p1.state !== "STAGGERED" && (
          <ActionButtons
            playerState={game.p1.state}
            selected={p1Pick}
            onSelect={setP1Pick}
            disabled={game.phase !== "P1_PICK"}
          />
        )}

        {activePlayer === "P1" && game.p1.state === "STAGGERED" && (
          <p className="text-sm text-slate-300">
            No actions available. Press confirm to continue.
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
          <p className="text-sm text-slate-300">
            No actions available. Press confirm to resolve the round.
          </p>
        )}

        {activePlayer === null &&
          game.phase !== "GAME_OVER" &&
          game.phase !== "ROUND_END" && (
            <p className="text-slate-500">
              Waiting for the pass-device step or round transition.
            </p>
          )}

        <div className="mt-4 flex flex-wrap gap-3">
          {game.phase === "P1_PICK" && (
            <button
              type="button"
              disabled={p1ConfirmDisabled}
              onClick={handleP1Confirm}
              className="rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-500"
            >
              Confirm Player 1
            </button>
          )}
          {game.phase === "P2_PICK" && (
            <button
              type="button"
              disabled={p2ConfirmDisabled}
              onClick={handleP2Confirm}
              className="rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-500"
            >
              Confirm Player 2 &amp; resolve
            </button>
          )}
          {game.phase === "ROUND_END" && (
            <button
              type="button"
              onClick={handleNextRound}
              className="rounded-lg border border-amber-500/60 bg-amber-950/30 px-5 py-2.5 text-sm font-semibold text-amber-200 hover:bg-amber-950/50"
            >
              Next round
            </button>
          )}
        </div>

        {game.phase === "P2_PICK" && (
          <p className="mt-3 text-xs text-slate-500">
            Player 1 has already confirmed. Their move name is hidden until both
            players finish — see the battle log after resolve.
          </p>
        )}

        {lastReveal && (
          <div className="mt-4 rounded-lg border border-slate-700 bg-slate-950/50 p-3 text-sm text-slate-200">
            <p className="font-medium text-slate-400">Last resolution</p>
            <p className="mt-1">{lastReveal.p1}</p>
            <p>{lastReveal.p2}</p>
          </div>
        )}
      </section>

      <div className="mt-8">
        <BattleLog logs={game.logs} />
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
  );
}
