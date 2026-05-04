"use client";

import Image from "next/image";

import { ACTION_TAGLINES, getActionDisabledReason } from "@/components/actionUx";
import { ASSETS } from "@/lib/assetPaths";
import type { InputAction, PlayerState } from "@/game/types";
import { getAvailableInputActions } from "@/game/actionAvailability";

const TITLES: Record<InputAction, string> = {
  SCISSORS: "Scissors",
  ROCK: "Rock",
  PAPER: "Paper",
  HOLD: "Hold",
};

const ACTION_ICONS: Record<InputAction, string> = {
  SCISSORS: ASSETS.actions.SCISSORS,
  ROCK: ASSETS.actions.ROCK,
  PAPER: ASSETS.actions.PAPER,
  HOLD: ASSETS.actions.HOLD,
};

interface ActionCardsProps {
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
}: ActionCardsProps) {
  if (playerState === "STAGGERED") return null;

  const available = getAvailableInputActions(playerState);

  return (
    <div
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
      role="group"
      aria-label="Choose maneuver"
    >
      {(Object.keys(TITLES) as InputAction[]).map((action) => {
        const playable = available.includes(action) && !disabled;
        const inactiveReason =
          playable ? null : getActionDisabledReason(playerState, action);
        const muted = !playable;
        const reasonText =
          disabled && playable
            ? "Wait until it is your turn to commit this pick."
            : inactiveReason;

        const iconDimmed = muted || (disabled && playable);

        return (
          <button
            key={action}
            type="button"
            disabled={!playable}
            onClick={() => onSelect(action)}
            className={[
              "flex min-h-[8.75rem] flex-col rounded-xl border px-4 py-3 text-left shadow-md transition outline-none ring-offset-2 ring-offset-slate-950/90",
              "focus-visible:ring-2 focus-visible:ring-amber-400/70",
              selected === action && playable
                ? "border-amber-400 bg-amber-950/40 text-amber-50 shadow-[inset_0_0_0_1px_rgba(251,191,36,0.35)]"
                : playable
                  ? "cursor-pointer border-slate-600 bg-slate-800/90 text-slate-100 hover:border-amber-500/50 hover:bg-slate-800"
                  : "cursor-not-allowed border-slate-800 bg-slate-950/85 text-slate-500",
            ].join(" ")}
          >
            <div className="flex items-start gap-3">
              <div
                className={`relative h-9 w-9 shrink-0 sm:h-10 sm:w-10 ${iconDimmed ? "opacity-[0.42]" : "opacity-100"}`}
                aria-hidden
              >
                <Image
                  src={ACTION_ICONS[action]}
                  alt=""
                  width={40}
                  height={40}
                  className="h-full w-full object-contain drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]"
                />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-slate-500">
                  Maneuver
                </span>
                <span className="mt-1 block text-lg font-bold leading-tight text-white">
                  {TITLES[action]}
                </span>
              </div>
            </div>
            <span
              className={`mt-3 text-[0.8125rem] leading-snug ${
                muted ? "text-slate-600" : "text-slate-400"
              }`}
            >
              {ACTION_TAGLINES[action]}
            </span>
            {muted && reasonText !== null ? (
              <span className="mt-2 rounded border border-slate-800/80 bg-slate-950/60 px-2 py-1.5 text-[0.6875rem] leading-snug text-slate-500">
                Locked: {reasonText}
              </span>
            ) : disabled && playable ? (
              <span className="mt-2 text-[0.6875rem] text-amber-200/70">
                {reasonText}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
