"use client";

import { useCallback, useMemo, useState } from "react";

import { ActionButtons } from "@/components/ActionButtons";
import { ArenaBackdrop } from "@/components/ArenaBackdrop";
import { BattleLog } from "@/components/BattleLog";
import { PlayerPanel } from "@/components/PlayerPanel";
import { RoundResultSummary } from "@/components/RoundResultSummary";
import { RulesReminder } from "@/components/RulesReminder";
import { TutorialLessonCard } from "@/components/TutorialLessonCard";
import { TutorialResult } from "@/components/TutorialResult";
import { buildRoundSummary } from "@/components/roundSummary";
import type { GameState, InputAction } from "@/game/types";
import { TUTORIAL_STEP_COUNT, TUTORIAL_STEPS } from "@/tutorial/tutorialSteps";
import {
  cloneGameState,
  inputActionLabel,
  resolveTutorialRound,
} from "@/tutorial/tutorialState";

interface TutorialScreenProps {
  onBack: () => void;
  onSkipToDuel: () => void;
}

export function TutorialScreen({ onBack, onSkipToDuel }: TutorialScreenProps) {
  const [lessonIndex, setLessonIndex] = useState(0);
  const [phase, setPhase] = useState<"idle" | "resolved">("idle");
  const [selectedAction, setSelectedAction] = useState<InputAction | null>(null);
  const [resolvedState, setResolvedState] = useState<GameState | null>(null);
  const [lastSuccess, setLastSuccess] = useState<boolean | null>(null);

  const step = TUTORIAL_STEPS[lessonIndex];
  const atLastLesson = lessonIndex >= TUTORIAL_STEP_COUNT - 1;

  const displayGame = useMemo(() => {
    if (phase === "resolved" && resolvedState) return resolvedState;
    return step.startingGameState;
  }, [phase, resolvedState, step.startingGameState]);

  const roundSummary = useMemo(() => {
    if (phase !== "resolved" || !resolvedState) return null;
    const prev = cloneGameState(step.startingGameState);
    return buildRoundSummary(prev, resolvedState);
  }, [phase, resolvedState, step.startingGameState]);

  const handleResolve = useCallback(() => {
    if (!selectedAction || phase === "resolved") return;
    const prev = cloneGameState(step.startingGameState);
    const next = resolveTutorialRound(prev, selectedAction, step.opponentAction);
    const ok = step.successCondition(prev, next);
    setResolvedState(next);
    setLastSuccess(ok);
    setPhase("resolved");
  }, [phase, selectedAction, step]);

  const handleRetry = useCallback(() => {
    setPhase("idle");
    setSelectedAction(null);
    setResolvedState(null);
    setLastSuccess(null);
  }, []);

  const handleNextLesson = useCallback(() => {
    if (atLastLesson) return;
    setLessonIndex((i) => i + 1);
    setPhase("idle");
    setSelectedAction(null);
    setResolvedState(null);
    setLastSuccess(null);
  }, [atLastLesson]);

  const showActionMatrix = !(phase === "resolved" && lastSuccess === true);

  return (
    <div className="relative z-10 min-h-screen">
      <ArenaBackdrop />

      <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-6 md:pb-28 md:pt-10">
        <header className="mb-8 flex flex-col gap-4 border-b border-slate-800/90 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.4em] text-slate-500">
            Training grounds
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onBack}
              className="rounded-xl border border-slate-600 bg-slate-800/90 px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-100 backdrop-blur-md hover:border-amber-500/50"
            >
              Back to Start Screen
            </button>
            <button
              type="button"
              onClick={onSkipToDuel}
              className="rounded-xl border border-amber-900/50 bg-amber-950/35 px-4 py-2 text-xs font-bold uppercase tracking-widest text-amber-100 backdrop-blur-md hover:border-amber-500/50"
            >
              Skip to Local Duel
            </button>
          </div>
        </header>

        <TutorialLessonCard
          lessonNumber={lessonIndex + 1}
          totalLessons={TUTORIAL_STEP_COUNT}
          title={step.title}
          objective={step.objective}
          explanation={step.explanation}
        />

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr,minmax(15rem,18rem)]">
          <div className="flex min-w-0 flex-col gap-10">
            <section
              aria-label="Opponent commitment"
              className="rounded-xl border border-slate-800/80 bg-slate-950/50 px-4 py-3 text-sm text-slate-300 backdrop-blur-md"
            >
              {phase === "resolved" ? (
                <p>
                  <span className="font-semibold text-slate-200">
                    Training bot played:
                  </span>{" "}
                  <span className="font-bold text-amber-200/95">
                    {inputActionLabel(step.opponentAction)}
                  </span>
                </p>
              ) : (
                <p className="text-slate-500">
                  The bot&apos;s maneuver stays hidden until you resolve your pick.
                </p>
              )}
            </section>

            <section aria-label="Tutorial duelists" className="space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-stretch lg:gap-2">
                <div className="min-w-0 flex-1">
                  <PlayerPanel
                    duelSide="left"
                    subtitle="You · Player 1"
                    snapshot={displayGame.p1}
                    isActiveTurn
                  />
                </div>
                <div className="flex shrink-0 items-center justify-center py-3 lg:w-14 lg:flex-col lg:py-0">
                  <span className="hidden h-[2px] w-full max-w-[4rem] bg-gradient-to-r from-transparent via-slate-600 to-transparent lg:block lg:h-full lg:w-[2px] lg:max-h-[6rem] lg:bg-gradient-to-b" />
                  <span className="rounded-md border border-amber-950/70 bg-black/60 px-3 py-1.5 font-mono text-xs font-black uppercase tracking-[0.4em] text-amber-500">
                    VS
                  </span>
                  <span className="hidden h-[2px] w-full max-w-[4rem] bg-gradient-to-l from-transparent via-slate-600 to-transparent lg:block lg:h-full lg:w-[2px] lg:max-h-[6rem] lg:bg-gradient-to-b" />
                </div>
                <div className="min-w-0 flex-1">
                  <PlayerPanel
                    duelSide="right"
                    subtitle="Training bot · Player 2"
                    snapshot={displayGame.p2}
                    isActiveTurn={false}
                  />
                </div>
              </div>
            </section>

            {showActionMatrix ? (
              <section className="rounded-2xl border border-slate-800/90 bg-slate-950/55 p-5 shadow-2xl backdrop-blur-md md:p-7">
                <div className="border-b border-slate-800 pb-4">
                  <h2 className="text-xs font-black uppercase tracking-[0.4em] text-slate-500">
                    Your maneuver
                  </h2>
                  <p className="mt-2 text-sm text-slate-400">
                    Choose a legal action for this stance, then resolve the drill.
                  </p>
                </div>
                <div className="mt-6 space-y-6">
                  <ActionButtons
                    playerState={step.startingGameState.p1.state}
                    selected={selectedAction}
                    onSelect={setSelectedAction}
                    disabled={phase === "resolved"}
                  />
                  <button
                    type="button"
                    disabled={!selectedAction || phase === "resolved"}
                    onClick={handleResolve}
                    className="rounded-xl bg-amber-500 px-7 py-3 text-sm font-black uppercase tracking-widest text-slate-950 shadow-lg transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-600"
                  >
                    Resolve drill
                  </button>
                </div>
              </section>
            ) : null}

            {phase === "resolved" && lastSuccess !== null ? (
              <TutorialResult
                variant={lastSuccess ? "success" : "failure"}
                message={
                  lastSuccess ? step.successMessage : step.failureMessage
                }
                onRetry={lastSuccess ? undefined : handleRetry}
                onNextLesson={lastSuccess ? handleNextLesson : undefined}
                canAdvance={!atLastLesson}
              />
            ) : null}

            {roundSummary ? <RoundResultSummary summary={roundSummary} /> : null}

            <BattleLog logs={displayGame.logs} />

            <div className="lg:hidden">
              <RulesReminder />
            </div>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-28">
              <RulesReminder />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
