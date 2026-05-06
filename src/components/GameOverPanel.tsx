"use client";

import { useEffect, useState } from "react";

import { GameOverFinisher } from "@/components/GameOverFinisher";
import {
  gameOverFinisherTitleKey,
  type GameOverFinisherContext,
} from "@/components/gameOverTitle";
import { useI18n } from "@/i18n/useI18n";
import type { GameState } from "@/game/types";

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return reduced;
}

interface GameOverPanelProps {
  open: boolean;
  winner: NonNullable<GameState["winner"]>;
  finalGameState: GameState;
  finisherContext: GameOverFinisherContext;
  onRestart: () => void;
  onBackToStart?: () => void;
}

export function GameOverPanel({
  open,
  winner,
  finalGameState,
  finisherContext,
  onRestart,
  onBackToStart,
}: GameOverPanelProps) {
  const { t } = useI18n();
  const reducedMotion = usePrefersReducedMotion();
  const [interactive, setInteractive] = useState(false);

  useEffect(() => {
    if (!open) {
      setInteractive(false);
      return;
    }
    setInteractive(false);
    const delayMs = reducedMotion ? 380 : 1680;
    const id = window.setTimeout(() => setInteractive(true), delayMs);
    return () => window.clearTimeout(id);
  }, [open, reducedMotion, winner, finalGameState.roundNumber]);

  if (!open) return null;

  const bodyKey =
    winner === "P1"
      ? "gameOver.body.P1"
      : winner === "P2"
        ? "gameOver.body.P2"
        : "gameOver.body.DRAW";

  const titleKey = gameOverFinisherTitleKey(winner, finisherContext);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="game-over-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/88 px-5 backdrop-blur-sm"
    >
      <GameOverFinisher winner={winner} finalGameState={finalGameState} />

      <div
        className={[
          "relative z-[60] w-full max-w-lg rounded-2xl border border-amber-900/40 bg-gradient-to-b from-slate-950 via-slate-900 to-black p-10 text-center shadow-2xl transition-opacity duration-500 ease-out md:p-14",
          interactive ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
          interactive ? "game-over-enter game-over-card-glow" : "",
        ].join(" ")}
      >
        <p className="text-[0.7rem] font-bold uppercase tracking-[0.55em] text-slate-500">
          {t("gameOver.tagline")}
        </p>
        <h2 className="mt-3 text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
          {t("gameOver.official")}
        </h2>

        <p
          id="game-over-title"
          className="mt-6 bg-gradient-to-r from-white via-amber-100 to-amber-400 bg-clip-text text-4xl font-black leading-none tracking-tight text-transparent md:text-5xl"
        >
          {t(titleKey)}
        </p>

        <p className="mt-2 text-[0.65rem] font-bold uppercase tracking-[0.32em] text-amber-600/85">
          {t("gameOver.finisherSubtitle")}
        </p>

        <p className="mt-6 text-lg font-medium leading-relaxed text-slate-200">
          {t(bodyKey)}
        </p>

        <p className="mt-4 text-sm text-slate-500">{t("gameOver.restartHint")}</p>

        <div className="mt-12 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            disabled={!interactive}
            className="w-full rounded-xl border-2 border-amber-900/70 bg-transparent px-4 py-3.5 text-sm font-black uppercase tracking-[0.3em] text-amber-200 transition hover:border-amber-500 hover:bg-amber-950/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            onClick={onRestart}
          >
            {t("gameOver.restart")}
          </button>
          {onBackToStart ? (
            <button
              type="button"
              disabled={!interactive}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3.5 text-sm font-black uppercase tracking-[0.2em] text-slate-200 transition hover:border-amber-700/50 hover:text-amber-100 disabled:cursor-not-allowed disabled:opacity-40"
              onClick={onBackToStart}
            >
              {t("common.backToStartShort")}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
