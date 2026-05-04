"use client";

import type { PlayerSnapshot, PlayerState } from "@/game/types";

interface PlayerPanelProps {
  snapshot: PlayerSnapshot;
  subtitle: string;
  isActiveTurn: boolean;
}

function formatState(state: PlayerState): string {
  switch (state) {
    case "NORMAL":
      return "Normal";
    case "CHARGING_LV1":
      return "Charging Rock (Lv1)";
    case "CHARGING_LV2":
      return "Charging Rock (Lv2)";
    case "STAGGERED":
      return "Staggered";
    default: {
      const _x: never = state;
      return _x;
    }
  }
}

export function PlayerPanel({
  snapshot,
  subtitle,
  isActiveTurn,
}: PlayerPanelProps) {
  const badge = snapshot.id === "P1" ? "P1" : "P2";

  return (
    <article
      className={`rounded-xl border p-4 shadow-inner transition ${
        isActiveTurn
          ? "border-amber-500/70 bg-slate-800/90 ring-1 ring-amber-500/30"
          : "border-slate-700 bg-slate-900/60"
      }`}
      aria-current={isActiveTurn ? "step" : undefined}
    >
      <header className="flex items-baseline justify-between gap-2">
        <h2 className="text-lg font-bold text-white">
          {badge}{" "}
          <span className="font-normal text-slate-400">— {subtitle}</span>
        </h2>
        <span className="tabular-nums text-xl font-semibold text-amber-400">
          {snapshot.hp} HP
        </span>
      </header>
      <p className="mt-2 text-sm text-slate-300">
        Status:{" "}
        <span className="font-medium text-slate-100">
          {formatState(snapshot.state)}
        </span>
      </p>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-400">
        <div>
          <dt className="uppercase tracking-wide">Paper streak</dt>
          <dd className="text-sm font-semibold text-slate-200">
            {snapshot.paperStreak}
          </dd>
        </div>
        <div>
          <dt className="uppercase tracking-wide">Scissors streak</dt>
          <dd className="text-sm font-semibold text-slate-200">
            {snapshot.scissorsStreak}
          </dd>
        </div>
      </dl>
      {snapshot.state === "STAGGERED" && (
        <p className="mt-3 rounded-lg bg-red-950/40 px-3 py-2 text-sm text-red-200">
          You are staggered and will skip this round (no action).
        </p>
      )}
    </article>
  );
}
