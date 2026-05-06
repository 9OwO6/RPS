"use client";

import { useI18n } from "@/i18n/useI18n";
import type { Locale } from "@/i18n/locales";

export function LanguageToggle({ className = "" }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();

  const chip = (target: Locale, label: string) => (
    <button
      key={target}
      type="button"
      onClick={() => setLocale(target)}
      aria-pressed={locale === target}
      className={[
        "rounded-md border px-2 py-1 text-[0.58rem] font-bold uppercase tracking-widest transition hover:border-amber-700/50",
        locale === target
          ? "border-amber-700/60 bg-amber-950/45 text-amber-100"
          : "border-slate-700/80 bg-slate-950/80 text-slate-400",
      ].join(" ")}
    >
      {label}
    </button>
  );

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-lg border border-slate-600/80 bg-slate-950/70 px-1.5 py-1 backdrop-blur-md ${className}`}
      role="group"
      aria-label={t("lang.switchAria")}
    >
      {chip("zh", t("lang.zh"))}
      {chip("en", t("lang.en"))}
    </div>
  );
}
