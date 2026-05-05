"use client";

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
  const textSize = dense ? "text-xs leading-snug" : "text-sm leading-relaxed";

  return (
    <section
      aria-label="How to play summary"
      className={[
        "rounded-xl border border-slate-800/85 bg-slate-950/55 px-4 py-4 text-left shadow-inner backdrop-blur-sm sm:px-5",
        dense ? "py-3" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <h2 className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-slate-500">
        How to play · quick rules
      </h2>
      <ul
        className={`mt-3 list-none space-y-2.5 ${textSize} text-slate-300`}
      >
        <li className="flex gap-2">
          <span className="shrink-0 text-amber-600/90" aria-hidden>
            ·
          </span>
          <span>Scissors beats Paper (damage + stagger when they clash).</span>
        </li>
        <li className="flex gap-2">
          <span className="shrink-0 text-amber-600/90" aria-hidden>
            ·
          </span>
          <span>Paper counters Rock only on the release — not while Rock is charging.</span>
        </li>
        <li className="flex gap-2">
          <span className="shrink-0 text-amber-600/90" aria-hidden>
            ·
          </span>
          <span>Rock release beats Scissors; Rock must charge before it can release.</span>
        </li>
        <li className="flex gap-2">
          <span className="shrink-0 text-amber-600/90" aria-hidden>
            ·
          </span>
          <span>Scissors chips charging Rock for minor damage; charge can still complete.</span>
        </li>
        <li className="flex gap-2">
          <span className="shrink-0 text-amber-600/90" aria-hidden>
            ·
          </span>
          <span>Repeating Paper is risky — the second Paper into Scissors hurts more.</span>
        </li>
        <li className="flex gap-2">
          <span className="shrink-0 text-amber-600/90" aria-hidden>
            ·
          </span>
          <span>Third consecutive Scissors becomes a Rock release.</span>
        </li>
      </ul>
    </section>
  );
}
