const STORAGE_KEY = "rps-sfx-muted";

export function readMutedFromStorage(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function writeMutedToStorage(muted: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, muted ? "1" : "0");
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

export { STORAGE_KEY };
