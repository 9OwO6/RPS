"use client";

import { useI18n } from "@/i18n/useI18n";

export function RulesReminder() {
  const { t } = useI18n();

  const items = [
    "rulesReminder.paperRelease",
    "rulesReminder.scissorsPaper",
    "rulesReminder.rockScissors",
    "rulesReminder.chip",
    "rulesReminder.stagger",
  ] as const;

  return (
    <aside className="rounded-xl border border-slate-700/80 bg-slate-950/60 p-4 text-sm text-slate-300 shadow-inner backdrop-blur-md">
      <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">
        {t("rulesReminder.title")}
      </h2>
      <ul className="mt-3 space-y-2 leading-snug marker:text-amber-600/90">
        {items.map((key) => (
          <li key={key} className="flex gap-2 pl-1">
            <span className="text-amber-500/90" aria-hidden>
              ›
            </span>
            <span>{t(key)}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
