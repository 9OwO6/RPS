import type { GameState, InputAction } from "@/game/types";

export type TutorialSuccessCheck = (
  previous: GameState,
  resolved: GameState,
) => boolean;

export interface TutorialStep {
  id: string;
  /** 1-based lesson index for i18n keys `tutorial.l{n}.*`. */
  lessonNumber: number;
  startingGameState: GameState;
  opponentAction: InputAction;
  requiredPlayerAction: InputAction;
  successCondition: TutorialSuccessCheck;
}
