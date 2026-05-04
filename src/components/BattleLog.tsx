"use client";

import { useEffect, useRef } from "react";

import type { RoundLog } from "@/game/types";

interface BattleLogProps {
  logs: RoundLog[];
}

export function BattleLog({ logs }: BattleLogProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
  }, [logs]);

  return (
    <section
      aria-label="Battle log"
      className="rounded-2xl border border-slate-700/85 bg-slate-950/60 p-5 shadow-inner backdrop-blur-md"
    >
      <h2 className="border-b border-slate-800 pb-3 text-xs font-bold uppercase tracking-[0.35em] text-slate-500">
        Battle chronicle
      </h2>
      <div className="mt-4 max-h-[22rem] space-y-6 overflow-y-auto pr-2 text-sm text-slate-200 md:max-h-[28rem]">
        {logs.length === 0 ? (
          <p className="py-4 text-center text-slate-600">
            No rounds recorded yet — the field is silent.
          </p>
        ) : (
          logs.map((entry, idx) => (
            <article
              key={`log-${idx}-r${entry.round}`}
              className="rounded-xl border border-l-4 border-l-amber-600/80 border-slate-800 bg-slate-900/50 px-4 py-3 shadow-md"
            >
              <h3 className="text-base font-black uppercase tracking-[0.2em] text-amber-300/95">
                Round {entry.round}
              </h3>
              <ul className="mt-3 space-y-2 border-t border-slate-800 pt-3 text-[0.9rem] leading-relaxed text-slate-300">
                {entry.messages.map((line, i) => (
                  <li key={`${entry.round}-${i}`} className="flex gap-2">
                    <span className="shrink-0 text-amber-700/95" aria-hidden>
                      ▸
                    </span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))
        )}
        <div ref={endRef} className="h-px shrink-0" aria-hidden />
      </div>
    </section>
  );
}
