"use client";

import type { RoundLog } from "@/game/types";

interface BattleLogProps {
  logs: RoundLog[];
}

export function BattleLog({ logs }: BattleLogProps) {
  return (
    <section
      aria-label="Battle log"
      className="rounded-xl border border-slate-700 bg-slate-900/80 p-4 shadow-lg"
    >
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
        Battle log
      </h2>
      <div className="max-h-72 space-y-4 overflow-y-auto text-sm text-slate-200 md:max-h-96">
        {logs.length === 0 ? (
          <p className="text-slate-500">No rounds played yet.</p>
        ) : (
          logs.map((entry, idx) => (
            <article key={`log-${idx}-r${entry.round}`}>
              <h3 className="font-medium text-amber-400/90">
                Round {entry.round}
              </h3>
              <ul className="mt-1 list-inside list-disc space-y-1 text-slate-300">
                {entry.messages.map((line, i) => (
                  <li key={`${entry.round}-${i}`} className="leading-relaxed">
                    {line}
                  </li>
                ))}
              </ul>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
