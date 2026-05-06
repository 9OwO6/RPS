import type { GameState, PlayerId } from "@/game/types";

export type GameOverFinisherMode = "LOCAL_2P" | "VS_AI" | "ONLINE";

export interface GameOverFinisherContext {
  mode: GameOverFinisherMode;
  /** Required when mode is ONLINE for Victory / Defeat wording. */
  localPlayerId?: PlayerId;
}

/** i18n dictionary key for the prominent game-over title line. */
export function gameOverFinisherTitleKey(
  winner: NonNullable<GameState["winner"]>,
  ctx: GameOverFinisherContext,
): string {
  if (winner === "DRAW") return "gameOver.finisherTitle.draw";

  if (ctx.mode === "VS_AI") {
    return winner === "P1"
      ? "gameOver.finisherTitle.victory"
      : "gameOver.finisherTitle.defeat";
  }

  if (ctx.mode === "ONLINE" && ctx.localPlayerId) {
    return winner === ctx.localPlayerId
      ? "gameOver.finisherTitle.victory"
      : "gameOver.finisherTitle.defeat";
  }

  return winner === "P1"
    ? "gameOver.finisherTitle.p1Wins"
    : "gameOver.finisherTitle.p2Wins";
}
