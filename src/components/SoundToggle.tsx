"use client";

import { useSound } from "@/audio/SoundContext";

interface SoundToggleProps {
  className?: string;
  /** Use shorter label on tight headers. */
  compact?: boolean;
}

export function SoundToggle({ className = "", compact = false }: SoundToggleProps) {
  const { muted, toggleMute } = useSound();

  return (
    <button
      type="button"
      onClick={() => {
        toggleMute();
      }}
      className={`rounded-lg border border-slate-600/80 bg-slate-950/70 px-2.5 py-1.5 text-[0.6rem] font-bold uppercase tracking-widest text-slate-300 backdrop-blur-md transition hover:border-amber-800/50 hover:bg-slate-900/80 hover:text-amber-100/90 focus-visible:outline focus-visible:ring-2 focus-visible:ring-amber-400/60 lg:px-2 lg:py-1 lg:text-[0.55rem] ${className}`}
      aria-pressed={muted}
      aria-label={muted ? "Unmute sound effects" : "Mute sound effects"}
    >
      {compact ? (muted ? "Muted" : "Sound") : muted ? "Sound · Off" : "Sound · On"}
    </button>
  );
}
