"use client";

import { describeEffectiveAction } from "@/game/logMessages";
import {
  describeStateArrow,
  type RoundSummary,
} from "@/components/roundSummary";
import {
  effectiveActionBadgeClass,
  effectiveActionBadgeLetter,
} from "@/presentation/actionColors";

interface RoundResultSummaryProps {
  summary: RoundSummary;
  /** Tighter block when nested under the central combat stage. */
  variant?: "standalone" | "embedded";
}

export function RoundResultSummary({
  summary,
  variant = "standalone",
}: RoundResultSummaryProps) {
  const embedded = variant === "embedded";

  return (
    <section
      aria-label={`Round ${summary.roundCompleted} result`}
      className={
        embedded
          ? "rounded-lg border border-slate-800/45 bg-black/18 px-2.5 py-2.5 shadow-inner backdrop-blur-sm sm:px-3 sm:py-3 lg:py-2 lg:px-2 [&_dd]:lg:text-[0.72rem] [&_dt]:lg:text-[0.58rem] [&_li]:lg:text-[0.72rem]"
          : "rounded-xl border border-amber-900/40 bg-slate-950/55 p-5 shadow-[0_0_0_1px_rgba(245,158,11,0.12)] backdrop-blur-md"
      }
    >
      <div
        className={
          embedded
            ? "flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-800/80 pb-2"
            : "flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-800 pb-3"
        }
      >
        <h2
          className={
            embedded
              ? "text-sm font-bold tracking-tight text-white sm:text-base"
              : "text-lg font-bold tracking-tight text-white"
          }
        >
          Round {summary.roundCompleted}{" "}
          <span className="font-normal text-slate-500">— ledger</span>
        </h2>
        <p className="text-[0.65rem] uppercase tracking-widest text-amber-500/80">
          Outcome
        </p>
      </div>
      {!embedded ? (
        <p className="mt-3 text-xs leading-relaxed text-slate-500">
          Letter badges (S / R / P) are a quick color key. Narration matches the
          same resolve step as the clash tableau above.
        </p>
      ) : (
        <p className="mt-2 text-[0.65rem] leading-relaxed text-slate-500">
          S / R / P badges match the clash above.
        </p>
      )}

      <dl className={embedded ? "mt-3 grid gap-3 sm:grid-cols-2" : "mt-4 grid gap-4 sm:grid-cols-2"}>
        <div className="rounded-lg border border-slate-700/90 bg-black/25 p-3">
          <dt className="text-xs uppercase tracking-wide text-slate-500">
            Player 1 maneuver
          </dt>
          <dd className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm font-medium text-slate-100">
            <span
              className={effectiveActionBadgeClass(summary.p1Effective)}
              title="Action color key"
              aria-label={`Action key ${effectiveActionBadgeLetter(summary.p1Effective)}`}
            >
              {effectiveActionBadgeLetter(summary.p1Effective)}
            </span>
            <span>{describeEffectiveAction("P1", summary.p1Effective)}</span>
          </dd>
        </div>
        <div className="rounded-lg border border-slate-700/90 bg-black/25 p-3">
          <dt className="text-xs uppercase tracking-wide text-slate-500">
            Player 2 maneuver
          </dt>
          <dd className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm font-medium text-slate-100">
            <span
              className={effectiveActionBadgeClass(summary.p2Effective)}
              title="Action color key"
              aria-label={`Action key ${effectiveActionBadgeLetter(summary.p2Effective)}`}
            >
              {effectiveActionBadgeLetter(summary.p2Effective)}
            </span>
            <span>{describeEffectiveAction("P2", summary.p2Effective)}</span>
          </dd>
        </div>
      </dl>

      <div className={embedded ? "mt-3 grid gap-3 sm:grid-cols-2" : "mt-4 grid gap-4 sm:grid-cols-2"}>
        <div className="rounded-lg border border-slate-700/70 bg-black/20 p-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Damage dealt
          </h3>
          <ul className="mt-2 space-y-1 text-sm">
            <li className="flex justify-between gap-2 tabular-nums">
              <span className="text-slate-400">To Player 1</span>
              <span className="font-semibold text-red-400/95">
                {summary.p1DamageTaken}
              </span>
            </li>
            <li className="flex justify-between gap-2 tabular-nums">
              <span className="text-slate-400">To Player 2</span>
              <span className="font-semibold text-red-400/95">
                {summary.p2DamageTaken}
              </span>
            </li>
          </ul>
        </div>

        <div className="rounded-lg border border-slate-700/70 bg-black/20 p-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Stance after round
          </h3>
          <ul className="mt-2 space-y-1 text-sm text-slate-200">
            <li className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
              <span className="text-slate-400">Player 1</span>
              <span className="font-medium text-emerald-200/90 tabular-nums sm:text-right">
                {describeStateArrow(
                  summary.p1StateBefore,
                  summary.p1StateAfter,
                )}
              </span>
            </li>
            <li className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
              <span className="text-slate-400">Player 2</span>
              <span className="font-medium text-emerald-200/90 tabular-nums sm:text-right">
                {describeStateArrow(
                  summary.p2StateBefore,
                  summary.p2StateAfter,
                )}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
