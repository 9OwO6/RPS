"use client";

import Image from "next/image";
import { useMemo } from "react";

import { ASSETS } from "@/lib/assetPaths";
import type { EffectiveAction, GameState } from "@/game/types";
import {
  type CombatAnimationType,
  getActionIconPathFromEffectiveAction,
  getCombatAnimationType,
  getCombatCaption,
  getEffectiveActionLabel,
} from "@/presentation/combatAnimation";
import {
  clashIconGlowPaper,
  clashIconGlowRock,
  clashIconGlowScissors,
  effectiveActionIconGlowClass,
  effectiveActionTileBorderClass,
} from "@/presentation/actionColors";

function centerMotionClass(type: CombatAnimationType): string {
  switch (type) {
    case "SCISSORS_BEATS_PAPER":
      return "combat-fx-scissors-slash";
    case "PAPER_COUNTERS_ROCK":
      return "combat-fx-paper-wrap";
    case "ROCK_BEATS_SCISSORS":
      return "combat-fx-rock-drop";
    case "SCISSORS_CHIPS_ROCK_CHARGE":
      return "combat-fx-chip";
    case "ROCK_CHARGE":
      return "combat-fx-rock-pulse";
    case "ROCK_HOLD":
      return "combat-fx-rock-hold";
    case "MIRROR_SCISSORS":
    case "MIRROR_ROCK":
      return "combat-fx-mirror";
    case "NEUTRAL":
      return "combat-fx-neutral";
    case "STAGGER_SKIP":
    case "INVALID":
      return "combat-fx-shake";
    default: {
      const _e: never = type;
      return _e;
    }
  }
}

function EffectiveTile({
  side,
  action,
  animSide,
}: {
  side: "P1" | "P2";
  action: EffectiveAction;
  animSide: "left" | "right";
}) {
  const path = getActionIconPathFromEffectiveAction(action);
  const label = getEffectiveActionLabel(action);
  const slide = animSide === "left" ? "combat-in-left" : "combat-in-right";

  const tileBorder = effectiveActionTileBorderClass(action);

  return (
    <div
      className={`flex flex-col items-center gap-2 rounded-xl border bg-slate-950/75 p-4 shadow-inner backdrop-blur-sm ${tileBorder} ${slide}`}
    >
      <span className="text-[0.6rem] font-bold uppercase tracking-[0.35em] text-slate-500">
        {side}
      </span>
      {path ? (
        <div
          className={`relative h-16 w-16 p-1 ${effectiveActionIconGlowClass(action)}`}
        >
          <Image
            src={path}
            alt=""
            fill
            sizes="64px"
            className="object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.55)]"
          />
        </div>
      ) : (
        <span className="rounded-md border border-slate-600/70 bg-slate-950/70 px-2 py-1 text-[0.65rem] font-black uppercase tracking-widest text-slate-400">
          {action === "STUNNED_SKIP" ? "Skip" : "Invalid"}
        </span>
      )}
      <span className="max-w-[10rem] text-center text-[0.7rem] leading-snug text-slate-400">
        {label}
      </span>
    </div>
  );
}

