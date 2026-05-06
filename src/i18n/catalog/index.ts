import type { Locale } from "@/i18n/locales";

import { actions } from "@/i18n/catalog/actions";
import { audio } from "@/i18n/catalog/audio";
import { battle } from "@/i18n/catalog/battle";
import { battleLogUi } from "@/i18n/catalog/battleLogUi";
import { combatLabels } from "@/i18n/catalog/combatLabels";
import { common } from "@/i18n/catalog/common";
import { gameOver } from "@/i18n/catalog/gameOver";
import { ledger } from "@/i18n/catalog/ledger";
import { online } from "@/i18n/catalog/online";
import { passDevice } from "@/i18n/catalog/passDevice";
import { playerPanel } from "@/i18n/catalog/playerPanel";
import { rules } from "@/i18n/catalog/rules";
import { start } from "@/i18n/catalog/start";
import { stateLabels } from "@/i18n/catalog/state";
import { tutorial } from "@/i18n/catalog/tutorial";

const packs = [
  common,
  start,
  rules,
  tutorial,
  actions,
  stateLabels,
  combatLabels,
  ledger,
  battle,
  gameOver,
  passDevice,
  playerPanel,
  battleLogUi,
  online,
  audio,
];

export function buildMessageTable(locale: Locale): Record<string, string> {
  return packs.reduce<Record<string, string>>((acc, pack) => {
    Object.assign(acc, pack[locale]);
    return acc;
  }, {});
}
