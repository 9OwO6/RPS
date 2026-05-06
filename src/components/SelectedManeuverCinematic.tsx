"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import type { InputAction } from "@/game/types";
import { inputActionFamily } from "@/presentation/actionColors";

function cinematicToneClass(action: InputAction): string {
  switch (inputActionFamily(action)) {
    case "scissors":
      return "maneuver-cine-scissors";
    case "rock":
      return "maneuver-cine-rock";
    case "paper":
      return "maneuver-cine-paper";
    case "hold":
      return "maneuver-cine-hold";
    default:
      return "maneuver-cine-neutral";
  }
}

export function SelectedManeuverCinematic({
  action,
  iconSrc,
  anchorLeftPx,
  variant = "deck",
  portraitSide = "left",
}: {
  action: InputAction;
  iconSrc: string;
  anchorLeftPx: number | null;
  variant?: "deck" | "portrait";
  portraitSide?: "left" | "right";
}) {
  const tone = cinematicToneClass(action);
  const [pulseKey, setPulseKey] = useState(0);

  useEffect(() => {
    setPulseKey((v) => v + 1);
  }, [action]);

  const portraitAnchorClass =
    portraitSide === "right"
      ? "maneuver-cine-root-portrait-anchor-right"
      : "maneuver-cine-root-portrait-anchor-left";

  const wrapperClass =
    variant === "portrait"
      ? [
          "pointer-events-none absolute z-[12] overflow-visible",
          // Corner badge: overlaps frame chrome near bottom edge, stays away from face (upper portrait).
          portraitSide === "right"
            ? "bottom-[2.5%] right-[2.5%] sm:bottom-[3%] sm:right-[3%]"
            : "bottom-[2.5%] left-[2.5%] sm:bottom-[3%] sm:left-[3%]",
        ].join(" ")
      : "pointer-events-none absolute top-1 z-[30] overflow-visible transition-[left] duration-220 ease-out";

  const wrapperStyle =
    variant === "portrait"
      ? undefined
      : {
          left: anchorLeftPx === null ? "50%" : `${anchorLeftPx}px`,
          transform: "translateX(-50%)",
        };

  return (
    <div className={wrapperClass} style={wrapperStyle}>
      <div
        className={`maneuver-cine-root ${tone} ${
          variant === "portrait"
            ? `maneuver-cine-root-portrait ${portraitAnchorClass}`
            : ""
        }`}
      >
        <div className="maneuver-cine-backdrop" aria-hidden />
        <div className="maneuver-cine-aura" aria-hidden />
        <div className="maneuver-cine-ring" aria-hidden />
        <div key={`burst-${pulseKey}`} className="maneuver-cine-ring-burst" aria-hidden />
        <div className="maneuver-cine-ring-rotate" aria-hidden />
        <div key={`flash-${pulseKey}`} className="maneuver-cine-flash" aria-hidden />

        {/* Action-specific accents (pure CSS) */}
        <div className="maneuver-cine-accent" aria-hidden>
          <div key={`accent-a-${pulseKey}`} className="maneuver-cine-accent-a" />
          <div key={`accent-b-${pulseKey}`} className="maneuver-cine-accent-b" />
        </div>

        <div className="maneuver-cine-artWrap" aria-hidden>
          <Image
            src={iconSrc}
            alt=""
            fill
            sizes={
              variant === "portrait"
                ? "(max-width: 640px) 72px, (max-width: 1024px) 80px, 88px"
                : "(max-width: 640px) 140px, (max-width: 1024px) 170px, 210px"
            }
            className="maneuver-cine-artImg"
          />
        </div>
      </div>
    </div>
  );
}

