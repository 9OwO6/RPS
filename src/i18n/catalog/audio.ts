import type { Locale } from "@/i18n/locales";

export const audio: Record<Locale, Record<string, string>> = {
  en: {
    "audio.groupAria": "Audio settings",
    "audio.masterAria": "Toggle master audio",
    "audio.musicAria": "Toggle music",
    "audio.sfxAria": "Toggle sound effects",
    "audio.master": "Audio",
    "audio.masterCompact": "A",
    "audio.music": "Music",
    "audio.musicCompact": "M",
    "audio.sfx": "SFX",
    "audio.sfxCompact": "SFX",
  },
  zh: {
    "audio.groupAria": "音频设置",
    "audio.masterAria": "切换总音频",
    "audio.musicAria": "切换音乐",
    "audio.sfxAria": "切换音效",
    "audio.master": "总音频",
    "audio.masterCompact": "音",
    "audio.music": "音乐",
    "audio.musicCompact": "乐",
    "audio.sfx": "音效",
    "audio.sfxCompact": "效",
  },
};
