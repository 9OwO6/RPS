"use client";

import { useSound } from "@/audio/SoundContext";

interface SoundToggleProps {
  className?: string;
  /** Use shorter label on tight headers. */
  compact?: boolean;
}

export function SoundToggle({ className = "", compact = false }: SoundToggleProps) {
  const {
    masterEnabled,
    musicEnabled,
    sfxEnabled,
    toggleMasterEnabled,
    toggleMusicEnabled,
    toggleSfxEnabled,
  } = useSound();

  const chipClass = (enabled: boolean) =>
    enabled
      ? "border-amber-700/60 bg-amber-950/45 text-amber-100"
      : "border-slate-700/80 bg-slate-950/80 text-slate-400";

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-lg border border-slate-600/80 bg-slate-950/70 px-1.5 py-1 backdrop-blur-md ${className}`}
      role="group"
      aria-label="Audio settings"
    >
      <button
        type="button"
        onClick={toggleMasterEnabled}
        className={`rounded-md border px-2 py-1 text-[0.58rem] font-bold uppercase tracking-widest transition hover:border-amber-700/50 ${chipClass(masterEnabled)}`}
        aria-pressed={masterEnabled}
        aria-label="Toggle master audio"
      >
        {compact ? "A" : "Audio"}
      </button>
      <button
        type="button"
        onClick={toggleMusicEnabled}
        className={`rounded-md border px-2 py-1 text-[0.58rem] font-bold uppercase tracking-widest transition hover:border-amber-700/50 ${chipClass(musicEnabled)}`}
        aria-pressed={musicEnabled}
        aria-label="Toggle music"
      >
        {compact ? "M" : "Music"}
      </button>
      <button
        type="button"
        onClick={toggleSfxEnabled}
        className={`rounded-md border px-2 py-1 text-[0.58rem] font-bold uppercase tracking-widest transition hover:border-amber-700/50 ${chipClass(sfxEnabled)}`}
        aria-pressed={sfxEnabled}
        aria-label="Toggle sound effects"
      >
        {compact ? "SFX" : "SFX"}
      </button>
    </div>
  );
}
