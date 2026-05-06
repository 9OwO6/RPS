"use client";

import { useState, type ReactNode } from "react";

import { SoundProvider } from "@/audio/SoundContext";
import { I18nProvider } from "@/i18n/I18nProvider";
import type { AiDifficulty } from "@/game/ai";
import type { AppMode } from "@/lib/appMode";
import { BattleScreen } from "@/components/BattleScreen";
import { OnlineDuelRoute } from "@/components/OnlineDuelRoute";
import { RulesScreen } from "@/components/RulesScreen";
import { StartScreen } from "@/components/StartScreen";
import { TutorialScreen } from "@/components/TutorialScreen";

export default function Home() {
  const [mode, setMode] = useState<AppMode>("START");
  const [aiDifficulty, setAiDifficulty] = useState<AiDifficulty>("NORMAL");

  let content: ReactNode;
  switch (mode) {
    case "START":
      content = (
        <StartScreen
          onSelectMode={setMode}
          onStartVsAi={(difficulty) => {
            setAiDifficulty(difficulty);
            setMode("VS_AI");
          }}
        />
      );
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
          <BattleScreen battleMode="LOCAL_2P" onBackToStart={() => setMode("START")} />
        </main>
      );
      break;
    case "VS_AI":
      content = (
        <main className="min-h-screen pb-16 pt-8 lg:overflow-hidden lg:pb-0 lg:pt-0">
          <BattleScreen
            battleMode="VS_AI"
            aiDifficulty={aiDifficulty}
            onBackToStart={() => setMode("START")}
          />
        </main>
      );
      break;
    case "ONLINE_DUEL":
      content = <OnlineDuelRoute onBackToStart={() => setMode("START")} />;
      break;
    default: {
      const _x: never = mode;
      content = _x;
    }
  }

  return (
    <I18nProvider>
      <SoundProvider>{content}</SoundProvider>
    </I18nProvider>
  );
}
