"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useSound } from "@/audio/SoundContext";
import { ActionButtons } from "@/components/ActionButtons";
import { ArenaBackdrop } from "@/components/ArenaBackdrop";
import { CollapsibleBattleLog } from "@/components/CollapsibleBattleLog";
import { CombatReveal } from "@/components/CombatReveal";
import { PlayerPanel } from "@/components/PlayerPanel";
import { RoundResultSummary } from "@/components/RoundResultSummary";
import { RulesReminder } from "@/components/RulesReminder";
import { SoundToggle } from "@/components/SoundToggle";
import { TutorialLessonCard } from "@/components/TutorialLessonCard";
import { TutorialResult } from "@/components/TutorialResult";
import { buildRoundSummary } from "@/components/roundSummary";
import { LanguageToggle } from "@/i18n/LanguageToggle";
import { localizedInputShort } from "@/i18n/gameTerms";
import { useI18n } from "@/i18n/useI18n";
import type { GameState, InputAction } from "@/game/types";
import { TUTORIAL_STEP_COUNT, TUTORIAL_STEPS } from "@/tutorial/tutorialSteps";
import { getBattleFeedback } from "@/presentation/battleFeedback";
import { getCombatAnimationType } from "@/presentation/combatAnimation";
import { cloneGameState, resolveTutorialRound } from "@/tutorial/tutorialState";

interface TutorialScreenProps {
  onBack: () => void;
  onSkipToDuel: () => void;
}

