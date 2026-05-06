import type { Locale } from "@/i18n/locales";

/** Mirrors describeEffectiveAction / round summary narration (not resolveRound). */
export const ledger: Record<Locale, Record<string, string>> = {
  en: {
    "ledger.effective.SCISSORS_ATTACK": "{{player}} used Scissors.",
    "ledger.effective.PAPER_COUNTER": "{{player}} used Paper (Counter).",
    "ledger.effective.PAPER_EXHAUSTED": "{{player}} used Paper (Exhausted).",
    "ledger.effective.ROCK_START_CHARGE":
      "{{player}} started charging Rock (Lv1).",
    "ledger.effective.ROCK_HOLD_CHARGE":
      "{{player}} continued charging Rock (Lv2).",
    "ledger.effective.ROCK_RELEASE_LV1":
      "{{player}} released Rock Lv1.",
    "ledger.effective.ROCK_RELEASE_LV2":
      "{{player}} released Rock Lv2.",
    "ledger.effective.STUNNED_SKIP":
      "{{player}} is staggered and skips this round.",
    "ledger.effective.INVALID":
      "{{player}} has no valid action this round.",
    "roundSummary.titleStandalone": "Round {n} — ledger",
    "roundSummary.titleEmbedded": "Round {n}",
    "roundSummary.outcome": "Outcome",
    "roundSummary.hintStandalone":
      "Letter badges (S / R / P) are a quick color key. Narration matches the same resolve step as the clash tableau above.",
    "roundSummary.hintEmbedded": "S / R / P badges match the clash above.",
    "roundSummary.p1Maneuver": "Player 1 maneuver",
    "roundSummary.p2Maneuver": "Player 2 maneuver",
    "roundSummary.damageDealt": "Damage dealt",
    "roundSummary.toP1": "To Player 1",
    "roundSummary.toP2": "To Player 2",
    "roundSummary.stanceAfter": "Stance after round",
    "roundSummary.actionKeyAria": "Action color key",
  },
  zh: {
    "ledger.effective.SCISSORS_ATTACK": "{{player}} 使出剪刀。",
    "ledger.effective.PAPER_COUNTER": "{{player}} 使用布（反制）。",
    "ledger.effective.PAPER_EXHAUSTED": "{{player}} 使用布（衰竭）。",
    "ledger.effective.ROCK_START_CHARGE":
      "{{player}} 开始蓄力石头（一段）。",
    "ledger.effective.ROCK_HOLD_CHARGE":
      "{{player}} 继续蓄力石头（二段）。",
    "ledger.effective.ROCK_RELEASE_LV1": "{{player}} 释放石头一段。",
    "ledger.effective.ROCK_RELEASE_LV2": "{{player}} 释放石头二段。",
    "ledger.effective.STUNNED_SKIP": "{{player}} 僵直，本回合跳过行动。",
    "ledger.effective.INVALID": "{{player}} 本回合没有可用招式。",
    "roundSummary.titleStandalone": "第 {n} 回合 · 战报",
    "roundSummary.titleEmbedded": "第 {n} 回合",
    "roundSummary.outcome": "结果",
    "roundSummary.hintStandalone":
      "字母徽记（S / R / P）是配色速览；叙述与上方交锋结算一致。",
    "roundSummary.hintEmbedded": "S / R / P 徽记与上方交锋一致。",
    "roundSummary.p1Maneuver": "玩家 1 招式",
    "roundSummary.p2Maneuver": "玩家 2 招式",
    "roundSummary.damageDealt": "造成伤害",
    "roundSummary.toP1": "玩家 1 承受",
    "roundSummary.toP2": "玩家 2 承受",
    "roundSummary.stanceAfter": "回合结束姿态",
    "roundSummary.actionKeyAria": "招式配色说明",
  },
};
