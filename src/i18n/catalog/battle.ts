import type { Locale } from "@/i18n/locales";

export const battle: Record<Locale, Record<string, string>> = {
  en: {
    "battle.passPlay": "Pass-and-play",
    "battle.vsAi": "Player vs AI",
    "battle.tacticalDuel": "Tactical Duel",
    "battle.resetMatch": "Reset match",
    "battle.modeDeck": "Maneuver deck",
    "battle.live": "Live · {player}",
    "battle.rulesReference": "Tactical rules reference",
    "battle.phase.p1PickVsAi": "Player commits",
    "battle.phase.p1PickLocal": "Player 1 commits",
    "battle.phase.passDevice": "Seal & pass device",
    "battle.phase.p2Pick": "Player 2 commits (hidden)",
    "battle.phase.resolve": "Crossing blows",
    "battle.phase.roundEnd": "Stand down — reconcile",
    "battle.phase.gameOver": "Arena closed",
    "battle.prompt.p1PickVsAi":
      "Choose a legal maneuver, then confirm to resolve against the training bot.",
    "battle.prompt.p1PickLocal":
      "Player 1: choose a legal maneuver, then tap Seal Player 1. Player 2 still cannot see your pick.",
    "battle.prompt.resolveVsAiThinking":
      "Training bot is choosing a maneuver...",
    "battle.prompt.resolve": "Crossing blows.",
    "battle.prompt.pass":
      "Pass the device. Player 2 must confirm on the overlay before the blind pick opens.",
    "battle.prompt.p2Pick":
      "Player 2: choose your maneuver, then tap Seal & resolve round. Player 1's pick stays hidden until you resolve.",
    "battle.prompt.roundEnd":
      "Review the clash tableau and ledger below. When ready, tap Next round.",
    "battle.prompt.gameOver":
      "A fighter reached 0 HP — use Restart on the overlay or Reset match above.",
    "battle.subtitle.aiP2": "AI Duelist · Player 2",
    "battle.subtitle.opponentP2": "Opponent · Player 2",
    "battle.subtitle.youP1": "You · Player 1",
    "battle.staggeredP1":
      "Staggered — no maneuver. Seal with confirm to pass the hidden skip.",
    "battle.staggeredP2":
      "Staggered — confirm to resolve against Player 1's sealed action.",
    "battle.waitingPass": "Waiting for pass overlay or round reset…",
    "battle.confirmVsAi": "Confirm & resolve round",
    "battle.sealP1": "Seal Player 1 pick",
    "battle.sealResolve": "Seal & resolve round",
    "battle.nextRound": "Next round",
    "battle.hiddenPick":
      "Hidden pick: Player 1's maneuver is not shown until you resolve.",
    "battle.aiPublicOnly": "AI uses public stance information only.",
    "battle.opponentLabel": "Opponent · {id}",
    "battle.youLabel": "You · {id}",
    "battle.roundCounter": "Round {n}",
  },
  zh: {
    "battle.passPlay": "本地双人",
    "battle.vsAi": "人机对战",
    "battle.tacticalDuel": "战术对决",
    "battle.resetMatch": "重置对局",
    "battle.modeDeck": "招式卡组",
    "battle.live": "行动中 · {player}",
    "battle.rulesReference": "战术规则速查",
    "battle.phase.p1PickVsAi": "玩家出牌",
    "battle.phase.p1PickLocal": "玩家 1 出牌",
    "battle.phase.passDevice": "封印并传递设备",
    "battle.phase.p2Pick": "玩家 2 出牌（隐藏）",
    "battle.phase.resolve": "交锋结算",
    "battle.phase.roundEnd": "休整 · 对账",
    "battle.phase.gameOver": "竞技场关闭",
    "battle.prompt.p1PickVsAi":
      "选择合法招式后确认，将与练习机器人当场结算。",
    "battle.prompt.p1PickLocal":
      "玩家 1：选好招式后点「封印玩家 1」。玩家 2 仍看不到你的选择。",
    "battle.prompt.resolveVsAiThinking": "练习机器人正在出牌……",
    "battle.prompt.resolve": "双方招式交锋中。",
    "battle.prompt.pass":
      "请传递设备。玩家 2 需在遮罩上确认后才会进入盲选界面。",
    "battle.prompt.p2Pick":
      "玩家 2：选好招式后点「封印并结算回合」。在你结算前，玩家 1 的选择保持隐藏。",
    "battle.prompt.roundEnd":
      "查看上方交锋与下方战报，准备好后点击「下一回合」。",
    "battle.prompt.gameOver":
      "一方生命归零——可在结算层重新开始，或使用上方「重置对局」。",
    "battle.subtitle.aiP2": "AI 斗士 · 玩家 2",
    "battle.subtitle.opponentP2": "对手 · 玩家 2",
    "battle.subtitle.youP1": "你 · 玩家 1",
    "battle.staggeredP1":
      "僵直——本回合无招式。点确认以结算隐藏的跳过。",
    "battle.staggeredP2":
      "僵直——确认后与玩家 1 已封印的招式对决结算。",
    "battle.waitingPass": "等待传递遮罩或回合重置……",
    "battle.confirmVsAi": "确认并结算回合",
    "battle.sealP1": "封印玩家 1",
    "battle.sealResolve": "封印并结算回合",
    "battle.nextRound": "下一回合",
    "battle.hiddenPick":
      "隐藏出牌：在你结算前不会显示玩家 1 的招式。",
    "battle.aiPublicOnly": "AI 仅根据公开态势信息决策。",
    "battle.opponentLabel": "对手 · {id}",
    "battle.youLabel": "你 · {id}",
    "battle.roundCounter": "第 {n} 回合",
  },
};
