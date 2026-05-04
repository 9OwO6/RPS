"use client";

import { describeEffectiveAction } from "@/game/logMessages";
import {
  describeStateArrow,
  type RoundSummary,
} from "@/components/roundSummary";

interface RoundResultSummaryProps {
  summary: RoundSummary;
}

export function RoundResultSummary({ summary }: RoundResultSummaryProps) {
  return (
    <section
      aria-label={`Round ${summary.roundCompleted} result`}
      className="rounded-xl border border-amber-900/40 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-5 shadow-[0_0_0_1px_rgba(245,158,11,0.12)]"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-800 pb-3">
        <h2 className="text-lg font-bold tracking-tight text-white">
          Round {summary.roundCompleted}{" "}
          <span className="font-normal text-slate-500">— result</span>
        </h2>
        <p className="text-xs uppercase tracking-widest text-amber-500/80">
          Outcome ledger
        </p>
      </div>

      <dl className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-700/90 bg-black/25 p-3">
          <dt className="text-xs uppercase tracking-wide text-slate-500">
            Player 1 maneuver
          </dt>
          <dd className="mt-1 text-sm font-medium text-slate-100">
            {describeEffectiveAction("P1", summary.p1Effective)}
          </dd>
        </div>
        <div className="rounded-lg border border-slate-700/90 bg-black/25 p-3">
          <dt className="text-xs uppercase tracking-wide text-slate-500">
            Player 2 maneuver
          </dt>
          <dd className="mt-1 text-sm font-medium text-slate-100">
            {describeEffectiveAction("P2", summary.p2Effective)}
          </dd>
        </div>
      </dl>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
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
