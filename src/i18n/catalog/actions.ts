import type { Locale } from "@/i18n/locales";

export const actions: Record<Locale, Record<string, string>> = {
  en: {
    "action.SCISSORS.full": "Scissors · white-blade rush",
    "action.SCISSORS.short": "Scissors",
    "action.SCISSORS.tagline": "Fast attack. Beats Paper.",
    "action.ROCK.full": "Rock · blue charge",
    "action.ROCK.short": "Rock",
    "action.ROCK.tagline": "Charge or release Rock depending on state.",
    "action.ROCK_LV1_RELEASE.short": "Rock · Lv1 Release",
    "action.ROCK_LV1_RELEASE.tagline":
      "After two consecutive Scissors, this action becomes Rock Release Lv1.",
    "action.PAPER.full": "Paper · red counter",
    "action.PAPER.short": "Paper",
    "action.PAPER.tagline": "Counters Rock release only.",
    "action.HOLD.full": "Hold · continue charge",
    "action.HOLD.short": "Hold",
    "action.HOLD.tagline": "Continue Rock charge to Lv2.",
    "action.maneuver": "Maneuver",
    "action.lockedPrefix": "Locked:",
    "action.waitTurn":
      "Wait until it is your turn to commit this pick.",
    "action.disabled.HOLD":
      "Only while charging Rock at Lv1. Choose Rock from Normal first to enter charge.",
    "action.disabled.SCISSORS.lv2":
      "Scissors cannot be picked at Rock charge Lv2 — release Rock (Rock) or feint Paper.",
    "action.disabled.SCISSORS.default":
      "Scissors cannot be picked in your current stance.",
    "action.disabled.ROCK": "Rock cannot be picked in your current stance.",
    "action.disabled.PAPER": "Paper cannot be picked in your current stance.",
    "action.disabled.PAPER.locked":
      "After two consecutive Papers, Paper is locked. Choose another action first.",
  },
  zh: {
    "action.SCISSORS.full": "剪刀 · 白刃快攻",
    "action.SCISSORS.short": "剪刀",
    "action.SCISSORS.tagline": "快攻，克制布。",
    "action.ROCK.full": "石头 · 蓝色蓄力",
    "action.ROCK.short": "石头",
    "action.ROCK.tagline": "根据姿态蓄力或释放石头。",
    "action.ROCK_LV1_RELEASE.short": "石头 · 一段释放",
    "action.ROCK_LV1_RELEASE.tagline":
      "连续两次剪刀后，本次将强制释放一段石头。",
    "action.PAPER.full": "布 · 红色反制",
    "action.PAPER.short": "布",
    "action.PAPER.tagline": "仅在石头释放瞬间反制。",
    "action.HOLD.full": "续蓄 · 继续蓄力",
    "action.HOLD.short": "续蓄",
    "action.HOLD.tagline": "继续蓄力至二段。",
    "action.maneuver": "招式",
    "action.lockedPrefix": "不可用：",
    "action.waitTurn": "还未轮到你，暂时不能确认这一张。",
    "action.disabled.HOLD":
      "仅在石头蓄力一段时可续蓄。请先在普通状态下选择石头进入蓄力。",
    "action.disabled.SCISSORS.lv2":
      "石头蓄力二段不能选剪刀——请释放石头（再选石头）或改用布佯攻。",
    "action.disabled.SCISSORS.default": "当前姿态不能选择剪刀。",
    "action.disabled.ROCK": "当前姿态不能选择石头。",
    "action.disabled.PAPER": "当前姿态不能选择布。",
    "action.disabled.PAPER.locked":
      "连续两次出布后，下一回合不能继续出布。请先换招。",
  },
};
