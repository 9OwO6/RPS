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
  LEGACY_MUTED_STORAGE_KEY,
  MASTER_AUDIO_STORAGE_KEY,
  MUSIC_AUDIO_STORAGE_KEY,
  pauseBgmFile,
  playBgmFile,
  playSoundFile,
  readAudioEnabledFromStorage,
  readLegacyMutedFromStorage,
  SFX_AUDIO_STORAGE_KEY,
  setBgmVolumeFile,
  stopBgmFile,
  writeAudioEnabledToStorage,
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
  GAME_WIN: 0.35,
  GAME_OVER: 0.3,
};
const BGM_VOLUME = 0.14;
const END_STINGER_MAX_MS = 2500;

export interface SoundContextValue {
  masterEnabled: boolean;
  musicEnabled: boolean;
  sfxEnabled: boolean;
  setMasterEnabled: (next: boolean) => void;
  setMusicEnabled: (next: boolean) => void;
  setSfxEnabled: (next: boolean) => void;
  toggleMasterEnabled: () => void;
  toggleMusicEnabled: () => void;
  toggleSfxEnabled: () => void;
  markInteracted: () => void;
  playBgm: () => void;
  pauseBgm: () => void;
  stopBgm: () => void;
  stopEndStinger: () => void;
  setBgmVolume: (volume: number) => void;
  /** Play by logical key; respects mute; fails silently. */
  play: (key: SoundKey, options?: { volume?: number }) => void;
}

const SoundContext = createContext<SoundContextValue | null>(null);

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [masterEnabled, setMasterEnabledState] = useState(true);
  const [musicEnabled, setMusicEnabledState] = useState(true);
  const [sfxEnabled, setSfxEnabledState] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);
  const bgmPausedBySystem = useRef(false);
  const endStingerRef = useRef<HTMLAudioElement | null>(null);
  const endStingerTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const legacyMuted = readLegacyMutedFromStorage();
    const legacyExists = (() => {
      if (typeof window === "undefined") return false;
      try {
        return window.localStorage.getItem(LEGACY_MUTED_STORAGE_KEY) !== null;
      } catch {
        return false;
      }
    })();
    const defaultMaster = legacyExists ? !legacyMuted : true;
    const master = readAudioEnabledFromStorage(
      MASTER_AUDIO_STORAGE_KEY,
      defaultMaster,
    );
    const music = readAudioEnabledFromStorage(MUSIC_AUDIO_STORAGE_KEY, true);
    const sfx = readAudioEnabledFromStorage(SFX_AUDIO_STORAGE_KEY, true);
    setMasterEnabledState(master);
    setMusicEnabledState(music);
    setSfxEnabledState(sfx);
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

  const stopEndStinger = useCallback(() => {
    if (endStingerTimerRef.current !== null) {
      window.clearTimeout(endStingerTimerRef.current);
      endStingerTimerRef.current = null;
    }
    if (!endStingerRef.current) return;
    try {
      endStingerRef.current.pause();
      endStingerRef.current.currentTime = 0;
    } catch {
      /* ignore */
    }
    endStingerRef.current = null;
  }, []);

  const setMasterEnabled = useCallback((next: boolean) => {
    setMasterEnabledState(next);
    writeAudioEnabledToStorage(MASTER_AUDIO_STORAGE_KEY, next);
  }, []);

  const setMusicEnabled = useCallback((next: boolean) => {
    setMusicEnabledState(next);
    writeAudioEnabledToStorage(MUSIC_AUDIO_STORAGE_KEY, next);
  }, []);

  const setSfxEnabled = useCallback((next: boolean) => {
    setSfxEnabledState(next);
    writeAudioEnabledToStorage(SFX_AUDIO_STORAGE_KEY, next);
  }, []);

  const toggleMasterEnabled = useCallback(() => {
    setHasInteracted(true);
    setMasterEnabledState((m) => {
      const next = !m;
      writeAudioEnabledToStorage(MASTER_AUDIO_STORAGE_KEY, next);
      return next;
    });
  }, []);

  const toggleMusicEnabled = useCallback(() => {
    setHasInteracted(true);
    setMusicEnabledState((m) => {
      const next = !m;
      writeAudioEnabledToStorage(MUSIC_AUDIO_STORAGE_KEY, next);
      return next;
    });
  }, []);

  const toggleSfxEnabled = useCallback(() => {
    setHasInteracted(true);
    setSfxEnabledState((m) => {
      const next = !m;
      writeAudioEnabledToStorage(SFX_AUDIO_STORAGE_KEY, next);
      return next;
    });
  }, []);

  const playEndStinger = useCallback(
    (src: string, volume: number) => {
      if (!masterEnabled || !sfxEnabled) return;
      setHasInteracted(true);
      stopEndStinger();
      try {
        const el = new Audio(src);
        el.preload = "auto";
        el.volume = Math.max(0, Math.min(1, volume));
        endStingerRef.current = el;
        void el.play();
        endStingerTimerRef.current = window.setTimeout(() => {
          stopEndStinger();
        }, END_STINGER_MAX_MS);
      } catch {
        /* ignore missing/decode/autoplay errors */
      }
    },
    [masterEnabled, sfxEnabled, stopEndStinger],
  );

  const playBgm = useCallback(() => {
    if (!masterEnabled || !musicEnabled || !hasInteracted) return;
    bgmPausedBySystem.current = false;
    void playBgmFile(BGM_PATH, BGM_VOLUME);
  }, [hasInteracted, masterEnabled, musicEnabled]);

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
    if (!masterEnabled || !musicEnabled) {
      pauseBgmFile();
      return;
    }
    if (!hasInteracted) return;
    if (!bgmPausedBySystem.current) {
      void playBgmFile(BGM_PATH, BGM_VOLUME);
    }
  }, [hasInteracted, masterEnabled, musicEnabled]);

  useEffect(() => {
    if (!masterEnabled || !sfxEnabled) {
      stopEndStinger();
    }
  }, [masterEnabled, sfxEnabled, stopEndStinger]);

  useEffect(() => {
    return () => {
      stopEndStinger();
    };
  }, [stopEndStinger]);

  const play = useCallback(
    (key: SoundKey, options?: { volume?: number }) => {
      if (!masterEnabled || !sfxEnabled) return;
      setHasInteracted(true);
      const src = SOUND_PATHS[key];
      const base = VOLUME[key] ?? 0.4;
      const vol = options?.volume ?? base;
      if (key === "GAME_WIN" || key === "GAME_OVER") {
        playEndStinger(src, vol);
        return;
      }
      void playSoundFile(src, vol);
    },
    [masterEnabled, playEndStinger, sfxEnabled],
  );

  const value = useMemo(
    () => ({
      masterEnabled,
      musicEnabled,
      sfxEnabled,
      setMasterEnabled,
      setMusicEnabled,
      setSfxEnabled,
      toggleMasterEnabled,
      toggleMusicEnabled,
      toggleSfxEnabled,
      markInteracted,
      playBgm,
      pauseBgm,
      stopBgm,
      stopEndStinger,
      setBgmVolume,
      play,
    }),
    [
      masterEnabled,
      musicEnabled,
      sfxEnabled,
      setMasterEnabled,
      setMusicEnabled,
      setSfxEnabled,
      toggleMasterEnabled,
      toggleMusicEnabled,
      toggleSfxEnabled,
      markInteracted,
      playBgm,
      pauseBgm,
      stopBgm,
      stopEndStinger,
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
