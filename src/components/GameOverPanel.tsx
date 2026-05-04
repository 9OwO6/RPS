"use client";

import type { GameState } from "@/game/types";

interface GameOverPanelProps {
  open: boolean;
  winner: NonNullable<GameState["winner"]>;
  onRestart: () => void;
}

function outcomeLabel(w: GameOverPanelProps["winner"]): string {
  switch (w) {
    case "P1":
      return "Player 1 claims the duel.";
    case "P2":
      return "Player 2 claims the duel.";
    case "DRAW":
      return "Stalemate — neither stands.";
    default: {
      const _x: never = w;
      return _x;
    }
  }
}

function outcomeHeadline(w: GameOverPanelProps["winner"]): string {
  switch (w) {
    case "P1":
      return "Victory · P1";
    case "P2":
      return "Victory · P2";
    case "DRAW":
      return "Draw";
    default: {
      const _x: never = w;
      return _x;
    }
  }
}

export function GameOverPanel({ open, winner, onRestart }: GameOverPanelProps) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="game-over-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 px-5 backdrop-blur-sm"
    >
      <div className="game-over-enter game-over-card-glow w-full max-w-lg rounded-2xl border border-amber-900/40 bg-gradient-to-b from-slate-950 via-slate-900 to-black p-10 text-center md:p-14">
        <p className="text-[0.7rem] font-bold uppercase tracking-[0.55em] text-slate-500">
          Duel resolved
        </p>
        <h2 id="game-over-title" className="mt-3 text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
          Official result
        </h2>

        <p className="mt-8 bg-gradient-to-r from-white via-amber-100 to-amber-400 bg-clip-text text-4xl font-black leading-none tracking-tight text-transparent md:text-5xl">
          {outcomeHeadline(winner)}
        </p>

        <p className="mt-6 text-lg font-medium leading-relaxed text-slate-200">
          {outcomeLabel(winner)}
        </p>

        <button
          type="button"
          className="mt-12 w-full rounded-xl border-2 border-amber-900/70 bg-transparent px-4 py-3.5 text-sm font-black uppercase tracking-[0.3em] text-amber-200 transition hover:border-amber-500 hover:bg-amber-950/40 hover:text-white"
          onClick={onRestart}
        >
          Restart duel
        </button>
      </div>
    </div>
  );
}
