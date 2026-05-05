/**
 * Expected assets under /public/assets/sfx/ — safe if missing (playback no-ops).
 */
export const SOUND_PATHS = {
  UI_SELECT: "/assets/sfx/ui-select.mp3",
  UI_CONFIRM: "/assets/sfx/ui-confirm.mp3",
  ACTION_REVEAL: "/assets/sfx/action-reveal.mp3",
  SCISSORS_HIT: "/assets/sfx/scissors-hit.mp3",
  PAPER_COUNTER: "/assets/sfx/paper-counter.mp3",
  ROCK_IMPACT: "/assets/sfx/rock-impact.mp3",
  CHIP_HIT: "/assets/sfx/chip-hit.mp3",
  CHARGE: "/assets/sfx/charge.mp3",
  DAMAGE_LIGHT: "/assets/sfx/damage-light.mp3",
  DAMAGE_HEAVY: "/assets/sfx/damage-heavy.mp3",
  STAGGER: "/assets/sfx/stagger.mp3",
  GAME_WIN: "/assets/sfx/game-win.mp3",
  GAME_OVER: "/assets/sfx/game-over.mp3",
} as const;

export type SoundKey = keyof typeof SOUND_PATHS;

export const BGM_PATH = "/assets/music/bgm.mp3";
