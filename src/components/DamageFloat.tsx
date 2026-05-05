"use client";

import type { DamageFloatAccent, DamageFloatTier } from "@/presentation/combatMotion";

interface DamageFloatProps {
  amount: number;
  tier?: DamageFloatTier;
  accent?: DamageFloatAccent;
}

/**
 * Floating damage number; parent should use `key` to replay per resolve.
 * Tier and accent are presentation-only (derived from HP delta + effective actions).
 */
export function DamageFloat({
  amount,
  tier = "standard",
  accent = "neutral",
}: DamageFloatProps) {
  if (amount <= 0) return null;

  return (
    <span
      className={[
        "damage-float-base damage-pop-elem pointer-events-none absolute left-1/2 top-1 z-20 -translate-x-1/2 font-black tabular-nums tracking-tight text-red-100/95",
        `damage-float-tier-${tier}`,
        accent !== "neutral" ? `damage-float-accent-${accent}` : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-hidden
    >
      -{amount}
    </span>
  );
}
