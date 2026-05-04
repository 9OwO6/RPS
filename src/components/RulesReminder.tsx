"use client";

export function RulesReminder() {
  return (
    <aside className="rounded-xl border border-slate-700/80 bg-slate-900/70 p-4 text-sm text-slate-300 shadow-inner">
      <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">
        Tactical rules
      </h2>
      <ul className="mt-3 space-y-2 leading-snug marker:text-amber-600/90">
        <li className="flex gap-2 pl-1">
          <span className="text-amber-500/90" aria-hidden>
            ›
          </span>
          <span>Paper only counters Rock <em className="not-italic text-slate-200">release</em>.</span>
        </li>
        <li className="flex gap-2 pl-1">
          <span className="text-amber-500/90" aria-hidden>
            ›
          </span>
          <span>Scissors beats Paper.</span>
        </li>
        <li className="flex gap-2 pl-1">
          <span className="text-amber-500/90" aria-hidden>
            ›
          </span>
          <span>Rock release beats Scissors.</span>
        </li>
        <li className="flex gap-2 pl-1">
          <span className="text-amber-500/90" aria-hidden>
            ›
          </span>
          <span>Scissors only <em className="not-italic text-slate-200">chips</em> charging Rock.</span>
        </li>
        <li className="flex gap-2 pl-1">
          <span className="text-amber-500/90" aria-hidden>
            ›
          </span>
          <span>Staggered: that player skips one round (unless staggered again).</span>
        </li>
      </ul>
    </aside>
  );
}
