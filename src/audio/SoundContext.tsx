"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  pauseBgmFile,
  playBgmFile,
  playSoundFile,
  readMutedFromStorage,
  setBgmVolumeFile,
  stopBgmFile,
  writeMutedToStorage,
} from "@/audio/audioEngine";
import { BGM_PATH, SOUND_PATHS, type SoundKey } from "@/audio/soundMap";

/** Relative loudness per cue — keep combat readable, UI subtle. */
const VOLUME: Partial<Record<SoundKey, number>> = {
  UI_SELECT: 0.32,
  UI_CONFIRM: 0.4,
  ACTION_REVEAL: 0.38,
  SCISSORS_HIT: 0.44,
  PAPER_COUNTER: 0.46,
  ROCK_IMPACT: 0.48,
  CHIP_HIT: 0.36,
  CHARGE: 0.34,
  DAMAGE_LIGHT: 0.28,
  DAMAGE_HEAVY: 0.42,
  STAGGER: 0.4,
  GAME_WIN: 0.5,
  GAME_OVER: 0.45,
};
const BGM_VOLUME = 0.14;

export interface SoundContextValue {
  muted: boolean;
  setMuted: (next: boolean) => void;
  toggleMute: () => void;
  markInteracted: () => void;
  playBgm: () => void;
  pauseBgm: () => void;
  stopBgm: () => void;
  setBgmVolume: (volume: number) => void;
  /** Play by logical key; respects mute; fails silently. */
  play: (key: SoundKey, options?: { volume?: number }) => void;
}

const SoundContext = createContext<SoundContextValue | null>(null);

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [muted, setMutedState] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const bgmPausedBySystem = useRef(false);

  useEffect(() => {
    setMutedState(readMutedFromStorage());
  }, []);

  const markInteracted = useCallback(() => {
    setHasInteracted(true);
  }, []);

  useEffect(() => {
    if (hasInteracted) return;
    const onInteraction = () => setHasInteracted(true);
    window.addEventListener("pointerdown", onInteraction, { once: true });
    window.addEventListener("keydown", onInteraction, { once: true });
    return () => {
      window.removeEventListener("pointerdown", onInteraction);
      window.removeEventListener("keydown", onInteraction);
    };
  }, [hasInteracted]);

  const setMuted = useCallback((next: boolean) => {
    setMutedState(next);
    writeMutedToStorage(next);
  }, []);

  const toggleMute = useCallback(() => {
    setHasInteracted(true);
    setMutedState((m) => {
      const next = !m;
      writeMutedToStorage(next);
      return next;
    });
  }, []);

  const playBgm = useCallback(() => {
    if (muted || !hasInteracted) return;
    bgmPausedBySystem.current = false;
    void playBgmFile(BGM_PATH, BGM_VOLUME);
  }, [hasInteracted, muted]);

  const pauseBgm = useCallback(() => {
    bgmPausedBySystem.current = true;
    pauseBgmFile();
  }, []);

  const stopBgm = useCallback(() => {
    bgmPausedBySystem.current = false;
    stopBgmFile();
  }, []);

  const setBgmVolume = useCallback((volume: number) => {
    setBgmVolumeFile(volume);
  }, []);

  useEffect(() => {
    if (muted) {
      pauseBgmFile();
      return;
    }
    if (!hasInteracted) return;
    if (!bgmPausedBySystem.current) {
      void playBgmFile(BGM_PATH, BGM_VOLUME);
    }
  }, [hasInteracted, muted]);

  const play = useCallback(
    (key: SoundKey, options?: { volume?: number }) => {
      if (muted) return;
      setHasInteracted(true);
      const src = SOUND_PATHS[key];
      const base = VOLUME[key] ?? 0.4;
      const vol = options?.volume ?? base;
      void playSoundFile(src, vol);
    },
    [muted],
  );

  const value = useMemo(
    () => ({
      muted,
      setMuted,
      toggleMute,
      markInteracted,
      playBgm,
      pauseBgm,
      stopBgm,
      setBgmVolume,
      play,
    }),
    [
      muted,
      setMuted,
      toggleMute,
      markInteracted,
      playBgm,
      pauseBgm,
      stopBgm,
      setBgmVolume,
      play,
    ],
  );

  return (
    <SoundContext.Provider value={value}>{children}</SoundContext.Provider>
  );
}

export function useSound(): SoundContextValue {
  const ctx = useContext(SoundContext);
  if (!ctx) {
    throw new Error("useSound must be used within SoundProvider");
  }
  return ctx;
}

/** For optional wiring (returns no-ops when no provider). */
export function useSoundOptional(): SoundContextValue | null {
  return useContext(SoundContext);
}
