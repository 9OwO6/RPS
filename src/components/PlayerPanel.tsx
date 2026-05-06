"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { SelectedManeuverCinematic } from "@/components/SelectedManeuverCinematic";
import { INITIAL_HP } from "@/game/constants";
import { playerStateLongKey, playerStateShortKey } from "@/i18n/gameTerms";
import { useI18n } from "@/i18n/useI18n";
import { ASSETS } from "@/lib/assetPaths";
import type { InputAction, PlayerSnapshot, PlayerState } from "@/game/types";

/** Snapshot diff after resolve — drives hit shake / stagger pulse only. */
export interface PlayerResolveFeedback {
  roundKey: number;
  tookDamage: boolean;
  staggerIntro: boolean;
  /** HP lost this resolve; scales shake when tookDamage. */
  damageTaken?: number;
}

interface PlayerPanelProps {
  snapshot: PlayerSnapshot;
  subtitle: string;
  isActiveTurn: boolean;
  duelSide: "left" | "right";
  maxHp?: number;
  resolveFeedback?: PlayerResolveFeedback | null;
  /** `hero` = large bust portrait + compact stats (Local Duel). */
  layoutVariant?: "standard" | "arenaCompact" | "hero";
  /** Visual banding for symmetric duel layout. */
  arenaBand?: "neutral" | "opponent" | "local";
  /** Extra controls (maneuver deck, lock buttons) shown inside hero stats column. */
  heroControls?: ReactNode;
  /** Portrait-anchored selected maneuver emblem for active player. */
  selectedFocusAction?: InputAction | null;
  /** Brief clash-resolve feedback on this duelist's panel (presentation only). */
  clashDamagePulse?: boolean;
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

function hpPercent(hp: number, maxHp: number): number {
  return Math.max(
    0,
    Math.min(100, Math.round((hp / Math.max(maxHp, 1)) * 100)),
  );
}

function hitShakeClass(tookDamage: boolean, damage?: number): string {
  if (!tookDamage) return "";
  if (damage === undefined) return "hit-shake-panel";
  if (damage <= 1) return "hit-shake-panel-light";
  if (damage >= 8) return "hit-shake-panel-heavy";
  return "hit-shake-panel";
}

export function PlayerPanel({
  snapshot,
  subtitle,
  isActiveTurn,
  duelSide,
  maxHp = INITIAL_HP,
  resolveFeedback = null,
  layoutVariant = "standard",
  arenaBand = "neutral",
  heroControls,
  selectedFocusAction = null,
  clashDamagePulse = false,
}: PlayerPanelProps) {
  const { t } = useI18n();
  const compact = layoutVariant === "arenaCompact";
  const hero = layoutVariant === "hero";
  const [hitShake, setHitShake] = useState(false);
  const [staggerPulse, setStaggerPulse] = useState(false);
  const prevHpRef = useRef(snapshot.hp);
  const [trailPct, setTrailPct] = useState(() => hpPercent(snapshot.hp, maxHp));
  const hpPct = useMemo(
    () => hpPercent(snapshot.hp, maxHp),
    [snapshot.hp, maxHp],
  );

  useEffect(() => {
    const prevHp = prevHpRef.current;
    if (snapshot.hp === prevHp) return;

    if (snapshot.hp < prevHp) {
      const oldTrail = hpPercent(prevHp, maxHp);
      setTrailPct(oldTrail);
      prevHpRef.current = snapshot.hp;
      const tid = window.setTimeout(() => {
        setTrailPct(hpPercent(snapshot.hp, maxHp));
      }, 300);
      return () => window.clearTimeout(tid);
    }

    setTrailPct(hpPercent(snapshot.hp, maxHp));
    prevHpRef.current = snapshot.hp;
  }, [snapshot.hp, maxHp]);

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
  const focusIconSrc = selectedFocusAction
    ? ASSETS.actions[selectedFocusAction]
    : null;

  const portraitWrap = [
    "relative shrink-0 overflow-hidden rounded-xl border shadow-md ring-1 ring-white/10",
    compact ? "h-12 w-12 sm:h-14 sm:w-14" : "h-14 w-14 sm:h-16 sm:w-16 md:h-[4.75rem] md:w-[4.75rem]",
    isActiveTurn
      ? "border-amber-500/55 shadow-[0_0_14px_-2px_rgba(251,191,36,0.35)]"
      : "border-slate-600/55",
  ].join(" ");

  const heroPortraitShell = [
    "hero-portrait-shell relative shrink-0 rounded-2xl border bg-gradient-to-b from-slate-900/80 to-black/50 ring-1",
    // Allow the selected-move badge to sit slightly past the frame without clipping the bust.
    selectedFocusAction ? "overflow-visible" : "overflow-hidden",
    isActiveTurn
      ? "border-amber-500/55 ring-amber-400/40"
      : "border-slate-600/60 ring-white/10",
    duelSide === "right"
      ? "hero-portrait-face-left"
      : "hero-portrait-face-right",
  ].join(" ");

  const bandClass =
    arenaBand === "opponent"
      ? "border-b-2 border-b-amber-950/35 shadow-[inset_0_-12px_24px_-20px_rgba(0,0,0,0.45)] lg:border-b lg:border-b-amber-950/25 lg:shadow-none"
      : arenaBand === "local"
        ? "border-t-2 border-t-amber-900/25 shadow-[inset_0_10px_28px_-18px_rgba(251,191,36,0.06)] lg:border-t lg:border-t-amber-900/20 lg:shadow-none"
        : "";

  const shakeLayer = hitShake
    ? hitShakeClass(
        true,
        resolveFeedback?.damageTaken ?? undefined,
      )
    : "";

  return (
    <article
      className={[
        "relative overflow-hidden rounded-2xl border backdrop-blur-md transition",
        hero
          ? "border-slate-800/70 bg-gradient-to-br from-slate-950/75 via-slate-950/55 to-black/40 p-3 shadow-lg sm:p-4 md:min-h-0 lg:p-3.5"
          : compact
            ? "p-3 sm:p-4 md:min-h-0"
            : "p-5 shadow-xl md:min-h-[13rem]",
        shakeLayer,
        clashDamagePulse ? "clash-panel-recoil" : "",
        bandClass,
        !hero
          ? isActiveTurn
            ? "border-amber-500/60 bg-slate-900/78 shadow-[0_0_22px_-4px_rgba(251,191,36,0.22)] ring-2 ring-amber-500/35 ring-offset-2 ring-offset-slate-950/80"
            : "border-slate-700/90 bg-slate-950/65"
          : isActiveTurn
            ? "border-amber-700/45 shadow-[0_0_32px_-12px_rgba(251,191,36,0.18)]"
            : "border-slate-800/55 bg-slate-950/40",
      ].join(" ")}
      aria-current={isActiveTurn ? "step" : undefined}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      {clashDamagePulse ? (
        <span
          className="pointer-events-none absolute inset-0 z-[4] rounded-2xl clash-panel-flash-overlay"
          aria-hidden
        />
      ) : null}

      <div
        className={
          hero
            ? `flex flex-col items-stretch gap-4 sm:gap-5 md:flex-row md:items-start md:gap-5 lg:gap-6 ${duelSide === "right" ? "md:flex-row-reverse" : ""}`
            : `flex flex-col gap-3 sm:flex-row ${duelSide === "right" ? "sm:flex-row-reverse" : ""}`
        }
      >
        <figure
          className={
            hero
              ? `${heroPortraitShell} mx-auto aspect-[4/5] w-[min(88vw,17.5rem)] max-w-[17.5rem] shrink-0 grow-0 self-start sm:w-[min(46vw,15rem)] md:mx-0 md:w-[min(42vw,16rem)] md:max-w-[18rem] md:min-w-[10rem] lg:w-[min(36vw,17.5rem)] lg:max-w-[17.5rem] lg:min-w-[11rem]`
              : portraitWrap
          }
          aria-hidden
        >
          <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl" aria-hidden>
            <Image
              src={portraitSrc}
              alt=""
              fill
              sizes={
                hero
                  ? "(max-width: 768px) 50vw, (max-width: 1280px) 30vw, 320px"
                  : compact
                    ? "(max-width: 640px) 48px, 56px"
                    : "(max-width: 640px) 56px, 76px"
              }
              className={
                hero
                  ? "object-cover object-[center_12%] saturate-[1.05]"
                  : "object-cover object-top"
              }
              priority={hero && snapshot.id === "P1"}
            />
          </span>
          {hero ? (
            <span
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-slate-950/25"
              aria-hidden
            />
          ) : null}
          {hero && selectedFocusAction && focusIconSrc ? (
            <SelectedManeuverCinematic
              action={selectedFocusAction}
              iconSrc={focusIconSrc}
              anchorLeftPx={null}
              variant="portrait"
              portraitSide={duelSide === "right" ? "left" : "right"}
            />
          ) : null}
        </figure>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="shrink-0">
            <header className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-[0.6rem] font-bold uppercase tracking-[0.32em] text-slate-500 lg:text-[0.55rem]">
                {subtitle}
              </p>
              <h2
                className={
                  hero
                    ? "mt-0.5 text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-2xl"
                    : compact
                      ? "mt-0.5 text-xl font-black tracking-tight text-white sm:text-2xl"
                      : "mt-1 text-2xl font-black tracking-tight text-white"
                }
              >
                {badge}
              </h2>
            </div>

            <div className="text-right tabular-nums">
              <p className="text-[0.65rem] uppercase tracking-wide text-slate-500">
                {t("common.hp")}
              </p>
              <p
                className={
                  hero
                    ? "text-xl font-bold text-amber-300 sm:text-2xl lg:text-xl"
                    : compact
                      ? "text-lg font-bold text-amber-300 sm:text-xl"
                      : "text-2xl font-bold text-amber-300"
                }
              >
                {snapshot.hp}{" "}
                <span className="text-xs font-semibold text-slate-500 sm:text-sm">
                  / {maxHp}
                </span>
              </p>
            </div>
            </header>

            <div
              className={
                hero
                  ? "mt-2 space-y-0.5"
                  : compact
                    ? "mt-2 space-y-1"
                    : "mt-4 space-y-1.5"
              }
            >
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-950 ring-1 ring-slate-800 sm:h-2.5 md:h-3">
              <div
                role="presentation"
                aria-hidden
                className="hp-trail-bar absolute inset-y-0 left-0 z-0 rounded-full bg-slate-600/50 transition-[width] duration-[420ms] ease-out"
                style={{ width: `${trailPct}%` }}
              />
              <div
                role="progressbar"
                aria-valuenow={snapshot.hp}
                aria-valuemin={0}
                aria-valuemax={maxHp}
                className="relative z-[1] h-full rounded-full bg-gradient-to-r from-emerald-800 via-emerald-500 to-amber-400 transition-[width] duration-200 ease-out"
                style={{ width: `${hpPct}%` }}
              />
            </div>
            <p
              className={`text-[0.62rem] leading-tight text-slate-500 md:text-[0.65rem] ${hero ? "lg:sr-only" : ""}`}
            >
              {hero
                ? t("player.hpTrailHero", { pct: hpPct })
                : compact
                  ? t("player.hpTrailCompact", { pct: hpPct })
                  : t("player.hpTrailStandard", { pct: hpPct })}
              </p>
            </div>

            <div
              className={
                hero
                  ? "mt-2 flex flex-wrap items-center gap-1.5"
                  : compact
                    ? "mt-2 flex flex-wrap items-center gap-1.5"
                    : "mt-4 flex flex-wrap items-center gap-2"
              }
            >
              <span
                className={[
                  "rounded-md border px-2 py-0.5 font-mono text-[0.65rem] font-bold uppercase tracking-wider shadow-sm ring-1 sm:px-2.5 sm:py-1",
                  stateBadgeColors(snapshot.state),
                  snapshot.state === "STAGGERED" && staggerPulse
                    ? "stagger-pulse-once"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                title={t(playerStateLongKey(snapshot.state))}
              >
                {t(playerStateShortKey(snapshot.state))}
              </span>
              {snapshot.state === "STAGGERED" && staggerPulse ? (
                <span className="stagger-callout rounded border border-red-800/50 bg-red-950/40 px-1.5 py-0.5 text-[0.55rem] font-bold uppercase tracking-wider text-red-200/95 sm:text-[0.6rem]">
                  {t("player.staggerBadge")}
                </span>
              ) : null}
              {!compact && !hero ? (
                <span className="text-[0.7rem] text-slate-500">
                  {t(playerStateLongKey(snapshot.state))}
                </span>
              ) : null}
            </div>

            {hero ? (
              <div className="mt-2.5 flex flex-wrap items-center gap-2 border-t border-slate-800/35 pt-2.5 lg:mt-1.5 lg:gap-1.5 lg:border-t-0 lg:pt-1">
                <span
                  className="rounded-full border border-red-950/40 bg-black/30 px-2 py-0.5 font-mono text-[0.62rem] tabular-nums text-red-200/90"
                  title={t("player.titlePaperChain")}
                >
                  P·{snapshot.paperStreak}
                </span>
                <span
                  className="rounded-full border border-slate-600/50 bg-black/30 px-2 py-0.5 font-mono text-[0.62rem] tabular-nums text-slate-200/90"
                  title={t("player.titleScissorsChain")}
                >
                  S·{snapshot.scissorsStreak}
                </span>
              </div>
            ) : null}
          </div>

          {hero && heroControls && isActiveTurn ? (
            <p className="mt-2 shrink-0 text-left text-[0.58rem] font-bold uppercase tracking-[0.26em] text-amber-400/95 sm:text-[0.6rem] lg:text-[0.56rem]">
              {t("player.activeCommit")}
            </p>
          ) : null}
          {hero && heroControls ? (
            <div className="mt-3 min-h-0 min-w-0 flex-1 space-y-3 rounded-xl border border-slate-800/45 bg-black/22 pt-3 shadow-inner sm:mt-4 sm:space-y-3 sm:p-3 sm:pt-3 lg:mt-4 lg:space-y-2.5">
              {heroControls}
            </div>
          ) : null}
        </div>
      </div>

      {!hero ? (
        <div
          className={
            compact
              ? "mt-2.5 grid grid-cols-2 gap-1.5 sm:flex sm:flex-wrap sm:justify-end sm:gap-2"
              : "mt-5 grid grid-cols-2 gap-2"
          }
        >
          <div className="rounded-lg border border-slate-700/70 bg-black/25 px-2 py-1.5 sm:px-3 sm:py-2">
            <p className="text-[0.55rem] font-bold uppercase tracking-widest text-slate-500 sm:text-[0.6rem]">
              {t("player.paperChain")}
            </p>
            <p className="mt-0.5 text-base font-semibold tabular-nums text-amber-200/95 sm:text-lg">
              {snapshot.paperStreak}
            </p>
          </div>
          <div className="rounded-lg border border-slate-700/70 bg-black/25 px-2 py-1.5 sm:px-3 sm:py-2">
            <p className="text-[0.55rem] font-bold uppercase tracking-widest text-slate-500 sm:text-[0.6rem]">
              {t("player.scissorsChain")}
            </p>
            <p className="mt-0.5 text-base font-semibold tabular-nums text-amber-200/95 sm:text-lg">
              {snapshot.scissorsStreak}
            </p>
          </div>
        </div>
      ) : null}

      {snapshot.state === "STAGGERED" && !compact && !hero ? (
        <p className="mt-4 rounded-xl border border-red-900/50 bg-red-950/35 px-3 py-2.5 text-sm text-red-100">
          {t("player.staggerBreakStandard")}
        </p>
      ) : null}

      {snapshot.state === "STAGGERED" && (compact || hero) && !(hero && heroControls) ? (
        <p
          className={
            hero
              ? "mt-2 rounded-lg border border-red-900/40 bg-red-950/25 px-2 py-1.5 text-[0.68rem] leading-snug text-red-100/95"
              : "mt-2 rounded-lg border border-red-900/45 bg-red-950/30 px-2 py-1.5 text-[0.7rem] leading-snug text-red-100/95"
          }
        >
          {t("player.staggerSkipCompact")}
        </p>
      ) : null}

      {isActiveTurn && !(hero && heroControls) ? (
        <p
          className={
            hero
              ? "mt-2 text-left text-[0.58rem] font-bold uppercase tracking-[0.26em] text-amber-400/95 sm:text-[0.6rem] lg:mt-1"
              : compact
                ? "mt-2 text-center text-[0.6rem] font-bold uppercase tracking-[0.28em] text-amber-400/90"
                : "mt-4 text-center text-[0.7rem] font-bold uppercase tracking-[0.3em] text-amber-400/90"
          }
        >
          {t("player.activeCommit")}
        </p>
      ) : null}
    </article>
  );
}
