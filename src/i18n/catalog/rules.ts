import type { Locale } from "@/i18n/locales";

export const rules: Record<Locale, Record<string, string>> = {
  en: {
    "rules.reference": "Reference",
    "rules.title": "Rules of engagement",
    "rules.subtitle":
      "Same rules the tutorial and local duel use. Scroll for detail, or jump back to the menu when you are ready.",
    "rules.passPlayTitle": "Pass-and-play",
    "rules.passPlayBody":
      "Player 1 commits a maneuver, then passes the device. Player 2 chooses without seeing Player 1's pick until resolve.",
    "quickRules.title": "How to play · quick rules",
    "quickRules.line1": "Scissors beats Paper (damage + stagger when they clash).",
    "quickRules.line2": "Paper counters Rock only on the release — not while Rock is charging.",
    "quickRules.line3": "Rock release beats Scissors; Rock must charge before it can release.",
    "quickRules.line4":
      "Scissors chips charging Rock for minor damage; charge can still complete.",
    "quickRules.line5":
      "Repeating Paper is risky — the second Paper into Scissors hurts more.",
    "quickRules.line6": "Third consecutive Scissors becomes a Rock release.",
    "rulesReminder.title": "Tactical rules",
    "rulesReminder.paperRelease":
      "Paper only counters Rock release.",
    "rulesReminder.scissorsPaper": "Scissors beats Paper.",
    "rulesReminder.rockScissors": "Rock release beats Scissors.",
    "rulesReminder.chip": "Scissors only chips charging Rock.",
    "rulesReminder.stagger":
      "Staggered: that player skips one round (unless staggered again).",
  },
  zh: {
    "rules.reference": "参考资料",
    "rules.title": "交战规则",
    "rules.subtitle":
      "与教程与本地双人相同的规则。可向下阅读细节，准备好后返回菜单。",
    "rules.passPlayTitle": "本地双人流程",
    "rules.passPlayBody":
      "玩家 1 先锁定招式并传递设备；玩家 2 在选择时看不到玩家 1 的出牌，直到回合揭晓。",
    "quickRules.title": "快速上手 · 要点",
    "quickRules.line1": "剪刀克制布（正面对撞时造成伤害并僵直）。",
    "quickRules.line2": "布只在石头释放瞬间反制——石头蓄力期间不能反制。",
    "quickRules.line3": "石头释放克制剪刀；石头必须先蓄力才能释放。",
    "quickRules.line4": "剪刀对蓄力中的石头只能蹭血；蓄力仍可完成。",
    "quickRules.line5": "连续出布有风险——第二次布对上剪刀会受到更重惩罚。",
    "quickRules.line6": "连续第三次剪刀会自动变为石头释放。",
    "rulesReminder.title": "战术要点",
    "rulesReminder.paperRelease": "布只反制石头的释放瞬间。",
    "rulesReminder.scissorsPaper": "剪刀克制布。",
    "rulesReminder.rockScissors": "石头释放克制剪刀。",
    "rulesReminder.chip": "剪刀对蓄力中的石头只能蹭伤。",
    "rulesReminder.stagger": "僵直：该回合跳过行动（再次被僵直则叠加规则）。",
  },
};
