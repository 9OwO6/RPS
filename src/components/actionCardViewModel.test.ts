import { describe, expect, it } from "vitest";

import { getActionCardViewModel } from "@/components/actionCardViewModel";
import { createInitialPlayerSnapshot } from "@/game/initialState";

describe("action card view model", () => {
  it("displays forced third Scissors as Rock Lv1 release", () => {
    const p = createInitialPlayerSnapshot("P1");
    p.scissorsStreak = 2;
    const vm = getActionCardViewModel(p, "SCISSORS");
    expect(vm.inputAction).toBe("SCISSORS");
    expect(vm.displayAction).toBe("ROCK");
    expect(vm.displayKind).toBe("forcedRockLv1");
    expect(vm.disabled).toBe(false);
  });

  it("locks Paper card when paperStreak >= 2", () => {
    const p = createInitialPlayerSnapshot("P1");
    p.paperStreak = 2;
    const vm = getActionCardViewModel(p, "PAPER");
    expect(vm.disabled).toBe(true);
  });
});

