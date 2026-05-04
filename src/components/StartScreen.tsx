"use client";

import type { AppMode } from "@/lib/appMode";

import { ArenaBackdrop } from "@/components/ArenaBackdrop";

interface StartScreenProps {
  onSelectMode: (mode: Exclude<AppMode, "START">) => void;
}

export function StartScreen({ onSelectMode }: StartScreenProps) {
  return (
    <div className="relative z-10 flex min-h-screen flex-col">
      <ArenaBackdrop />

      <main className="relative mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-12 sm:py-16">
        <header className="text-center">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.45em] text-amber-600/90">
            Pass-and-play arena
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">
            RPS Tactical Duel
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-slate-400">
            Martial card timing—read momentum, seal picks, and cross blades on
            resolve.
          </p>
        </header>

        <nav
          className="mt-12 flex flex-col gap-3"
          aria-label="Main menu"
        >
          <button
            type="button"
            onClick={() => onSelectMode("TUTORIAL")}
            className="rounded-xl border border-slate-600 bg-slate-800/90 px-5 py-4 text-left text-base font-bold text-slate-100 shadow-md backdrop-blur-md transition hover:border-amber-500/50 hover:bg-slate-800 focus-visible:outline focus-visible:ring-2 focus-visible:ring-amber-400/70"
          >
            Tutorial
          </button>
          <button
            type="button"
            onClick={() => onSelectMode("LOCAL_DUEL")}
            className="rounded-xl border border-amber-700/50 bg-amber-950/35 px-5 py-4 text-left text-base font-bold text-amber-50 shadow-[inset_0_0_0_1px_rgba(251,191,36,0.2)] backdrop-blur-md transition hover:border-amber-500/60 hover:bg-amber-950/50 focus-visible:outline focus-visible:ring-2 focus-visible:ring-amber-400/70"
          >
            Local Duel
          </button>
          <button
            type="button"
            onClick={() => onSelectMode("RULES")}
            className="rounded-xl border border-slate-600 bg-slate-800/90 px-5 py-4 text-left text-base font-bold text-slate-100 shadow-md backdrop-blur-md transition hover:border-amber-500/50 hover:bg-slate-800 focus-visible:outline focus-visible:ring-2 focus-visible:ring-amber-400/70"
          >
            Rules
          </button>

          <div className="my-2 border-t border-slate-800/80 pt-2" />

          <button
            type="button"
            disabled
            aria-disabled="true"
            className="cursor-not-allowed rounded-xl border border-slate-800 bg-slate-950/50 px-5 py-4 text-left text-base font-bold text-slate-600 opacity-80"
          >
            Player vs AI
            <span className="mt-1 block text-xs font-normal text-slate-600">
              Coming soon
            </span>
          </button>
          <button
            type="button"
            disabled
            aria-disabled="true"
            className="cursor-not-allowed rounded-xl border border-slate-800 bg-slate-950/50 px-5 py-4 text-left text-base font-bold text-slate-600 opacity-80"
          >
            Online Duel
            <span className="mt-1 block text-xs font-normal text-slate-600">
              Coming soon
            </span>
          </button>
        </nav>
      </main>
    </div>
  );
}
