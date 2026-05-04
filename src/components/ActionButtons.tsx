"use client";

import type { InputAction, PlayerState } from "@/game/types";
import { getAvailableInputActions } from "@/game/actionAvailability";

const LABELS: Record<InputAction, string> = {
  SCISSORS: "Scissors",
  ROCK: "Rock",
  PAPER: "Paper",
  HOLD: "Hold",
};

interface ActionButtonsProps {
  playerState: PlayerState;
  selected: InputAction | null;
  onSelect: (action: InputAction) => void;
  disabled?: boolean;
}

export function ActionButtons({
  playerState,
  selected,
  onSelect,
  disabled = false,
}: ActionButtonsProps) {
  if (playerState === "STAGGERED") return null;

  const available = getAvailableInputActions(playerState);

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="group">
      {(Object.keys(LABELS) as InputAction[]).map((action) => {
        const enabled = available.includes(action) && !disabled;
        return (
          <button
            key={action}
            type="button"
            disabled={!enabled}
            onClick={() => onSelect(action)}
            className={`rounded-lg border px-3 py-3 text-sm font-semibold transition ${
              selected === action
                ? "border-amber-500 bg-amber-600/25 text-amber-100 shadow-[0_0_0_1px_rgba(245,158,11,0.5)]"
                : enabled
                  ? "border-slate-600 bg-slate-800 text-slate-100 hover:border-slate-500 hover:bg-slate-700"
                  : "cursor-not-allowed border-slate-800 bg-slate-900/40 text-slate-600"
            }`}
          >
            {LABELS[action]}
          </button>
        );
      })}
    </div>
  );
}
