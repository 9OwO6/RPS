"use client";

import { BattleLog } from "@/components/BattleLog";
import { useI18n } from "@/i18n/useI18n";
import type { RoundLog } from "@/game/types";

interface CollapsibleBattleLogProps {
  logs: RoundLog[];
  /** Lower visual weight vs duelists / clash stage. */
  tone?: "default" | "muted";
  className?: string;
}

/**
 * Secondary battle narrative — collapsed by default so the duel stage stays focal.
 */
export function CollapsibleBattleLog({
  logs,
  tone = "default",
  className = "",
}: CollapsibleBattleLogProps) {
  const { t } = useI18n();
  const count = logs.length;
  const muted = tone === "muted";

  return (
    <details
      className={[
        muted
          ? "group rounded-lg border border-slate-900/50 bg-black/20 shadow-none backdrop-blur-sm"
          : "group rounded-xl border border-slate-800/80 bg-slate-950/45 shadow-inner backdrop-blur-md",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2 marker:content-none md:px-4 md:py-2.5 lg:py-1 [&::-webkit-details-marker]:hidden">
        <span
          className={
            muted
              ? "text-left text-[0.65rem] font-bold uppercase tracking-[0.22em] text-slate-500 md:text-xs md:tracking-[0.26em]"
              : "text-left text-xs font-bold uppercase tracking-[0.28em] text-slate-400"
          }
        >
          {t("chronicle.title")}
          <span className="ml-2 font-mono text-[0.6rem] font-semibold normal-case tracking-normal text-slate-600 md:text-[0.65rem]">
            ({count})
          </span>
        </span>
        <span
          className={
            muted
              ? "shrink-0 rounded border border-slate-800/70 bg-black/25 px-1.5 py-0.5 text-[0.55rem] font-bold normal-case tracking-wide text-slate-600 group-open:text-slate-500 md:px-2 md:text-[0.6rem]"
              : "shrink-0 rounded border border-slate-700/80 bg-black/30 px-2 py-1 text-[0.6rem] font-bold normal-case tracking-wide text-amber-500/90 group-open:text-amber-300"
          }
        >
          <span className="group-open:hidden">{t("chronicle.open")}</span>
          <span className="hidden group-open:inline">{t("chronicle.close")}</span>
        </span>
      </summary>
      <div
        className={
          muted
            ? "border-t border-slate-900/40 px-2 pb-2 pt-1.5 md:px-3 md:pb-3 md:pt-2"
            : "border-t border-slate-800/70 px-3 pb-3 pt-2"
        }
      >
        <BattleLog logs={logs} embedded />
      </div>
    </details>
  );
}
