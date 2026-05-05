"use client";

import { useState } from "react";

import type { AiDifficulty } from "@/game/ai";
import type { AppMode } from "@/lib/appMode";

import { ArenaBackdrop } from "@/components/ArenaBackdrop";
import { QuickRulesBlurb } from "@/components/QuickRulesBlurb";
import { SoundToggle } from "@/components/SoundToggle";

interface StartScreenProps {
  onSelectMode: (mode: Exclude<AppMode, "START">) => void;
  onStartVsAi: (difficulty: AiDifficulty) => void;
}

export function StartScreen({ onSelectMode, onStartVsAi }: StartScreenProps) {
  const [aiDifficulty, setAiDifficulty] = useState<AiDifficulty>("NORMAL");

  return (
    <div className="relative z-10 flex min-h-screen flex-col">
      <ArenaBackdrop />

      <div className="pointer-events-none absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
        <div className="pointer-events-auto">
          <SoundToggle />
        </div>
      </div>

      <main className="relative mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-4 py-12 pb-16 sm:py-16">
        <header className="text-center">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.45em] text-amber-600/90">
            Pass-and-play arena
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">
            RPS Tactical Duel
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-slate-400">
            Same-table duel: seal picks, pass the device, then resolve — no
            peeking at the other fighter&apos;s card until the round locks in.
          </p>
        </header>

        <QuickRulesBlurb className="mt-10" />

        <nav
          className="mt-8 flex flex-col gap-3 sm:gap-3.5"
          aria-label="Main menu"
        >
          <button
            type="button"
            onClick={() => onSelectMode("TUTORIAL")}
            className="rounded-xl border border-slate-600 bg-slate-800/90 px-5 py-4 text-left text-base font-bold text-slate-100 shadow-md backdrop-blur-md transition hover:border-amber-500/50 hover:bg-slate-800 focus-visible:outline focus-visible:ring-2 focus-visible:ring-amber-400/70"
          >
            Tutorial
            <span className="mt-1 block text-xs font-normal text-slate-400">
              Guided drills — engine-accurate, step by step
            </span>
          </button>
          <button
            type="button"
            onClick={() => onSelectMode("LOCAL_DUEL")}
            className="rounded-xl border border-amber-700/50 bg-amber-950/35 px-5 py-4 text-left text-base font-bold text-amber-50 shadow-[inset_0_0_0_1px_rgba(251,191,36,0.2)] backdrop-blur-md transition hover:border-amber-500/60 hover:bg-amber-950/50 focus-visible:outline focus-visible:ring-2 focus-visible:ring-amber-400/70"
          >
            Local Duel
            <span className="mt-1 block text-xs font-normal text-amber-200/70">
              Pass-and-play · two humans, one device
            </span>
          </button>
          <button
            type="button"
            onClick={() => onSelectMode("RULES")}
            className="rounded-xl border border-slate-600 bg-slate-800/90 px-5 py-4 text-left text-base font-bold text-slate-100 shadow-md backdrop-blur-md transition hover:border-amber-500/50 hover:bg-slate-800 focus-visible:outline focus-visible:ring-2 focus-visible:ring-amber-400/70"
          >
            Rules
            <span className="mt-1 block text-xs font-normal text-slate-400">
              Full tactical reference
            </span>
          </button>

          <div className="my-2 border-t border-slate-800/80 pt-2" />

          <section className="rounded-xl border border-slate-600 bg-slate-800/90 px-5 py-4 text-left shadow-md backdrop-blur-md">
            <p className="text-base font-bold text-slate-100">Player vs AI</p>
            <p className="mt-1 text-xs font-normal text-slate-400">
              Basic training bot opponent
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => setAiDifficulty("EASY")}
                className={`rounded-lg border px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                  aiDifficulty === "EASY"
                    ? "border-amber-500 bg-amber-950/50 text-amber-100"
                    : "border-slate-600 bg-slate-900/70 text-slate-300 hover:border-amber-700/50"
                }`}
              >
                Easy
              </button>
              <button
                type="button"
                onClick={() => setAiDifficulty("NORMAL")}
                className={`rounded-lg border px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                  aiDifficulty === "NORMAL"
                    ? "border-amber-500 bg-amber-950/50 text-amber-100"
                    : "border-slate-600 bg-slate-900/70 text-slate-300 hover:border-amber-700/50"
                }`}
              >
                Normal
              </button>
            </div>
            <button
              type="button"
              onClick={() => onStartVsAi(aiDifficulty)}
              className="mt-3 w-full rounded-xl border border-amber-700/50 bg-amber-950/35 px-5 py-3 text-left text-sm font-bold text-amber-50 shadow-[inset_0_0_0_1px_rgba(251,191,36,0.2)] transition hover:border-amber-500/60 hover:bg-amber-950/50 focus-visible:outline focus-visible:ring-2 focus-visible:ring-amber-400/70"
            >
              Start vs AI ({aiDifficulty === "NORMAL" ? "Normal" : "Easy"})
            </button>
          </section>
          <button
            type="button"
            onClick={() => onSelectMode("ONLINE_DUEL")}
            className="rounded-xl border border-slate-600 bg-slate-800/90 px-5 py-4 text-left text-base font-bold text-slate-100 shadow-md backdrop-blur-md transition hover:border-amber-500/50 hover:bg-slate-800 focus-visible:outline focus-visible:ring-2 focus-visible:ring-amber-400/70"
          >
            Online Duel
            <span className="mt-1 block text-xs font-normal text-slate-400">
              Socket.IO duel · server resolves rounds
            </span>
          </button>
        </nav>
      </main>
    </div>
  );
}
