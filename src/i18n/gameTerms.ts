import type { TranslateFn } from "@/i18n/useI18n";
import type { CombatAnimationType } from "@/presentation/combatAnimation";
import type {
  EffectiveAction,
  InputAction,
  PlayerId,
  PlayerSnapshot,
  PlayerState,
} from "@/game/types";

import { getActionDisabledReason } from "@/components/actionUx";

export function localizedInputShort(t: TranslateFn, action: InputAction): string {
  return t(`action.${action}.short`);
}

export function localizedInputFull(t: TranslateFn, action: InputAction): string {
  return t(`action.${action}.full`);
}

export function localizedInputTagline(t: TranslateFn, action: InputAction): string {
  return t(`action.${action}.tagline`);
}

export function localizedDisableReason(
  t: TranslateFn,
  snapshot: Pick<PlayerSnapshot, "state" | "paperStreak">,
  action: InputAction,
): string | null {
  const en = getActionDisabledReason(snapshot, action);
  if (en === null) return null;

  if (en.startsWith("After two consecutive Papers")) return t("action.disabled.PAPER.locked");
  if (en.startsWith("Only while charging Rock")) return t("action.disabled.HOLD");
  if (en.includes("Rock charge Lv2")) return t("action.disabled.SCISSORS.lv2");
  if (en.includes("Scissors cannot be picked in your current stance"))
    return t("action.disabled.SCISSORS.default");
  if (en.startsWith("Rock cannot")) return t("action.disabled.ROCK");
  if (en.startsWith("Paper cannot")) return t("action.disabled.PAPER");
  return en;
}

export function playerStateShortKey(state: PlayerState): string {
  return `state.${state}.short`;
}

export function playerStateLongKey(state: PlayerState): string {
  return `state.${state}.long`;
}

export function formatStateArrow(
  t: TranslateFn,
  before: PlayerState,
  after: PlayerState,
): string {
  const b = t(playerStateShortKey(before));
  const a = t(playerStateShortKey(after));
  if (before === after) return t("state.arrow.unchanged", { state: a });
  return t("state.arrow.transition", { before: b, after: a });
}

export function localizedEffectiveTileLabel(
  t: TranslateFn,
  eff: EffectiveAction,
): string {
  return t(`effective.${eff}`);
}

export function localizedCombatCaption(
  t: TranslateFn,
  type: CombatAnimationType,
): string {
  return t(`caption.${type}`);
}

export function localizedLedgerEffectiveLine(
  t: TranslateFn,
  player: PlayerId,
  eff: EffectiveAction,
): string {
  return t(`ledger.effective.${eff}`, { player });
}

export function localizedGamePhase(t: TranslateFn, phase: string): string {
  const key = `game.phase.${phase}`;
  const label = t(key);
  return label === key ? phase : label;
}

export function localizedRoomStatus(t: TranslateFn, status: string): string {
  const key = `online.roomStatus.${status}`;
  const label = t(key);
  return label === key ? status : label;
}
