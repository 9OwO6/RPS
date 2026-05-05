"use client";

import Image from "next/image";

import { useSound } from "@/audio/SoundContext";
import { ACTION_TAGLINES, getActionDisabledReason } from "@/components/actionUx";
import { ASSETS } from "@/lib/assetPaths";
import {
  inputActionCardBaseClasses,
  inputActionCardDisabledShellClasses,
  inputActionCardHoverClasses,
  inputActionCardSelectedClasses,
  inputActionManeuverLabelHintClass,
} from "@/presentation/actionColors";
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
  /** Wider bottom-deck row for arena layout. */
  variant?: "default" | "deck";
  /**
   * Desktop HUD: shorter maneuver cards (still 4-up). Mobile/tablet unchanged.
   * Only applies when variant is `deck`.
   */
  density?: "default" | "hud";
}

export function ActionButtons({
  playerState,
  selected,
  onSelect,
  disabled = false,
  variant = "default",
  density = "default",
}: ActionCardsProps) {
  const { play } = useSound();

  if (playerState === "STAGGERED") return null;

  const available = getAvailableInputActions(playerState);

  const hudDeck = variant === "deck" && density === "hud";

  const gridClass =
    variant === "deck"
      ? hudDeck
        ? "grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-2 lg:gap-1.5"
        : "grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3"
      : "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4";

  return (
    <div className={gridClass} role="group" aria-label="Choose maneuver">
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

        const deckSizing =
          variant === "deck"
            ? hudDeck
              ? "min-h-[6.75rem] px-2.5 py-2.5 sm:min-h-[7.25rem] sm:px-3 sm:py-3 lg:min-h-0 lg:min-h-[4.25rem] lg:max-h-[5.25rem] lg:px-2 lg:py-2"
              : "min-h-[6.75rem] px-2.5 py-2.5 sm:min-h-[7.25rem] sm:px-3 sm:py-3"
            : "min-h-[8.75rem] px-4 py-3";

        return (
          <button
            key={action}
            type="button"
            disabled={!playable}
            onClick={() => {
              if (playable) play("UI_SELECT");
              onSelect(action);
            }}
            className={[
              "flex flex-col rounded-xl border text-left shadow-md outline-none ring-offset-2 ring-offset-slate-950/90 transition-all duration-300 ease-out",
              deckSizing,
              hudDeck ? "lg:justify-center" : "",
              "focus-visible:ring-2 focus-visible:ring-amber-400/70",
              selected === action && playable
                ? inputActionCardSelectedClasses(action)
                : playable
                  ? [
                      "cursor-pointer text-slate-100",
                      inputActionCardBaseClasses(),
                      inputActionCardHoverClasses(action),
                    ].join(" ")
                  : inputActionCardDisabledShellClasses(),
            ].join(" ")}
          >
            <div
              className={
                hudDeck
                  ? "flex items-start gap-3 lg:flex-row lg:items-center lg:gap-2"
                  : "flex items-start gap-3"
              }
            >
              <div
                className={`relative h-9 w-9 shrink-0 sm:h-10 sm:w-10 lg:h-8 lg:w-8 ${iconDimmed ? "opacity-[0.42]" : "opacity-100"}`}
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
              <div className="min-w-0 flex-1 lg:flex lg:min-h-0 lg:flex-col lg:justify-center">
                <span
                  className={[
                    "text-[0.65rem] font-bold uppercase tracking-[0.2em] lg:text-[0.55rem] lg:leading-none",
                    playable
                      ? inputActionManeuverLabelHintClass(action)
                      : "text-slate-500",
                  ].join(" ")}
                >
                  Maneuver
                </span>
                <span
                  className={`mt-1 block font-bold leading-tight text-white lg:mt-0 ${
                    variant === "deck"
                      ? "text-base sm:text-lg lg:text-sm lg:leading-tight"
                      : "text-lg"
                  }`}
                >
                  {TITLES[action]}
                </span>
              </div>
            </div>
            <span
              className={`mt-3 text-[0.8125rem] leading-snug lg:mt-1 lg:line-clamp-2 lg:text-[0.65rem] lg:leading-snug ${
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
