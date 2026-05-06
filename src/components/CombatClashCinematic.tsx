"use client";

import Image from "next/image";
import { useMemo } from "react";

import { localizedEffectiveTileLabel } from "@/i18n/gameTerms";
import { useI18n } from "@/i18n/useI18n";
import { ASSETS } from "@/lib/assetPaths";
import { getDamageTaken } from "@/presentation/battleFeedback";
import type { CombatAnimationType } from "@/presentation/combatAnimation";
import {
  getActionIconPathFromEffectiveAction,
  getCombatAnimationType,
} from "@/presentation/combatAnimation";
import {
  getDamageFloatAccentForVictim,
  getDamageFloatTier,
} from "@/presentation/combatMotion";
import {
  effectiveActionIconGlowClass,
  effectiveActionTileBorderClass,
} from "@/presentation/actionColors";
import type { EffectiveAction, GameState, PlayerId } from "@/game/types";

function clashLaneClass(
  side: PlayerId,
  animType: CombatAnimationType,
): string {
  const muted = animType === "INVALID" || animType === "STAGGER_SKIP";
  const charge = animType === "ROCK_CHARGE" || animType === "ROCK_HOLD";
  const neutralish =
    animType === "NEUTRAL" ||
    animType === "MIRROR_SCISSORS" ||
    animType === "MIRROR_ROCK";

  if (muted)
    return side === "P1" ? "clash-lane-p1-muted" : "clash-lane-p2-muted";
  if (charge)
    return side === "P1" ? "clash-lane-p1-charge" : "clash-lane-p2-charge";
  if (neutralish)
    return side === "P1" ? "clash-lane-p1-neutral" : "clash-lane-p2-neutral";
  return side === "P1" ? "clash-lane-p1-clash" : "clash-lane-p2-clash";
}

