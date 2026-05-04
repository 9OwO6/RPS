import type { GameState, InputAction } from "@/game/types";

export type TutorialSuccessCheck = (
  previous: GameState,
  resolved: GameState,
) => boolean;

export interface TutorialStep {
  id: string;
  title: string;
  objective: string;
  explanation: string;
  startingGameState: GameState;
  opponentAction: InputAction;
  requiredPlayerAction: InputAction;
  successCondition: TutorialSuccessCheck;
  successMessage: string;
  failureMessage: string;
}
