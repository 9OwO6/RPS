import type { Locale } from "@/i18n/locales";

export const playerPanel: Record<Locale, Record<string, string>> = {
  en: {
    "player.hpTrailHero": "{pct}% · trail follows heavy hits",
    "player.hpTrailCompact": "{pct}% integrity",
    "player.hpTrailStandard":
      "{pct}% · trailing bar lags ~300ms after big hits",
    "player.staggerBadge": "Staggered",
    "player.paperChain": "Paper chain",
    "player.scissorsChain": "Scissors chain",
    "player.titlePaperChain": "Paper chain",
    "player.titleScissorsChain": "Scissors chain",
    "player.staggerBreakStandard":
      "Break off: you skip this clash — stance recovers afterward unless staggered again.",
    "player.staggerSkipCompact":
      "Skip this clash — stance recovers next round unless staggered again.",
    "player.activeCommit": "Active duelist · commit maneuver",
  },
  zh: {
    "player.hpTrailHero": "{pct}% · 受重击后拖尾更明显",
    "player.hpTrailCompact": "{pct}% 完整度",
    "player.hpTrailStandard": "{pct}% · 重创后拖尾约 300ms",
    "player.staggerBadge": "僵直",
    "player.paperChain": "布连击",
    "player.scissorsChain": "剪刀连击",
    "player.titlePaperChain": "布连击",
    "player.titleScissorsChain": "剪刀连击",
    "player.staggerBreakStandard":
      "本回合跳过交锋——之后姿态恢复，除非再次僵直。",
    "player.staggerSkipCompact":
      "跳过本次交锋——下回合姿态恢复，除非再次僵直。",
    "player.activeCommit": "行动中 · 请锁定招式",
  },
};
