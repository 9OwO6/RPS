import type { EffectiveAction, InputAction } from "@/game/types";

/** Blade logic: scissors = white/silver, rock = cold blue, paper = crimson, hold = softer blue charge. */
export type ActionColorFamily = "scissors" | "rock" | "paper" | "hold" | "neutral";

export function inputActionFamily(action: InputAction): ActionColorFamily {
  switch (action) {
    case "SCISSORS":
      return "scissors";
    case "ROCK":
      return "rock";
    case "PAPER":
      return "paper";
    case "HOLD":
      return "hold";
    default: {
      const _e: never = action;
      return _e;
    }
  }
}

export function effectiveActionFamily(action: EffectiveAction): ActionColorFamily {
  switch (action) {
    case "SCISSORS_ATTACK":
      return "scissors";
    case "ROCK_START_CHARGE":
    case "ROCK_HOLD_CHARGE":
    case "ROCK_RELEASE_LV1":
    case "ROCK_RELEASE_LV2":
      return "rock";
    case "PAPER_COUNTER":
    case "PAPER_EXHAUSTED":
      return "paper";
    case "STUNNED_SKIP":
    case "INVALID":
      return "neutral";
    default: {
      const _x: never = action;
      return _x;
    }
  }
}

/** Playable card base (dark tactical, no heavy fill). */
export function inputActionCardBaseClasses(): string {
  return "border-slate-600/90 bg-slate-800/90";
}

/** Hover hint for playable, non-selected cards. */
export function inputActionCardHoverClasses(action: InputAction): string {
  const f = inputActionFamily(action);
  switch (f) {
    case "scissors":
      return "hover:border-slate-400/55 hover:shadow-[0_0_18px_-4px_rgba(248,250,252,0.12)]";
    case "rock":
      return "hover:border-sky-500/35 hover:shadow-[0_0_18px_-4px_rgba(56,189,248,0.14)]";
    case "paper":
      return "hover:border-red-500/35 hover:shadow-[0_0_18px_-4px_rgba(248,113,113,0.12)]";
    case "hold":
      return "hover:border-sky-400/25 hover:shadow-[0_0_16px_-4px_rgba(125,211,252,0.1)]";
    default:
      return "hover:border-slate-500/50 hover:bg-slate-800";
  }
}

/** Selected + playable: stronger accent ring and glow (still not full-bleed fill). */
export function inputActionCardSelectedClasses(action: InputAction): string {
  const f = inputActionFamily(action);
  switch (f) {
    case "scissors":
      return [
        "z-[1] -translate-y-1 border-slate-300/50 bg-slate-900/92 text-slate-50",
        "shadow-[0_14px_32px_-10px_rgba(248,250,252,0.22),inset_0_0_0_1px_rgba(248,250,252,0.12)]",
        "ring-2 ring-slate-200/35",
      ].join(" ");
    case "rock":
      return [
        "z-[1] -translate-y-1 border-sky-400/45 bg-slate-900/92 text-slate-50",
        "shadow-[0_14px_32px_-10px_rgba(56,189,248,0.28),inset_0_0_0_1px_rgba(125,211,252,0.15)]",
        "ring-2 ring-sky-400/40",
      ].join(" ");
    case "paper":
      return [
        "z-[1] -translate-y-1 border-red-500/40 bg-slate-900/92 text-slate-50",
        "shadow-[0_14px_32px_-10px_rgba(248,113,113,0.22),inset_0_0_0_1px_rgba(248,113,113,0.12)]",
        "ring-2 ring-red-400/35",
      ].join(" ");
    case "hold":
      return [
        "z-[1] -translate-y-1 border-sky-300/35 bg-slate-900/92 text-slate-50",
        "shadow-[0_12px_28px_-10px_rgba(125,211,252,0.18),inset_0_0_0_1px_rgba(56,189,248,0.1)]",
        "ring-2 ring-sky-300/30",
      ].join(" ");
    default:
      return "";
  }
}

