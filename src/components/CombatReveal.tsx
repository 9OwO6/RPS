"use client";

import { useEffect, useMemo } from "react";

import { combatAnimationToSoundKey } from "@/audio/combatSoundMap";
import { useSound } from "@/audio/SoundContext";
import { CombatClashCinematic } from "@/components/CombatClashCinematic";
import { localizedCombatCaption } from "@/i18n/gameTerms";
import { useI18n } from "@/i18n/useI18n";
import type { GameState } from "@/game/types";
import {
  type CombatAnimationType,
  getCombatAnimationType,
} from "@/presentation/combatAnimation";

interface CombatRevealProps {
  prevState: GameState;
  nextState: GameState;
  /** Remount to replay CSS animations when a new round resolves. */
  replayKey: string | number;
}

export function CombatReveal({
  prevState,
  nextState,
  replayKey,
}: CombatRevealProps) {
  const { play } = useSound();
  const { t } = useI18n();
  const le = nextState.lastEffectiveActions;
  const animType: CombatAnimationType = useMemo(
    () => getCombatAnimationType(prevState, nextState),
    [prevState, nextState],
  );
  const caption = useMemo(
    () => localizedCombatCaption(t, animType),
    [animType, t],
  );

  useEffect(() => {
    const key = combatAnimationToSoundKey(animType);
    if (key) play(key);
  }, [replayKey, animType, play]);

  if (!le) return null;

  return (
    <section
      id={`combat-reveal-${replayKey}`}
      aria-label={t("combatReveal.aria")}
      className="rounded-2xl border border-amber-900/40 bg-gradient-to-b from-slate-950/75 via-slate-950/55 to-black/40 p-4 shadow-[0_0_40px_-12px_rgba(245,158,11,0.15)] backdrop-blur-md sm:p-5 lg:p-2.5 lg:shadow-md"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-800/80 pb-2.5 lg:pb-1.5">
        <h2 className="text-xs font-bold uppercase tracking-[0.28em] text-amber-500/95 sm:text-sm lg:text-[0.65rem]">
          {t("combatReveal.title")}
        </h2>
        <span className="text-[0.65rem] text-slate-500 lg:text-[0.6rem]">
          {t("combatReveal.roundEffective", {
            round: nextState.roundNumber - 1,
          })}
        </span>
      </div>

      <CombatClashCinematic
        prevState={prevState}
        nextState={nextState}
        replayKey={replayKey}
      />

      <p className="mt-4 text-center text-xs font-medium leading-snug text-slate-200 sm:text-sm lg:mt-2 lg:text-[0.7rem]">
        {caption}
      </p>
    </section>
  );
}
