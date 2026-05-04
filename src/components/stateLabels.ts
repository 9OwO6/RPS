import type { PlayerState } from "@/game/types";

export function playerStateLabel(state: PlayerState): string {
  switch (state) {
    case "NORMAL":
      return "NORMAL";
    case "CHARGING_LV1":
      return "CHARGING_LV1";
    case "CHARGING_LV2":
      return "CHARGING_LV2";
    case "STAGGERED":
      return "STAGGERED";
    default: {
      const _x: never = state;
      return _x;
    }
  }
}

export function playerStateLongLabel(state: PlayerState): string {
  switch (state) {
    case "NORMAL":
      return "Normal — ready stance";
    case "CHARGING_LV1":
      return "Rock charge Lv1";
    case "CHARGING_LV2":
      return "Rock charge Lv2";
    case "STAGGERED":
      return "Staggered";
    default: {
      const _x: never = state;
      return _x;
    }
  }
}
