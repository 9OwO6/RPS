"use client";

import { useCallback, useState } from "react";

import { ArenaBackdrop } from "@/components/ArenaBackdrop";

const PLACEHOLDER_LESSONS: { title: string; body: string }[] = [
  {
    title: "Lesson 1: Scissors beats Paper",
    body:
      "In standard RPS, Scissors cuts Paper. In this duel, that exchange still " +
      "matters when the actions clash—use it to punish reads and recover tempo.",
  },
  {
    title: "More lessons ahead",
    body:
      "Future steps will cover charging Rock, staggers, and sealed commitments. " +
      "This shell is a placeholder until those lessons ship.",
  },
];

interface TutorialScreenProps {
  onBack: () => void;
}

export function TutorialScreen({ onBack }: TutorialScreenProps) {
  const [step, setStep] = useState(0);
  const total = PLACEHOLDER_LESSONS.length;
  const atEnd = step >= total - 1;

  const handleNext = useCallback(() => {
    if (atEnd) return;
    setStep((s) => s + 1);
  }, [atEnd]);

  const lesson = PLACEHOLDER_LESSONS[step];

  return (
    <div className="relative z-10 flex min-h-screen flex-col">
      <ArenaBackdrop />

      <main className="relative mx-auto flex w-full max-w-lg flex-1 flex-col px-4 py-10">
        <header className="rounded-2xl border border-slate-800/90 bg-slate-950/55 p-6 shadow-xl backdrop-blur-md">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.35em] text-amber-600/90">
            Tutorial
          </p>
          <h1 className="mt-2 text-2xl font-black text-white">{lesson.title}</h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-300">{lesson.body}</p>
          <p className="mt-6 text-xs tabular-nums text-slate-500">
            Step {step + 1} of {total}
          </p>
        </header>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={onBack}
            className="rounded-xl border border-slate-600 bg-slate-800/90 px-5 py-3 text-sm font-bold uppercase tracking-widest text-slate-100 shadow-md backdrop-blur-md hover:border-amber-500/50"
          >
            Start Screen
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={atEnd}
            className={
              atEnd
                ? "cursor-not-allowed rounded-xl border border-slate-800 bg-slate-950/60 px-5 py-3 text-sm font-bold uppercase tracking-widest text-slate-500"
                : "rounded-xl border border-amber-800/60 bg-amber-950/40 px-5 py-3 text-sm font-bold uppercase tracking-widest text-amber-100 shadow-md hover:border-amber-500/50"
            }
          >
            {atEnd ? "End of preview" : "Continue"}
          </button>
        </div>
      </main>
    </div>
  );
}
