"use client";

import { useState } from "react";

import type { AppMode } from "@/lib/appMode";
import { BattleScreen } from "@/components/BattleScreen";
import { RulesScreen } from "@/components/RulesScreen";
import { StartScreen } from "@/components/StartScreen";
import { TutorialScreen } from "@/components/TutorialScreen";

export default function Home() {
  const [mode, setMode] = useState<AppMode>("START");

  switch (mode) {
    case "START":
      return <StartScreen onSelectMode={setMode} />;
    case "TUTORIAL":
      return <TutorialScreen onBack={() => setMode("START")} />;
    case "RULES":
      return <RulesScreen onBack={() => setMode("START")} />;
    case "LOCAL_DUEL":
      return (
        <main className="min-h-screen pb-16 pt-8">
          <BattleScreen />
        </main>
      );
    default: {
      const _x: never = mode;
      return _x;
    }
  }
}
