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
      return "hover:z-[4] hover:-translate-y-[4px] hover:scale-[1.06] hover:border-slate-200/72 hover:bg-slate-900/98 hover:shadow-[0_20px_34px_-14px_rgba(248,250,252,0.44),0_0_18px_-6px_rgba(226,232,240,0.35)]";
    case "rock":
      return "hover:z-[4] hover:-translate-y-[4px] hover:scale-[1.06] hover:border-sky-300/72 hover:bg-slate-900/98 hover:shadow-[0_20px_34px_-14px_rgba(56,189,248,0.5),0_0_18px_-6px_rgba(14,165,233,0.4)]";
    case "paper":
      return "hover:z-[4] hover:-translate-y-[4px] hover:scale-[1.06] hover:border-red-300/70 hover:bg-slate-900/98 hover:shadow-[0_20px_34px_-14px_rgba(248,113,113,0.46),0_0_18px_-6px_rgba(239,68,68,0.36)]";
    case "hold":
      return "hover:z-[4] hover:-translate-y-[4px] hover:scale-[1.06] hover:border-indigo-300/62 hover:bg-slate-900/98 hover:shadow-[0_20px_34px_-14px_rgba(129,140,248,0.4),0_0_18px_-6px_rgba(125,211,252,0.32)]";
    default:
      return "hover:border-slate-500/50 hover:bg-slate-800";
  }
}

/** Selected + playable: lift + glow — inner icon/title scale handled in ActionButtons. */
export function inputActionCardSelectedClasses(action: InputAction): string {
  const f = inputActionFamily(action);
  switch (f) {
    case "scissors":
      return [
        "z-[8] -translate-y-[2px] scale-[1.03] border-slate-100/80 bg-slate-900 text-slate-50",
        "shadow-[0_18px_34px_-18px_rgba(248,250,252,0.5),0_0_18px_-10px_rgba(226,232,240,0.38),inset_0_0_0_1px_rgba(248,250,252,0.22)]",
        "ring-2 ring-slate-100/70",
      ].join(" ");
    case "rock":
      return [
        "z-[8] -translate-y-[2px] scale-[1.03] border-sky-200/78 bg-slate-900 text-slate-50",
        "shadow-[0_18px_34px_-18px_rgba(56,189,248,0.62),0_0_18px_-10px_rgba(14,165,233,0.44),inset_0_0_0_1px_rgba(125,211,252,0.26)]",
        "ring-2 ring-sky-200/68",
      ].join(" ");
    case "paper":
      return [
        "z-[8] -translate-y-[2px] scale-[1.03] border-red-200/76 bg-slate-900 text-slate-50",
        "shadow-[0_18px_34px_-18px_rgba(248,113,113,0.6),0_0_18px_-10px_rgba(239,68,68,0.42),inset_0_0_0_1px_rgba(248,113,113,0.22)]",
        "ring-2 ring-red-200/66",
      ].join(" ");
    case "hold":
      return [
        "z-[8] -translate-y-[2px] scale-[1.03] border-indigo-200/68 bg-slate-900 text-slate-50",
        "shadow-[0_18px_34px_-18px_rgba(129,140,248,0.52),0_0_18px_-10px_rgba(125,211,252,0.38),inset_0_0_0_1px_rgba(147,197,253,0.2)]",
        "ring-2 ring-indigo-200/60",
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
      return "rounded-full shadow-[0_0_30px_-4px_rgba(248,250,252,0.62),0_0_14px_-4px_rgba(226,232,240,0.38)] ring-1 ring-slate-200/40";
    case "rock":
      return "rounded-full shadow-[0_0_34px_-4px_rgba(56,189,248,0.66),0_0_16px_-4px_rgba(14,165,233,0.4)] ring-1 ring-sky-300/46";
    case "paper":
      return "rounded-full shadow-[0_0_30px_-4px_rgba(248,113,113,0.58),0_0_14px_-4px_rgba(220,38,38,0.34)] ring-1 ring-red-300/44";
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
