import type { Locale } from "@/i18n/locales";

export const gameOver: Record<Locale, Record<string, string>> = {
  en: {
    "gameOver.tagline": "Duel resolved",
    "gameOver.official": "Official result",
    "gameOver.headline.P1": "Victory · P1",
    "gameOver.headline.P2": "Victory · P2",
    "gameOver.headline.DRAW": "Draw",
    "gameOver.body.P1": "Player 1 claims the duel.",
    "gameOver.body.P2": "Player 2 claims the duel.",
    "gameOver.body.DRAW": "Stalemate — neither stands.",
    "gameOver.restartHint":
      "Restart returns both fighters to full HP and opens a fresh round-one pick for Player 1.",
    "gameOver.restart": "Restart duel",
  },
  zh: {
    "gameOver.tagline": "决斗了结",
    "gameOver.official": "官方裁定",
    "gameOver.headline.P1": "胜利 · P1",
    "gameOver.headline.P2": "胜利 · P2",
    "gameOver.headline.DRAW": "平局",
    "gameOver.body.P1": "玩家 1 胜出。",
    "gameOver.body.P2": "玩家 2 胜出。",
    "gameOver.body.DRAW": "旗鼓相当——未分胜负。",
    "gameOver.restartHint":
      "重新开始将双方生命回满，并从玩家 1 的第一回合选题开始。",
    "gameOver.restart": "重新开始对战",
  },
};
