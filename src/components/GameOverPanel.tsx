"use client";

import { useI18n } from "@/i18n/useI18n";
import type { GameState } from "@/game/types";

interface GameOverPanelProps {
  open: boolean;
  winner: NonNullable<GameState["winner"]>;
  onRestart: () => void;
  onBackToStart?: () => void;
}

export function GameOverPanel({
  open,
  winner,
  onRestart,
  onBackToStart,
}: GameOverPanelProps) {
  const { t } = useI18n();

  if (!open) return null;

  const headlineKey =
    winner === "P1"
      ? "gameOver.headline.P1"
      : winner === "P2"
        ? "gameOver.headline.P2"
        : "gameOver.headline.DRAW";
  const bodyKey =
    winner === "P1"
      ? "gameOver.body.P1"
      : winner === "P2"
        ? "gameOver.body.P2"
        : "gameOver.body.DRAW";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="game-over-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 px-5 backdrop-blur-sm"
    >
      <div className="game-over-enter game-over-card-glow w-full max-w-lg rounded-2xl border border-amber-900/40 bg-gradient-to-b from-slate-950 via-slate-900 to-black p-10 text-center md:p-14">
        <p className="text-[0.7rem] font-bold uppercase tracking-[0.55em] text-slate-500">
          {t("gameOver.tagline")}
        </p>
        <h2 id="game-over-title" className="mt-3 text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
          {t("gameOver.official")}
        </h2>

        <p className="mt-8 bg-gradient-to-r from-white via-amber-100 to-amber-400 bg-clip-text text-4xl font-black leading-none tracking-tight text-transparent md:text-5xl">
          {t(headlineKey)}
        </p>

        <p className="mt-6 text-lg font-medium leading-relaxed text-slate-200">
          {t(bodyKey)}
        </p>

        <p className="mt-4 text-sm text-slate-500">
          {t("gameOver.restartHint")}
        </p>

        <div className="mt-12 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            className="w-full rounded-xl border-2 border-amber-900/70 bg-transparent px-4 py-3.5 text-sm font-black uppercase tracking-[0.3em] text-amber-200 transition hover:border-amber-500 hover:bg-amber-950/40 hover:text-white"
            onClick={onRestart}
          >
            {t("gameOver.restart")}
          </button>
          {onBackToStart ? (
            <button
              type="button"
              className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3.5 text-sm font-black uppercase tracking-[0.2em] text-slate-200 transition hover:border-amber-700/50 hover:text-amber-100"
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
