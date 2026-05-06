"use client";

import { useEffect, useRef } from "react";

import { translateBattleLogLine } from "@/i18n/battleLogLocale";
import { useI18n } from "@/i18n/useI18n";
import type { RoundLog } from "@/game/types";

interface BattleLogProps {
  logs: RoundLog[];
  /** Omit outer chrome when nested (e.g. inside a collapsible summary). */
  embedded?: boolean;
}

export function BattleLog({ logs, embedded = false }: BattleLogProps) {
  const { locale, t } = useI18n();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
  }, [logs]);

  const scrollClass = embedded
    ? "max-h-[min(12rem,40vh)] space-y-4 overflow-y-auto pr-2 text-xs text-slate-200 sm:max-h-[min(14rem,45vh)] sm:text-sm"
    : "mt-4 max-h-[min(14rem,38vh)] space-y-6 overflow-y-auto pr-2 text-sm text-slate-200 sm:max-h-[min(18rem,42vh)] md:max-h-[min(20rem,45vh)]";

  const inner = (
    <div className={scrollClass}>
        {logs.length === 0 ? (
          <p className="px-2 py-6 text-center text-sm leading-relaxed text-slate-500">
            No chronicle entries yet. After you resolve a round, the narrative
            lines for that encounter appear here.
          </p>
        ) : (
          logs.map((entry, idx) => (
            <article
              key={`log-${idx}-r${entry.round}`}
              className="rounded-xl border border-l-4 border-l-amber-600/80 border-slate-800 bg-slate-900/50 px-4 py-3 shadow-md"
            >
              <h3 className="text-base font-black uppercase tracking-[0.2em] text-amber-300/95">
                {t("chronicle.roundTitle", { n: entry.round })}
              </h3>
              <ul className="mt-3 space-y-2 border-t border-slate-800 pt-3 text-[0.9rem] leading-relaxed text-slate-300">
                {entry.messages.map((line, i) => (
                  <li key={`${entry.round}-${i}`} className="flex gap-2">
                    <span className="shrink-0 text-amber-700/95" aria-hidden>
                      ▸
                    </span>
                    <span>{translateBattleLogLine(locale, line)}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))
        )}
        <div ref={endRef} className="h-px shrink-0" aria-hidden />
    </div>
  );

  if (embedded) {
    return (
      <div aria-label={t("chronicle.embeddedAria")} className="min-h-0">
        {inner}
      </div>
    );
  }

  return (
    <section
      aria-label={t("chronicle.sectionAria")}
      className="rounded-2xl border border-slate-700/85 bg-slate-950/60 p-5 shadow-inner backdrop-blur-md"
    >
      <h2 className="border-b border-slate-800 pb-3 text-xs font-bold uppercase tracking-[0.35em] text-slate-500">
        {t("chronicle.sectionTitle")}
      </h2>
      {inner}
    </section>
  );
}
