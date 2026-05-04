"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { INITIAL_HP } from "@/game/constants";
import { playerStateLabel, playerStateLongLabel } from "@/components/stateLabels";
import { ASSETS } from "@/lib/assetPaths";
import type { PlayerSnapshot, PlayerState } from "@/game/types";

/** Snapshot diff after resolve — drives hit shake / stagger pulse only. */
export interface PlayerResolveFeedback {
  roundKey: number;
  tookDamage: boolean;
  staggerIntro: boolean;
}

interface PlayerPanelProps {
  snapshot: PlayerSnapshot;
  subtitle: string;
  isActiveTurn: boolean;
  duelSide: "left" | "right";
  maxHp?: number;
  resolveFeedback?: PlayerResolveFeedback | null;
}

function stateBadgeColors(state: PlayerState): string {
  switch (state) {
    case "NORMAL":
      return "border-emerald-900/70 bg-emerald-950/50 text-emerald-200 ring-emerald-500/20";
    case "CHARGING_LV1":
      return "border-amber-800/70 bg-amber-950/50 text-amber-200 ring-amber-400/25";
    case "CHARGING_LV2":
      return "border-orange-800/70 bg-orange-950/55 text-orange-200 ring-orange-400/25";
    case "STAGGERED":
      return "border-red-900/80 bg-red-950/55 text-red-200 ring-red-400/35";
    default: {
      const _x: never = state;
      return _x;
    }
  }
}

export function PlayerPanel({
  snapshot,
  subtitle,
  isActiveTurn,
  duelSide,
  maxHp = INITIAL_HP,
  resolveFeedback = null,
}: PlayerPanelProps) {
  const [hitShake, setHitShake] = useState(false);
  const [staggerPulse, setStaggerPulse] = useState(false);

  useEffect(() => {
    if (!resolveFeedback?.tookDamage || resolveFeedback.roundKey <= 0) {
      setHitShake(false);
      return;
    }
    setHitShake(true);
    const t = window.setTimeout(() => setHitShake(false), 520);
    return () => window.clearTimeout(t);
  }, [resolveFeedback?.roundKey, resolveFeedback?.tookDamage]);

  useEffect(() => {
    if (!resolveFeedback?.staggerIntro || resolveFeedback.roundKey <= 0) {
      setStaggerPulse(false);
      return;
    }
    setStaggerPulse(true);
    const t = window.setTimeout(() => setStaggerPulse(false), 1150);
    return () => window.clearTimeout(t);
  }, [resolveFeedback?.roundKey, resolveFeedback?.staggerIntro]);

  const badge = snapshot.id === "P1" ? "P1" : "P2";
  const portraitSrc =
    snapshot.id === "P1" ? ASSETS.portraits.P1 : ASSETS.portraits.P2;

  const hpPct = Math.max(
    0,
    Math.min(100, Math.round((snapshot.hp / Math.max(maxHp, 1)) * 100)),
  );

  const portraitWrap = [
    "relative shrink-0 overflow-hidden rounded-xl border shadow-md ring-1 ring-white/10",
    "h-14 w-14 sm:h-16 sm:w-16 md:h-[4.75rem] md:w-[4.75rem]",
    isActiveTurn
      ? "border-amber-500/55 shadow-[0_0_14px_-2px_rgba(251,191,36,0.35)]"
      : duelSide === "left"
        ? "border-slate-600/55"
        : "border-slate-600/55",
  ].join(" ");

  return (
    <article
      className={[
        "relative overflow-hidden rounded-2xl border p-5 shadow-xl backdrop-blur-md transition md:min-h-[13rem]",
        hitShake ? "hit-shake-panel" : "",
        isActiveTurn
          ? "border-amber-500/60 bg-slate-900/72 shadow-[0_0_22px_-4px_rgba(251,191,36,0.22)] ring-2 ring-amber-500/35 ring-offset-2 ring-offset-slate-950/80"
          : duelSide === "left"
            ? "border-slate-700/90 bg-slate-950/60"
            : "border-slate-700/90 bg-slate-950/60",
      ].join(" ")}
      aria-current={isActiveTurn ? "step" : undefined}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      <div
        className={`flex flex-col gap-4 sm:flex-row ${duelSide === "right" ? "sm:flex-row-reverse" : ""}`}
      >
        <figure className={portraitWrap} aria-hidden>
          <Image
            src={portraitSrc}
            alt=""
            fill
            sizes="(max-width: 640px) 56px, 76px"
            className="object-cover object-top"
          />
        </figure>

        <div className="min-w-0 flex-1">
          <header className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.35em] text-slate-500">
                {subtitle}
              </p>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-white">
                {badge}
              </h2>
            </div>

            <div className="text-right tabular-nums">
              <p className="text-xs uppercase tracking-wide text-slate-500">HP</p>
              <p className="text-2xl font-bold text-amber-300">
                {snapshot.hp}{" "}
                <span className="text-sm font-semibold text-slate-500">
                  / {maxHp}
                </span>
              </p>
            </div>
          </header>

          <div className="mt-4 space-y-1.5">
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-950 ring-1 ring-slate-800">
              <div
                role="presentation"
                className="h-full rounded-full bg-gradient-to-r from-emerald-800 via-emerald-500 to-amber-400 transition-[width] duration-700 ease-out"
                style={{ width: `${hpPct}%` }}
              />
            </div>
            <p className="text-[0.7rem] text-slate-500">{hpPct}% integrity</p>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span
              className={[
                "rounded-md border px-2.5 py-1 font-mono text-[0.7rem] font-bold uppercase tracking-wider shadow-sm ring-1",
                stateBadgeColors(snapshot.state),
                snapshot.state === "STAGGERED" && staggerPulse
                  ? "stagger-pulse-once"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
              title={playerStateLongLabel(snapshot.state)}
            >
              {playerStateLabel(snapshot.state)}
            </span>
            {snapshot.state === "STAGGERED" && staggerPulse ? (
              <span className="rounded border border-red-800/50 bg-red-950/40 px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-red-200/95">
                Staggered!
              </span>
            ) : null}
            <span className="text-[0.7rem] text-slate-500">
              {playerStateLongLabel(snapshot.state)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-slate-700/70 bg-black/25 px-3 py-2">
          <p className="text-[0.6rem] font-bold uppercase tracking-widest text-slate-500">
            Paper chain
          </p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-amber-200/95">
            {snapshot.paperStreak}
          </p>
          <p className="text-[0.65rem] text-slate-500">consecutive Papers</p>
        </div>
        <div className="rounded-lg border border-slate-700/70 bg-black/25 px-3 py-2">
          <p className="text-[0.6rem] font-bold uppercase tracking-widest text-slate-500">
            Scissors chain
          </p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-amber-200/95">
            {snapshot.scissorsStreak}
          </p>
          <p className="text-[0.65rem] text-slate-500">consecutive Scissors</p>
        </div>
      </div>

      {snapshot.state === "STAGGERED" && (
        <p className="mt-4 rounded-xl border border-red-900/50 bg-red-950/35 px-3 py-2.5 text-sm text-red-100">
          Break off: you skip this clash — stance recovers afterward unless staggered again.
        </p>
      )}

      {isActiveTurn && (
        <p className="mt-4 text-center text-[0.7rem] font-bold uppercase tracking-[0.3em] text-amber-400/90">
          Active duelist · choose wisely
        </p>
      )}
    </article>
  );
}
