export const LEGACY_MUTED_STORAGE_KEY = "rps-sfx-muted";
export const MASTER_AUDIO_STORAGE_KEY = "rps-audio-master-enabled";
export const MUSIC_AUDIO_STORAGE_KEY = "rps-audio-music-enabled";
export const SFX_AUDIO_STORAGE_KEY = "rps-audio-sfx-enabled";

export function readLegacyMutedFromStorage(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(LEGACY_MUTED_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function readAudioEnabledFromStorage(
  key: string,
  fallback: boolean,
): boolean {
  if (typeof window === "undefined") return fallback;
  try {
    const value = window.localStorage.getItem(key);
    if (value === "1") return true;
    if (value === "0") return false;
    return fallback;
  } catch {
    return fallback;
  }
}

export function writeAudioEnabledToStorage(key: string, enabled: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, enabled ? "1" : "0");
  } catch {
    /* ignore quota / private mode */
  }
}

const audioCache = new Map<string, HTMLAudioElement>();
let bgmAudio: HTMLAudioElement | null = null;

const DEFAULT_VOLUME = 0.42;

/**
 * Plays a sound file once; no throw on missing file or autoplay block.
 */
export async function playSoundFile(
  src: string,
  volume = DEFAULT_VOLUME,
): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    let el = audioCache.get(src);
    if (!el) {
      el = new Audio(src);
      el.preload = "auto";
      audioCache.set(src, el);
    }
    el.volume = Math.max(0, Math.min(1, volume));
    el.currentTime = 0;
    await el.play();
  } catch {
    /* Missing asset, autoplay policy, or decode error */
  }
}

function getBgmAudio(src: string): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  if (bgmAudio && bgmAudio.src.endsWith(src)) return bgmAudio;
  bgmAudio = new Audio(src);
  bgmAudio.preload = "auto";
  bgmAudio.loop = true;
  return bgmAudio;
}

export async function playBgmFile(src: string, volume: number): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const el = getBgmAudio(src);
    if (!el) return;
    el.volume = Math.max(0, Math.min(1, volume));
    await el.play();
  } catch {
    /* Missing asset, autoplay policy, or decode error */
  }
}

export function pauseBgmFile(): void {
  try {
    bgmAudio?.pause();
  } catch {
    /* no-op */
  }
}

export function stopBgmFile(): void {
  try {
    if (!bgmAudio) return;
    bgmAudio.pause();
    bgmAudio.currentTime = 0;
  } catch {
    /* no-op */
  }
}

export function setBgmVolumeFile(volume: number): void {
  try {
    if (!bgmAudio) return;
    bgmAudio.volume = Math.max(0, Math.min(1, volume));
  } catch {
    /* no-op */
  }
}