function ClashCenter({ type }: { type: CombatAnimationType }) {
  const motion = centerMotionClass(type);
  const rock = ASSETS.actions.ROCK;
  const paper = ASSETS.actions.PAPER;
  const scissors = ASSETS.actions.SCISSORS;

  if (type === "STAGGER_SKIP" || type === "INVALID") {
    return (
      <div
        className={`flex min-h-[5.5rem] flex-col items-center justify-center gap-2 rounded-xl border border-slate-700/80 bg-black/40 px-4 py-3 ${motion}`}
      >
        <span className="text-[0.65rem] font-black uppercase tracking-[0.3em] text-slate-400">
          {type === "INVALID" ? "Broken form" : "Yielded beat"}
        </span>
        <span className="text-center text-xs text-slate-500">
          {type === "INVALID"
            ? "Resolve reads the ledger for what failed."
            : "Staggered fighter could not commit a maneuver."}
        </span>
      </div>
    );
  }

  if (type === "MIRROR_SCISSORS") {
    return (
      <div
        className={`flex min-h-[5.5rem] items-center justify-center gap-3 ${motion}`}
      >
        <div className="relative h-14 w-14">
          <Image
            src={scissors}
            alt=""
            fill
            className={`object-contain ${clashIconGlowScissors()}`}
          />
        </div>
        <span className="text-lg font-black text-slate-500/90">×</span>
        <div className="relative h-14 w-14">
          <Image
            src={scissors}
            alt=""
            fill
            className={`object-contain ${clashIconGlowScissors()}`}
          />
        </div>
      </div>
    );
  }

  if (type === "MIRROR_ROCK") {
    return (
      <div
        className={`flex min-h-[5.5rem] items-center justify-center gap-3 ${motion}`}
      >
        <div className="relative h-14 w-14">
          <Image
            src={rock}
            alt=""
            fill
            className={`object-contain ${clashIconGlowRock()}`}
          />
        </div>
        <span className="text-lg font-black text-slate-500/90">×</span>
        <div className="relative h-14 w-14">
          <Image
            src={rock}
            alt=""
            fill
            className={`object-contain ${clashIconGlowRock()}`}
          />
        </div>
      </div>
    );
  }

  if (type === "SCISSORS_BEATS_PAPER") {
    return (
      <div className="relative flex min-h-[5.5rem] w-full max-w-[14rem] items-center justify-center">
        <div className="relative h-14 w-14 opacity-55">
          <Image
            src={paper}
            alt=""
            fill
            className={`object-contain ${clashIconGlowPaper()}`}
          />
        </div>
        <div className={`relative z-10 h-16 w-16 ${motion}`}>
          <Image
            src={scissors}
            alt=""
            fill
            className={`object-contain ${clashIconGlowScissors()}`}
          />
        </div>
      </div>
    );
  }

  if (type === "PAPER_COUNTERS_ROCK") {
    return (
      <div className="relative flex min-h-[5.5rem] w-full max-w-[14rem] items-center justify-center">
        <div className="relative z-0 h-12 w-12 opacity-60">
          <Image
            src={rock}
            alt=""
            fill
            className={`object-contain ${clashIconGlowRock()}`}
          />
        </div>
        <div className={`relative z-10 -ml-4 h-16 w-16 ${motion}`}>
          <Image
            src={paper}
            alt=""
            fill
            className={`object-contain ${clashIconGlowPaper()}`}
          />
        </div>
      </div>
    );
  }

  if (type === "ROCK_BEATS_SCISSORS") {
    return (
      <div className="relative flex min-h-[5.5rem] w-full max-w-[14rem] flex-col items-center justify-end gap-1">
        <div className={`relative h-[4.25rem] w-[4.25rem] ${motion}`}>
          <Image
            src={rock}
            alt=""
            fill
            className={`object-contain ${clashIconGlowRock()}`}
          />
        </div>
        <div className="relative h-10 w-10 opacity-70">
          <Image
            src={scissors}
            alt=""
            fill
            className={`object-contain ${clashIconGlowScissors()}`}
          />
        </div>
      </div>
    );
  }

  if (type === "SCISSORS_CHIPS_ROCK_CHARGE") {
    return (
      <div className="relative flex min-h-[5.5rem] w-full max-w-[14rem] items-center justify-center gap-2">
        <div className={`relative h-14 w-14 ${motion}`}>
          <Image
            src={scissors}
            alt=""
            fill
            className={`object-contain ${clashIconGlowScissors()}`}
          />
        </div>
        <div className="relative h-12 w-12 opacity-70">
          <Image
            src={rock}
            alt=""
            fill
            className={`object-contain ${clashIconGlowRock()}`}
          />
        </div>
        <span className="absolute bottom-1 rounded border border-slate-700/60 bg-slate-950/90 px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-slate-400">
          chip
        </span>
      </div>
    );
  }

  if (type === "ROCK_CHARGE" || type === "ROCK_HOLD") {
    return (
      <div
        className={`flex min-h-[5.5rem] items-center justify-center ${motion}`}
      >
        <div className="relative h-[4.5rem] w-[4.5rem]">
          <Image
            src={rock}
            alt=""
            fill
            className={`object-contain ${clashIconGlowRock()}`}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex min-h-[5.5rem] items-center justify-center rounded-xl border border-slate-800/80 bg-slate-950/40 px-6 ${motion}`}
    >
      <div className="relative h-12 w-12 opacity-75">
        <Image
          src={rock}
          alt=""
          fill
          className={`object-contain ${clashIconGlowRock()}`}
        />
      </div>
      <span className="mx-3 text-xs font-bold uppercase tracking-widest text-slate-500">
        vs
      </span>
      <div className="relative h-12 w-12 opacity-75">
        <Image
          src={scissors}
          alt=""
          fill
          className={`object-contain ${clashIconGlowScissors()}`}
        />
      </div>
    </div>
  );
}

interface CombatRevealProps {
  prevState: GameState;
  nextState: GameState;
  /** Remount to replay CSS animations when a new round resolves. */
  replayKey: string | number;
}

export function CombatReveal({
  prevState,
  nextState,
  replayKey,
}: CombatRevealProps) {
  const le = nextState.lastEffectiveActions;
  const animType = useMemo(
    () => getCombatAnimationType(prevState, nextState),
    [prevState, nextState],
  );
  const caption = useMemo(() => getCombatCaption(animType), [animType]);

  if (!le) return null;

  return (
    <section
      id={`combat-reveal-${replayKey}`}
      aria-label="Combat reveal"
      className="rounded-xl border border-amber-900/35 bg-slate-950/60 p-5 shadow-[0_0_0_1px_rgba(245,158,11,0.1)] backdrop-blur-md"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-800/80 pb-3">
        <h2 className="text-sm font-bold uppercase tracking-[0.25em] text-amber-500/90">
          Clash tableau
        </h2>
        <span className="text-[0.65rem] text-slate-500">
          Round {nextState.roundNumber - 1} resolve
        </span>
      </div>

      <div className="mt-5 grid grid-cols-1 items-stretch gap-6 md:grid-cols-[1fr_minmax(10rem,14rem)_1fr] md:gap-4">
        <EffectiveTile side="P1" action={le.p1} animSide="left" />
        <div className="flex flex-col items-center justify-center gap-2 border-y border-slate-800/60 py-4 md:border-x md:border-y-0 md:py-0">
          <ClashCenter type={animType} />
        </div>
        <EffectiveTile side="P2" action={le.p2} animSide="right" />
      </div>

      <p className="mt-5 text-center text-sm font-medium leading-snug text-slate-200">
        {caption}
      </p>
    </section>
  );
}
