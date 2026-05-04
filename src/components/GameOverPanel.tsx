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
      return "Player 1 wins";
    case "P2":
      return "Player 2 wins";
    case "DRAW":
      return "Draw — both duelists fell";
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-6"
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-600 bg-slate-900 p-8 text-center shadow-2xl">
        <h2 id="game-over-title" className="text-2xl font-bold text-white">
          Game over
        </h2>
        <p className="mt-4 text-lg text-amber-300">{outcomeLabel(winner)}</p>
        <button
          type="button"
          className="mt-8 w-full rounded-lg border border-slate-500 px-4 py-3 font-semibold text-slate-100 transition hover:bg-slate-800"
          onClick={onRestart}
        >
          Restart game
        </button>
      </div>
    </div>
  );
}
