"use client";

import { useState, type ReactNode } from "react";

import { SoundProvider } from "@/audio/SoundContext";
import type { AppMode } from "@/lib/appMode";
import { BattleScreen } from "@/components/BattleScreen";
import { RulesScreen } from "@/components/RulesScreen";
import { StartScreen } from "@/components/StartScreen";
import { TutorialScreen } from "@/components/TutorialScreen";

export default function Home() {
  const [mode, setMode] = useState<AppMode>("START");

  let content: ReactNode;
  switch (mode) {
    case "START":
      content = <StartScreen onSelectMode={setMode} />;
      break;
    case "TUTORIAL":
      content = (
        <TutorialScreen
          onBack={() => setMode("START")}
          onSkipToDuel={() => setMode("LOCAL_DUEL")}
        />
      );
      break;
    case "RULES":
      content = <RulesScreen onBack={() => setMode("START")} />;
      break;
    case "LOCAL_DUEL":
      content = (
        <main className="min-h-screen pb-16 pt-8 lg:overflow-hidden lg:pb-0 lg:pt-0">
          <BattleScreen battleMode="LOCAL_2P" />
        </main>
      );
      break;
    case "VS_AI":
      content = (
        <main className="min-h-screen pb-16 pt-8 lg:overflow-hidden lg:pb-0 lg:pt-0">
          <BattleScreen battleMode="VS_AI" />
        </main>
      );
      break;
    default: {
      const _x: never = mode;
      content = _x;
    }
  }

  return <SoundProvider>{content}</SoundProvider>;
}
