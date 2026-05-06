import type { Locale } from "@/i18n/locales";

export const battleLogUi: Record<Locale, Record<string, string>> = {
  en: {
    "chronicle.title": "Chronicle",
    "chronicle.open": "Open",
    "chronicle.close": "Close",
    "chronicle.embeddedAria": "Battle log entries",
    "chronicle.sectionAria": "Battle log",
    "chronicle.sectionTitle": "Battle chronicle",
    "chronicle.roundTitle": "Round {n}",
    "chronicle.empty":
      "No chronicle entries yet. After you resolve a round, the narrative lines for that encounter appear here.",
  },
  zh: {
    "chronicle.title": "战史",
    "chronicle.open": "展开",
    "chronicle.close": "收起",
    "chronicle.embeddedAria": "战斗记录条目",
    "chronicle.sectionAria": "战斗记录",
    "chronicle.sectionTitle": "战斗编年",
    "chronicle.roundTitle": "第 {n} 回合",
    "chronicle.empty":
      "尚无记录。结算回合后，本场交锋的叙述会出现在这里。",
  },
};