/** Muted / illegal picks: intentionally toned down — no chroma on the card shell. */
export function inputActionCardDisabledShellClasses(): string {
  return "cursor-not-allowed border-slate-800 bg-slate-950/82 text-slate-500 opacity-[0.72]";
}

/** Icon well: tiny hint on hover path (optional bump for selected handled elsewhere). */
export function inputActionManeuverLabelHintClass(action: InputAction): string {
  const f = inputActionFamily(action);
  switch (f) {
    case "scissors":
      return "text-slate-400";
    case "rock":
      return "text-sky-300/55";
    case "paper":
      return "text-red-300/50";
    case "hold":
      return "text-sky-200/45";
    default:
      return "text-slate-500";
  }
}

/** Wrapper around revealed icon in CombatReveal / similar. */
export function effectiveActionIconGlowClass(action: EffectiveAction): string {
  const f = effectiveActionFamily(action);
  switch (f) {
    case "scissors":
      return "rounded-full shadow-[0_0_20px_-2px_rgba(248,250,252,0.35),0_0_8px_-2px_rgba(226,232,240,0.2)] ring-1 ring-slate-200/25";
    case "rock":
      return "rounded-full shadow-[0_0_22px_-2px_rgba(56,189,248,0.35),0_0_10px_-2px_rgba(14,165,233,0.18)] ring-1 ring-sky-400/30";
    case "paper":
      return "rounded-full shadow-[0_0_20px_-2px_rgba(248,113,113,0.28),0_0_8px_-2px_rgba(220,38,38,0.15)] ring-1 ring-red-400/25";
    case "neutral":
    default:
      return "rounded-full ring-1 ring-slate-600/40";
  }
}

/** Tile border accent for P1/P2 panels in combat reveal (subtle). */
export function effectiveActionTileBorderClass(action: EffectiveAction): string {
  const f = effectiveActionFamily(action);
  switch (f) {
    case "scissors":
      return "border-slate-500/70";
    case "rock":
      return "border-sky-600/45";
    case "paper":
      return "border-red-900/50";
    default:
      return "border-slate-700/90";
  }
}

/** Small ledger badge next to effective summary (subtle, readable). */
export function effectiveActionBadgeClass(action: EffectiveAction): string {
  const f = effectiveActionFamily(action);
  const base =
    "ml-2 inline-flex min-w-[1.35rem] items-center justify-center rounded border px-1 py-0.5 align-middle text-[0.58rem] font-black tabular-nums leading-none tracking-wider";
  switch (f) {
    case "scissors":
      return `${base} border-slate-400/35 bg-slate-900/80 text-slate-100 shadow-[0_0_10px_-2px_rgba(248,250,252,0.15)]`;
    case "rock":
      return `${base} border-sky-500/35 bg-slate-950/80 text-sky-100 shadow-[0_0_10px_-2px_rgba(56,189,248,0.18)]`;
    case "paper":
      return `${base} border-red-500/35 bg-slate-950/80 text-red-100/95 shadow-[0_0_10px_-2px_rgba(248,113,113,0.12)]`;
    case "neutral":
    default:
      return `${base} border-slate-600/60 bg-slate-950/70 text-slate-400`;
  }
}

export function effectiveActionBadgeLetter(action: EffectiveAction): string {
  const f = effectiveActionFamily(action);
  switch (f) {
    case "scissors":
      return "S";
    case "rock":
      return "R";
    case "paper":
      return "P";
    default:
      return action === "STUNNED_SKIP" ? "—" : "!";
  }
}

/** Clash center: icon drop-shadow filters (presentation only). */
export function clashIconGlowScissors(): string {
  return "drop-shadow-[0_0_10px_rgba(248,250,252,0.45)]";
}

export function clashIconGlowRock(): string {
  return "drop-shadow-[0_0_12px_rgba(56,189,248,0.45)]";
}

export function clashIconGlowPaper(): string {
  return "drop-shadow-[0_0_10px_rgba(248,113,113,0.4)]";
}