function ClashImpactBurst({ type }: { type: CombatAnimationType }) {
  const slug =
    type === "SCISSORS_BEATS_PAPER"
      ? "scissors"
      : type === "ROCK_BEATS_SCISSORS"
        ? "rock"
        : type === "PAPER_COUNTERS_ROCK"
          ? "paper"
          : type === "SCISSORS_CHIPS_ROCK_CHARGE"
            ? "chip"
            : type === "ROCK_CHARGE" || type === "ROCK_HOLD"
              ? "charge"
              : type === "INVALID" || type === "STAGGER_SKIP"
                ? "muted"
                : type === "MIRROR_SCISSORS" || type === "MIRROR_ROCK"
                  ? "mirror"
                  : "neutral";

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-visible clash-impact-layer clash-impact-${slug}`}
      aria-hidden
    >
      <div className="clash-impact-core" />
      {slug === "scissors" ? (
        <>
          <div className="clash-slash clash-slash-a" />
          <div className="clash-slash clash-slash-b" />
        </>
      ) : null}
      {slug === "rock" ? (
        <>
          <div className="clash-rock-wave clash-rock-wave-a" />
          <div className="clash-rock-wave clash-rock-wave-b" />
        </>
      ) : null}
      {slug === "paper" ? (
        <>
          <div className="clash-paper-ring clash-paper-ring-a" />
          <div className="clash-paper-ring clash-paper-ring-b" />
        </>
      ) : null}
      {slug === "chip" ? (
        <>
          <div className="clash-chip-scratch clash-chip-scratch-a" />
          <div className="clash-chip-spark clash-chip-spark-dot" />
        </>
      ) : null}
      {slug === "charge" ? <div className="clash-charge-aura" /> : null}
      {slug === "neutral" || slug === "mirror" ? (
        <div className="clash-neutral-spark" />
      ) : null}
      {slug === "muted" ? <div className="clash-muted-wash" /> : null}
    </div>
  );
}

function ClashDamageFloat(props: {
  victim: PlayerId;
  amount: number;
  animType: CombatAnimationType;
  prevState: GameState;
  nextState: GameState;
}) {
  const { victim, amount, animType, prevState, nextState } = props;
  const tier = getDamageFloatTier(amount);
  const accent = getDamageFloatAccentForVictim(victim, prevState, nextState);
  const counterGlint =
    animType === "PAPER_COUNTERS_ROCK" && accent === "paper";

  return (
    <span
      className={[
        "pointer-events-none absolute z-20 font-black tabular-nums tracking-tight text-red-100/95",
        "damage-float-base damage-pop-clash",
        `damage-float-tier-${tier}`,
        accent !== "neutral" ? `damage-float-accent-${accent}` : "",
        counterGlint ? "damage-float-counter-glint" : "",
        victim === "P1" ? "clash-damage-anchor-p1" : "clash-damage-anchor-p2",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-hidden
    >
      -{amount}
    </span>
  );
}

function ClashCombatantCard({
  side,
  action,
  laneClass,
}: {
  side: PlayerId;
  action: EffectiveAction;
  laneClass: string;
}) {
  const { t } = useI18n();
  const path = getActionIconPathFromEffectiveAction(action);
  const label = localizedEffectiveTileLabel(t, action);
  const tileBorder = effectiveActionTileBorderClass(action);
  const portraitSrc = side === "P1" ? ASSETS.portraits.P1 : ASSETS.portraits.P2;

  return (
    <div className="flex min-w-0 flex-col items-center gap-2 lg:gap-1.5">
      <span className="text-[0.58rem] font-bold uppercase tracking-[0.32em] text-slate-500 lg:text-[0.55rem]">
        {side}
      </span>
      <div className={`relative w-full max-w-[11rem] ${laneClass}`}>
        <div
          className={`flex flex-col items-center gap-2 rounded-xl border bg-slate-950/80 p-3 shadow-inner backdrop-blur-sm sm:p-3.5 lg:gap-1.5 lg:p-2.5 ${tileBorder}`}
        >
          <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-slate-600/55 ring-1 ring-white/10">
            <Image
              src={portraitSrc}
              alt=""
              fill
              sizes="32px"
              className="object-cover object-[center_15%]"
            />
          </div>
          {path ? (
            <div
              className={`relative mx-auto h-[5rem] w-[5rem] shrink-0 sm:h-[5.5rem] sm:w-[5.5rem] lg:h-[4.25rem] lg:w-[4.25rem] ${effectiveActionIconGlowClass(action)}`}
            >
              <Image
                src={path}
                alt=""
                fill
                sizes="(max-width: 1024px) 96px, 72px"
                className="object-contain drop-shadow-[0_4px_14px_rgba(0,0,0,0.55)]"
              />
            </div>
          ) : (
            <span className="rounded-md border border-slate-600/70 bg-slate-950/70 px-2 py-1 text-[0.62rem] font-black uppercase tracking-widest text-slate-400">
              {action === "STUNNED_SKIP"
                ? t("effective.tile.skip")
                : t("effective.tile.invalid")}
            </span>
          )}
          <span className="max-w-[11rem] text-center text-[0.72rem] leading-snug text-slate-300 lg:text-[0.68rem]">
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}

export interface CombatClashCinematicProps {
  prevState: GameState;
  nextState: GameState;
  replayKey: string | number;
}

export function CombatClashCinematic({
  prevState,
  nextState,
  replayKey,
}: CombatClashCinematicProps) {
  const le = nextState.lastEffectiveActions;
  const animType = useMemo(
    () => getCombatAnimationType(prevState, nextState),
    [prevState, nextState],
  );

  const p1Dmg = useMemo(
    () => getDamageTaken(prevState, nextState, "P1"),
    [prevState, nextState],
  );
  const p2Dmg = useMemo(
    () => getDamageTaken(prevState, nextState, "P2"),
    [prevState, nextState],
  );

  if (!le) return null;

  const laneP1 = clashLaneClass("P1", animType);
  const laneP2 = clashLaneClass("P2", animType);

  return (
    <div
      key={`clash-cine-${replayKey}`}
      className="clash-cinematic-root relative mt-3 sm:mt-4 lg:mt-2"
    >
      {p1Dmg > 0 ? (
        <ClashDamageFloat
          victim="P1"
          amount={p1Dmg}
          animType={animType}
          prevState={prevState}
          nextState={nextState}
        />
      ) : null}
      {p2Dmg > 0 ? (
        <ClashDamageFloat
          victim="P2"
          amount={p2Dmg}
          animType={animType}
          prevState={prevState}
          nextState={nextState}
        />
      ) : null}

      <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-[minmax(0,1fr)_minmax(10.5rem,14rem)_minmax(0,1fr)] md:gap-2 lg:grid-cols-[minmax(0,1fr)_minmax(9rem,12rem)_minmax(0,1fr)] lg:gap-2">
        <ClashCombatantCard side="P1" action={le.p1} laneClass={laneP1} />
        <div className="combat-stage-well clash-impact-well relative min-h-[7rem] overflow-visible rounded-xl border border-slate-800/70 bg-black/30 py-4 md:min-h-[8rem] md:py-3 lg:min-h-[6.5rem] lg:py-2">
          <ClashImpactBurst type={animType} />
        </div>
        <ClashCombatantCard side="P2" action={le.p2} laneClass={laneP2} />
      </div>
    </div>
  );
}
