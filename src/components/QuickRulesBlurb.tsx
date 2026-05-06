"use client";

import { useI18n } from "@/i18n/useI18n";

interface QuickRulesBlurbProps {
  /** Extra Tailwind classes for spacing on parent layout. */
  className?: string;
  /** Tighter typography for nested screens (e.g. Rules). */
  dense?: boolean;
}

/**
 * Short at-a-glance rules — presentation only; engine remains source of truth in play.
 */
export function QuickRulesBlurb({
  className = "",
  dense = false,
}: QuickRulesBlurbProps) {
  const { t } = useI18n();
  const textSize = dense ? "text-xs leading-snug" : "text-sm leading-relaxed";

  const lines = [
    "quickRules.line1",
    "quickRules.line2",
    "quickRules.line3",
    "quickRules.line4",
    "quickRules.line5",
    "quickRules.line6",
  ] as const;

  return (
    <section
      aria-label={t("quickRules.title")}
      className={[
        "rounded-xl border border-slate-800/85 bg-slate-950/55 px-4 py-4 text-left shadow-inner backdrop-blur-sm sm:px-5",
        dense ? "py-3" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <h2 className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-slate-500">
        {t("quickRules.title")}
      </h2>
      <ul
        className={`mt-3 list-none space-y-2.5 ${textSize} text-slate-300`}
      >
        {lines.map((key) => (
          <li key={key} className="flex gap-2">
            <span className="shrink-0 text-amber-600/90" aria-hidden>
              ·
            </span>
            <span>{t(key)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
