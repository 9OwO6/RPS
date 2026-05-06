"use client";

import Image from "next/image";
import type { CSSProperties } from "react";

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
   * `embed`: panel-integrated deck — readable taglines for zh/en in narrow column.
   */
  density?: "default" | "hud" | "embed";
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
  const embedDeck = variant === "deck" && density === "embed";

  const gridClass =
    variant === "deck"
      ? embedDeck
        ? "grid grid-cols-2 gap-2 sm:gap-2.5 lg:grid-cols-2 lg:gap-2 xl:grid-cols-4 xl:gap-2"
        : hudDeck
          ? "grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-2 lg:gap-1.5"
          : "grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3"
      : "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4";

  const actionOrder = Object.keys(ACTION_ICONS) as InputAction[];
  const selectedIndex =
    selected === null ? -1 : actionOrder.findIndex((a) => a === selected);
  return (
    <div
      className="relative overflow-visible"
      role="group"
      aria-label="Choose maneuver"
    >
      <div className={gridClass}>
      {actionOrder.map((action, idx) => {
        const view = getActionCardViewModel(playerSnapshot, action);
        const playable = !view.disabled && !disabled;
        const isSelected = selected === action && playable;
        const hasSelectedAction = selected !== null;
        const dimSiblingPick = playable && hasSelectedAction && !isSelected;
        const ghostSelectedSource = playable && hasSelectedAction && isSelected;
        const retreatOffset =
          selectedIndex < 0
            ? 0
            : idx < selectedIndex
              ? -8
              : idx > selectedIndex
                ? 8
                : 0;
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
            ? embedDeck
              ? "min-h-[7rem] px-2.5 py-2.5 sm:min-h-[7.5rem] sm:px-3 sm:py-3 md:min-h-[7.25rem] lg:min-h-[6.75rem] lg:px-2.5 lg:py-2.5 xl:min-h-[5.75rem]"
              : hudDeck
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
              "group relative flex flex-col rounded-xl border text-left shadow-md outline-none ring-offset-2 ring-offset-slate-950/90 transition-[box-shadow,border-color,background-color,transform,opacity,filter] duration-200 ease-out will-change-transform",
              deckSizing,
              hudDeck || embedDeck ? "lg:justify-center xl:justify-center" : "",
              dimSiblingPick ? "opacity-[0.8] saturate-[0.82] grayscale-[0.06]" : "",
              dimSiblingPick ? "scale-[0.96]" : "",
              "focus-visible:ring-2 focus-visible:ring-amber-400/70",
              isSelected
                ? inputActionCardSelectedClasses(view.displayAction)
                : playable
                  ? [
                      "cursor-pointer text-slate-100",
                      inputActionCardBaseClasses(),
                      inputActionCardHoverClasses(view.displayAction),
                    ].join(" ")
                  : inputActionCardDisabledShellClasses(),
            ].join(" ")}
            style={
              dimSiblingPick
                ? ({
                    transform: `translateX(${retreatOffset}px) scale(0.96)`,
                  } as CSSProperties)
                : undefined
            }
          >
            <div
              className={
                hudDeck || embedDeck
                  ? "flex items-start gap-3 lg:flex-row lg:items-center lg:gap-2"
                  : "flex items-start gap-3"
              }
            >
              <div
                className={[
                  "relative shrink-0 transition-transform duration-200 ease-out will-change-transform",
                  embedDeck
                    ? "h-9 w-9 sm:h-10 sm:w-10 lg:h-9 lg:w-9"
                    : "h-9 w-9 sm:h-10 sm:w-10 lg:h-8 lg:w-8",
                  iconDimmed ? "opacity-[0.42]" : "opacity-100",
                  ghostSelectedSource ? "opacity-[0.28]" : "",
                  isSelected && !iconDimmed
                    ? "scale-[1.16] sm:scale-[1.2] lg:scale-[1.18] drop-shadow-[0_8px_18px_rgba(0,0,0,0.52)]"
                    : playable && !iconDimmed
                      ? "group-hover:scale-[1.22] sm:group-hover:scale-[1.25] group-hover:drop-shadow-[0_8px_18px_rgba(0,0,0,0.52)]"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
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
              <div className={`min-w-0 flex-1 lg:flex lg:min-h-0 lg:flex-col lg:justify-center ${ghostSelectedSource ? "opacity-[0.45]" : ""}`}>
                <span
                  className={[
                    embedDeck
                      ? "text-[0.65rem] font-bold uppercase tracking-[0.2em] lg:text-[0.58rem]"
                      : "text-[0.65rem] font-bold uppercase tracking-[0.2em] lg:text-[0.55rem] lg:leading-none",
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
                      ? embedDeck
                        ? "text-base leading-snug sm:text-lg lg:text-[0.95rem] xl:text-sm"
                        : "text-base sm:text-lg lg:text-sm lg:leading-tight"
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
              className={`mt-3 leading-snug lg:mt-1 lg:leading-snug ${
                embedDeck
                  ? "text-[0.75rem] lg:line-clamp-3 lg:text-[0.68rem]"
                  : "text-[0.8125rem] lg:line-clamp-2 lg:text-[0.65rem]"
              } ${muted ? "text-slate-600" : "text-slate-400"}`}
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
    </div>
  );
}
