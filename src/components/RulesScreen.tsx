"use client";

import { ArenaBackdrop } from "@/components/ArenaBackdrop";
import { QuickRulesBlurb } from "@/components/QuickRulesBlurb";
import { RulesReminder } from "@/components/RulesReminder";

interface RulesScreenProps {
  onBack: () => void;
}

export function RulesScreen({ onBack }: RulesScreenProps) {
  return (
    <div className="relative z-10 flex min-h-screen flex-col">
      <ArenaBackdrop />

      <main className="relative mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-10 pb-14 sm:px-5">
        <header className="mb-6">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.35em] text-amber-600/90">
            Reference
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-white">
            Rules of engagement
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-400">
            Same rules the tutorial and local duel use. Scroll for detail, or
            jump back to the menu when you are ready.
          </p>
        </header>

        <QuickRulesBlurb dense className="mb-6" />

        <div className="rounded-2xl border border-slate-800/90 bg-slate-950/55 p-5 shadow-xl backdrop-blur-md md:p-7">
          <RulesReminder />
          <div className="mt-8 rounded-xl border border-slate-800/70 bg-slate-950/40 p-4 text-sm leading-snug text-slate-400">
            <p className="font-bold text-slate-300">Pass-and-play</p>
            <p className="mt-2">
              Player 1 commits a maneuver, then passes the device. Player 2
              chooses without seeing Player 1&apos;s pick until resolve.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="mt-10 self-start rounded-xl border border-slate-600 bg-slate-800/90 px-6 py-3 text-sm font-bold uppercase tracking-widest text-slate-100 shadow-md backdrop-blur-md hover:border-amber-500/50"
        >
          Back to Start Screen
        </button>
      </main>
    </div>
  );
}
