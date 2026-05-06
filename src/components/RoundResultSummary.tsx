"use client";

import {
  formatStateArrow,
  localizedLedgerEffectiveLine,
} from "@/i18n/gameTerms";
import { useI18n } from "@/i18n/useI18n";
import type { RoundSummary } from "@/components/roundSummary";
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
  const { t } = useI18n();
  const embedded = variant === "embedded";

  const p1Line = localizedLedgerEffectiveLine(t, "P1", summary.p1Effective);
  const p2Line = localizedLedgerEffectiveLine(t, "P2", summary.p2Effective);
  const p1Arrow = formatStateArrow(
    t,
    summary.p1StateBefore,
    summary.p1StateAfter,
  );
  const p2Arrow = formatStateArrow(
    t,
    summary.p2StateBefore,
    summary.p2StateAfter,
  );

  const titleKey = embedded
    ? "roundSummary.titleEmbedded"
    : "roundSummary.titleStandalone";

  return (
    <section
      aria-label={t(titleKey, { n: summary.roundCompleted })}
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
          {t(titleKey, { n: summary.roundCompleted })}
        </h2>
        <p className="text-[0.65rem] uppercase tracking-widest text-amber-500/80">
          {t("roundSummary.outcome")}
        </p>
      </div>
      {!embedded ? (
        <p className="mt-3 text-xs leading-relaxed text-slate-500">
          {t("roundSummary.hintStandalone")}
        </p>
      ) : (
        <p className="mt-2 text-[0.65rem] leading-relaxed text-slate-500">
          {t("roundSummary.hintEmbedded")}
        </p>
      )}

      <dl className={embedded ? "mt-3 grid gap-3 sm:grid-cols-2" : "mt-4 grid gap-4 sm:grid-cols-2"}>
        <div className="rounded-lg border border-slate-700/90 bg-black/25 p-3">
          <dt className="text-xs uppercase tracking-wide text-slate-500">
            {t("roundSummary.p1Maneuver")}
          </dt>
          <dd className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm font-medium text-slate-100">
            <span
              className={effectiveActionBadgeClass(summary.p1Effective)}
              title={t("roundSummary.actionKeyAria")}
              aria-label={`Action key ${effectiveActionBadgeLetter(summary.p1Effective)}`}
            >
              {effectiveActionBadgeLetter(summary.p1Effective)}
            </span>
            <span>{p1Line}</span>
          </dd>
        </div>
        <div className="rounded-lg border border-slate-700/90 bg-black/25 p-3">
          <dt className="text-xs uppercase tracking-wide text-slate-500">
            {t("roundSummary.p2Maneuver")}
          </dt>
          <dd className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm font-medium text-slate-100">
            <span
              className={effectiveActionBadgeClass(summary.p2Effective)}
              title={t("roundSummary.actionKeyAria")}
              aria-label={`Action key ${effectiveActionBadgeLetter(summary.p2Effective)}`}
            >
              {effectiveActionBadgeLetter(summary.p2Effective)}
            </span>
            <span>{p2Line}</span>
          </dd>
        </div>
      </dl>

      <div className={embedded ? "mt-3 grid gap-3 sm:grid-cols-2" : "mt-4 grid gap-4 sm:grid-cols-2"}>
        <div className="rounded-lg border border-slate-700/70 bg-black/20 p-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t("roundSummary.damageDealt")}
          </h3>
          <ul className="mt-2 space-y-1 text-sm">
            <li className="flex justify-between gap-2 tabular-nums">
              <span className="text-slate-400">{t("roundSummary.toP1")}</span>
              <span className="font-semibold text-red-400/95">
                {summary.p1DamageTaken}
              </span>
            </li>
            <li className="flex justify-between gap-2 tabular-nums">
              <span className="text-slate-400">{t("roundSummary.toP2")}</span>
              <span className="font-semibold text-red-400/95">
                {summary.p2DamageTaken}
              </span>
            </li>
          </ul>
        </div>

        <div className="rounded-lg border border-slate-700/70 bg-black/20 p-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t("roundSummary.stanceAfter")}
          </h3>
          <ul className="mt-2 space-y-1 text-sm text-slate-200">
            <li className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
              <span className="text-slate-400">{t("common.player1")}</span>
              <span className="font-medium text-emerald-200/90 tabular-nums sm:text-right">
                {p1Arrow}
              </span>
            </li>
            <li className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
              <span className="text-slate-400">{t("common.player2")}</span>
              <span className="font-medium text-emerald-200/90 tabular-nums sm:text-right">
                {p2Arrow}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