export function TutorialScreen({ onBack, onSkipToDuel }: TutorialScreenProps) {
  const { t } = useI18n();
  const [lessonIndex, setLessonIndex] = useState(0);
  const [phase, setPhase] = useState<"idle" | "resolved">("idle");
  const [selectedAction, setSelectedAction] = useState<InputAction | null>(null);
  const [resolvedState, setResolvedState] = useState<GameState | null>(null);
  const [lastSuccess, setLastSuccess] = useState<boolean | null>(null);

  const step = TUTORIAL_STEPS[lessonIndex];
  const ln = step.lessonNumber;
  const lessonPrefix = `tutorial.l${ln}`;
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

  const tutorialBattleFeedback = useMemo(() => {
    if (phase !== "resolved" || !resolvedState) return null;
    const prev = cloneGameState(step.startingGameState);
    return getBattleFeedback(prev, resolvedState);
  }, [phase, resolvedState, step.startingGameState]);

  const tutorialFeedbackKey = resolvedState?.roundNumber ?? 0;

  const { play } = useSound();

  useEffect(() => {
    if (phase !== "resolved" || !resolvedState || !tutorialBattleFeedback) return;
    const prev = cloneGameState(step.startingGameState);
    const anim = getCombatAnimationType(prev, resolvedState);
    const staggered =
      tutorialBattleFeedback.p1BecameStaggered ||
      tutorialBattleFeedback.p2BecameStaggered;
    if (!staggered || anim === "STAGGER_SKIP") return;
    const id = window.setTimeout(() => {
      play("STAGGER");
    }, 230);
    return () => window.clearTimeout(id);
  }, [
    phase,
    lessonIndex,
    resolvedState,
    step.startingGameState,
    tutorialBattleFeedback,
    tutorialFeedbackKey,
    play,
  ]);

  const handleResolve = useCallback(() => {
    if (!selectedAction || phase === "resolved") return;
    play("UI_CONFIRM");
    const prev = cloneGameState(step.startingGameState);
    const next = resolveTutorialRound(prev, selectedAction, step.opponentAction);
    const ok = step.successCondition(prev, next);
    setResolvedState(next);
    setLastSuccess(ok);
    setPhase("resolved");
  }, [phase, play, selectedAction, step]);

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

  const outcomeMessage =
    phase === "resolved" && lastSuccess !== null
      ? lastSuccess
        ? t(`${lessonPrefix}.success`)
        : t(`${lessonPrefix}.failure`)
      : "";

  return (
    <div className="relative z-10 min-h-screen">
      <ArenaBackdrop />

      <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-6 md:pb-28 md:pt-10">
        <header className="mb-8 flex flex-col gap-4 border-b border-slate-800/90 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.4em] text-slate-500">
            {t("tutorial.trainingGrounds")}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <LanguageToggle />
            <SoundToggle className="shrink-0" />
            <button
              type="button"
              onClick={onBack}
              className="rounded-xl border border-slate-600 bg-slate-800/90 px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-100 backdrop-blur-md hover:border-amber-500/50"
            >
              {t("common.backToStart")}
            </button>
            <button
              type="button"
              onClick={onSkipToDuel}
              className="rounded-xl border border-amber-900/50 bg-amber-950/35 px-4 py-2 text-xs font-bold uppercase tracking-widest text-amber-100 backdrop-blur-md hover:border-amber-500/50"
            >
              {t("tutorial.skipToLocal")}
            </button>
          </div>
        </header>

        <TutorialLessonCard
          lessonNumber={lessonIndex + 1}
          totalLessons={TUTORIAL_STEP_COUNT}
          title={t(`${lessonPrefix}.title`)}
          objective={t(`${lessonPrefix}.objective`)}
          explanation={t(`${lessonPrefix}.explanation`)}
          footerHint={t("tutorial.footerHint")}
        />

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr,minmax(15rem,18rem)]">
          <div className="flex min-w-0 flex-col gap-10">
            <p className="max-w-full break-words rounded-lg border border-slate-800/70 bg-slate-950/40 px-3 py-2.5 text-xs leading-relaxed text-slate-400 sm:text-sm">
              {t("tutorial.flow")}
            </p>

            <section
              aria-label="Opponent commitment"
              className="rounded-xl border border-slate-800/80 bg-slate-950/50 px-4 py-3 text-sm text-slate-300 backdrop-blur-md"
            >
              {phase === "resolved" ? (
                <p>
                  <span className="font-semibold text-slate-200">
                    {t("tutorial.botPlayed")}
                  </span>{" "}
                  <span className="font-bold text-amber-200/95">
                    {localizedInputShort(t, step.opponentAction)}
                  </span>
                </p>
              ) : (
                <p className="text-slate-500">{t("tutorial.botHidden")}</p>
              )}
            </section>

            <section aria-label="Tutorial duelists" className="space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-stretch lg:gap-2">
                <div className="relative min-w-0 flex-1">
                  <PlayerPanel
                    duelSide="left"
                    subtitle={t("battle.subtitle.youP1")}
                    snapshot={displayGame.p1}
                    clashDamagePulse={
                      phase === "resolved" && !!tutorialBattleFeedback?.p1Hit
                    }
                    layoutVariant="hero"
                    isActiveTurn
                    selectedFocusAction={selectedAction}
                    resolveFeedback={
                      phase === "resolved" && tutorialBattleFeedback
                        ? {
                            roundKey: tutorialFeedbackKey,
                            tookDamage: tutorialBattleFeedback.p1Hit,
                            staggerIntro: tutorialBattleFeedback.p1BecameStaggered,
                            damageTaken: tutorialBattleFeedback.p1Damage,
                          }
                        : null
                    }
                    heroControls={
                      showActionMatrix ? (
                        <div className="space-y-4 lg:space-y-3">
                          <div>
                            <h3 className="text-[0.62rem] font-black uppercase tracking-[0.32em] text-slate-500 sm:text-xs">
                              {t("tutorial.yourManeuver")}
                            </h3>
                            <p className="mt-1 text-[0.72rem] leading-snug text-slate-400 sm:text-sm">
                              {t("tutorial.pickLegal")}
                            </p>
                          </div>
                          <ActionButtons
                            variant="deck"
                            density="hud"
                            playerSnapshot={step.startingGameState.p1}
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
                            {t("tutorial.resolveDrill")}
                          </button>
                          <p className="text-[0.68rem] leading-snug text-slate-500">
                            {t("battle.deckHint")}
                          </p>
                        </div>
                      ) : undefined
                    }
                  />
                </div>
                <div className="flex shrink-0 items-center justify-center py-3 lg:w-14 lg:flex-col lg:py-0">
                  <span className="hidden h-[2px] w-full max-w-[4rem] bg-gradient-to-r from-transparent via-slate-600 to-transparent lg:block lg:h-full lg:w-[2px] lg:max-h-[6rem] lg:bg-gradient-to-b" />
                  <span className="rounded-md border border-amber-950/70 bg-black/60 px-3 py-1.5 font-mono text-xs font-black uppercase tracking-[0.4em] text-amber-500">
                    VS
                  </span>
                  <span className="hidden h-[2px] w-full max-w-[4rem] bg-gradient-to-l from-transparent via-slate-600 to-transparent lg:block lg:h-full lg:w-[2px] lg:max-h-[6rem] lg:bg-gradient-to-b" />
                </div>
                <div className="relative min-w-0 flex-1">
                  <PlayerPanel
                    duelSide="right"
                    subtitle={t("battle.subtitle.aiP2")}
                    snapshot={displayGame.p2}
                    clashDamagePulse={
                      phase === "resolved" && !!tutorialBattleFeedback?.p2Hit
                    }
                    layoutVariant="hero"
                    isActiveTurn={false}
                    resolveFeedback={
                      phase === "resolved" && tutorialBattleFeedback
                        ? {
                            roundKey: tutorialFeedbackKey,
                            tookDamage: tutorialBattleFeedback.p2Hit,
                            staggerIntro: tutorialBattleFeedback.p2BecameStaggered,
                            damageTaken: tutorialBattleFeedback.p2Damage,
                          }
                        : null
                    }
                  />
                </div>
              </div>
            </section>

            {phase === "resolved" && lastSuccess !== null ? (
              <TutorialResult
                variant={lastSuccess ? "success" : "failure"}
                message={outcomeMessage}
                onRetry={lastSuccess ? undefined : handleRetry}
                onNextLesson={lastSuccess ? handleNextLesson : undefined}
                canAdvance={!atLastLesson}
              />
            ) : null}

            {phase === "resolved" && resolvedState && roundSummary ? (
              <CombatReveal
                key={`tutorial-${lessonIndex}-${resolvedState.roundNumber}`}
                prevState={cloneGameState(step.startingGameState)}
                nextState={resolvedState}
                replayKey={`tutorial-${lessonIndex}-${resolvedState.roundNumber}`}
              />
            ) : null}

            {roundSummary ? (
              <RoundResultSummary summary={roundSummary} variant="embedded" />
            ) : null}

            <CollapsibleBattleLog logs={displayGame.logs} tone="muted" />

            <details className="rounded-xl border border-slate-800/80 bg-slate-950/40 text-slate-300 backdrop-blur-md [&_summary::-webkit-details-marker]:hidden lg:hidden">
              <summary className="cursor-pointer px-4 py-3 text-xs font-bold uppercase tracking-[0.28em] text-slate-400">
                {t("tutorial.tacticalRulesMobile")}
              </summary>
              <div className="border-t border-slate-800/70 px-3 pb-3 pt-2">
                <RulesReminder />
              </div>
            </details>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-28">
              <details className="rounded-xl border border-slate-800/80 bg-slate-950/40 backdrop-blur-md [&_summary::-webkit-details-marker]:hidden">
                <summary className="cursor-pointer px-4 py-3 text-xs font-bold uppercase tracking-[0.28em] text-slate-400">
                  {t("rulesReminder.title")}
                </summary>
                <div className="border-t border-slate-800/70 px-2 pb-3 pt-2">
                  <RulesReminder />
                </div>
              </details>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
