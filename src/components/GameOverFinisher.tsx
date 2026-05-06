"use client";

import Image from "next/image";
import { useMemo } from "react";

import { ASSETS } from "@/lib/assetPaths";
import type { EffectiveAction, GameState, PlayerId } from "@/game/types";

type FinisherStrikeTone = "silver" | "blue" | "red" | "gold" | "neutral";

function strikeToneFromEffective(e: EffectiveAction | undefined): FinisherStrikeTone {
  switch (e) {
    case "SCISSORS_ATTACK":
      return "silver";
    case "ROCK_RELEASE_LV1":
    case "ROCK_RELEASE_LV2":
    case "ROCK_START_CHARGE":
    case "ROCK_HOLD_CHARGE":
      return "blue";
    case "PAPER_COUNTER":
    case "PAPER_EXHAUSTED":
      return "red";
    default:
      return "gold";
  }
}

function winnerStrikeAction(
  winner: NonNullable<GameState["winner"]>,
  le: GameState["lastEffectiveActions"],
): EffectiveAction | undefined {
  if (!le || winner === "DRAW") return undefined;
  return winner === "P1" ? le.p1 : le.p2;
}

interface GameOverFinisherProps {
  winner: NonNullable<GameState["winner"]>;
  finalGameState: GameState;
}

export function GameOverFinisher({
  winner,
  finalGameState,
}: GameOverFinisherProps) {
  const tone = useMemo(() => {
    const le = finalGameState.lastEffectiveActions;
    return strikeToneFromEffective(winnerStrikeAction(winner, le));
  }, [finalGameState.lastEffectiveActions, winner]);

  const p1Winner = winner === "P1";
  const p2Winner = winner === "P2";
  const isDraw = winner === "DRAW";

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[55] flex flex-col items-center justify-center overflow-hidden"
      aria-hidden
    >
      <div className="go-finisher-veil absolute inset-0" />

      <div className="relative flex w-full max-w-3xl flex-1 items-center justify-center gap-6 px-6 pt-10 pb-28 md:gap-10 md:pb-32">
        {/* P1 portrait */}
        <div
          className={[
            "go-finisher-portrait-wrap relative flex shrink-0 flex-col items-center gap-2",
            p1Winner ? "go-finisher-winner" : "",
            p2Winner ? "go-finisher-loser" : "",
            isDraw ? "go-finisher-draw-side" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <div className="go-finisher-portrait-ring relative h-[min(28vw,7.5rem)] w-[min(28vw,7.5rem)] overflow-hidden rounded-full border-2 border-slate-600/60 shadow-lg md:h-[7.75rem] md:w-[7.75rem]">
            <Image
              src={ASSETS.portraits.P1}
              alt=""
              fill
              sizes="124px"
              className="object-cover object-[center_12%]"
            />
          </div>
          <span className="text-[0.58rem] font-black uppercase tracking-[0.28em] text-slate-500">
            P1
          </span>
        </div>

        {/* Center FX */}
        <div className="relative flex min-h-[6rem] min-w-[5rem] flex-1 items-center justify-center md:min-h-[7rem]">
          {isDraw ? (
            <>
              <div className="go-finisher-draw-x go-finisher-draw-x-a absolute left-1/2 top-1/2" />
              <div className="go-finisher-draw-x go-finisher-draw-x-b absolute left-1/2 top-1/2" />
              <div className="go-finisher-draw-pulse absolute left-1/2 top-1/2 rounded-full border border-slate-400/35" />
            </>
          ) : (
            <>
              <div
                className={[
                  "go-finisher-streak absolute h-[3px] w-[min(72vw,22rem)] rounded-full md:w-[24rem]",
                  p1Winner ? "go-finisher-streak-ltr" : "go-finisher-streak-rtl",
                  tone === "silver" ? "go-finisher-streak-silver" : "",
                  tone === "blue" ? "go-finisher-streak-blue" : "",
                  tone === "red" ? "go-finisher-streak-red" : "",
                  tone === "gold" ? "go-finisher-streak-gold" : "",
                  tone === "neutral" ? "go-finisher-streak-gold" : "",
                ].join(" ")}
              />
              <div
                className={[
                  "go-finisher-burst absolute h-28 w-28 rounded-full border-2 opacity-0 md:h-32 md:w-32",
                  p1Winner ? "go-finisher-burst-ltr" : "go-finisher-burst-rtl",
                  tone === "silver"
                    ? "border-slate-200/50"
                    : tone === "blue"
                      ? "border-sky-400/45"
                      : tone === "red"
                        ? "border-red-400/45"
                        : "border-amber-400/45",
                ].join(" ")}
              />
            </>
          )}
        </div>

        {/* P2 portrait */}
        <div
          className={[
            "go-finisher-portrait-wrap relative flex shrink-0 flex-col items-center gap-2",
            p2Winner ? "go-finisher-winner" : "",
            p1Winner ? "go-finisher-loser" : "",
            isDraw ? "go-finisher-draw-side" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <div className="go-finisher-portrait-ring relative h-[min(28vw,7.5rem)] w-[min(28vw,7.5rem)] overflow-hidden rounded-full border-2 border-slate-600/60 shadow-lg md:h-[7.75rem] md:w-[7.75rem]">
            <Image
              src={ASSETS.portraits.P2}
              alt=""
              fill
              sizes="124px"
              className="object-cover object-[center_12%]"
            />
          </div>
          <span className="text-[0.58rem] font-black uppercase tracking-[0.28em] text-slate-500">
            P2
          </span>
        </div>
      </div>
    </div>
  );
}
