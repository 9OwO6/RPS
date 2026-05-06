"use client";

import Image from "next/image";

import { useSound } from "@/audio/SoundContext";
import { getActionCardViewModel } from "@/components/actionCardViewModel";
import { getActionDisabledReason } from "@/components/actionUx";
import {
  localizedDisableReason,
  localizedInputShort,
  localizedInputTagline,
} from "@/i18n/gameTerms";
import { useI18n } from "@/i18n/useI18n";
import { ASSETS } from "@/lib/assetPaths";
import {
  inputActionCardBaseClasses,
  inputActionCardDisabledShellClasses,
  inputActionCardHoverClasses,
  inputActionCardSelectedClasses,
  inputActionManeuverLabelHintClass,
} from "@/presentation/actionColors";
import type { InputAction, PlayerSnapshot } from "@/game/types";

const ACTION_ICONS: Record<InputAction, string> = {
  SCISSORS: ASSETS.actions.SCISSORS,
  ROCK: ASSETS.actions.ROCK,
  PAPER: ASSETS.actions.PAPER,
  HOLD: ASSETS.actions.HOLD,
};

interface ActionCardsProps {
  playerSnapshot: Pick<PlayerSnapshot, "state" | "paperStreak" | "scissorsStreak">;
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
  playerSnapshot,
  selected,
  onSelect,
  disabled = false,
  variant = "default",
  density = "default",
}: ActionCardsProps) {
  const { play } = useSound();
  const { t } = useI18n();

  if (playerSnapshot.state === "STAGGERED") return null;

  const hudDeck = variant === "deck" && density === "hud";

  const gridClass =
    variant === "deck"
      ? hudDeck
        ? "grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-2 lg:gap-1.5"
        : "grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3"
      : "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4";

  return (
    <div className={gridClass} role="group" aria-label="Choose maneuver">
      {(Object.keys(ACTION_ICONS) as InputAction[]).map((action) => {
        const view = getActionCardViewModel(playerSnapshot, action);
        const playable = !view.disabled && !disabled;
        const inactiveReasonEn = playable || disabled
          ? null
          : getActionDisabledReason(playerSnapshot, action);
        const inactiveReason =
          inactiveReasonEn === null
            ? null
            : localizedDisableReason(t, playerSnapshot, action);
        const muted = !playable;
        const reasonText =
          disabled && playable ? t("action.waitTurn") : inactiveReason;

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
                ? inputActionCardSelectedClasses(view.displayAction)
                : playable
                  ? [
                      "cursor-pointer text-slate-100",
                      inputActionCardBaseClasses(),
                      inputActionCardHoverClasses(view.displayAction),
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
                  src={ACTION_ICONS[view.displayAction]}
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
                      ? inputActionManeuverLabelHintClass(view.displayAction)
                      : "text-slate-500",
                  ].join(" ")}
                >
                  {t("action.maneuver")}
                </span>
                <span
                  className={`mt-1 block font-bold leading-tight text-white lg:mt-0 ${
                    variant === "deck"
                      ? "text-base sm:text-lg lg:text-sm lg:leading-tight"
                      : "text-lg"
                  }`}
                >
                  {view.displayKind === "forcedRockLv1"
                    ? t("action.ROCK_LV1_RELEASE.short")
                    : localizedInputShort(t, action)}
                </span>
              </div>
            </div>
            <span
              className={`mt-3 text-[0.8125rem] leading-snug lg:mt-1 lg:line-clamp-2 lg:text-[0.65rem] lg:leading-snug ${
                muted ? "text-slate-600" : "text-slate-400"
              }`}
            >
              {view.displayKind === "forcedRockLv1"
                ? t("action.ROCK_LV1_RELEASE.tagline")
                : localizedInputTagline(t, action)}
            </span>
            {muted && reasonText !== null ? (
              <span className="mt-2 rounded border border-slate-800/80 bg-slate-950/60 px-2 py-1.5 text-[0.6875rem] leading-snug text-slate-500">
                {t("action.lockedPrefix")}
                {reasonText}
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
