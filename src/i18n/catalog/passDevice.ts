import type { Locale } from "@/i18n/locales";

export const passDevice: Record<Locale, Record<string, string>> = {
  en: {
    "passDevice.tagline": "Classified maneuver",
    "passDevice.title": "Pass the screen",
    "passDevice.li1Strong": "Hidden commit:",
    "passDevice.li1Rest":
      "Player 1's action is locked and must stay invisible to Player 2 until the round resolves.",
    "passDevice.li2":
      "Physical pass: hand off the phone or lid the laptop — no peeking at the duel record until both picks are finalized.",
    "passDevice.li3":
      "Only Player 2 should tap the button below once they have the device and are ready to pick without seeing Player 1's maneuver.",
    "passDevice.cta": "I'm Player 2 — continue to blind pick",
  },
  zh: {
    "passDevice.tagline": "密封招式",
    "passDevice.title": "请传递屏幕",
    "passDevice.li1Strong": "隐藏锁定：",
    "passDevice.li1Rest":
      "玩家 1 的招式已锁定，在回合揭晓前必须对玩家 2 保持不可见。",
    "passDevice.li2":
      "实物传递：把手机交给对方或合上笔记本——在双方封印完成前不要偷看战局记录。",
    "passDevice.li3":
      "只有玩家 2 在拿到设备并准备好盲选后，才应点击下方按钮。",
    "passDevice.cta": "我是玩家 2 — 进入盲选",
  },
};
