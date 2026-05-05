import type { CombatAnimationType } from "@/presentation/combatAnimation";
import type { SoundKey } from "@/audio/soundMap";

/** Maps presentation-only combat animation to SFX; INVALID stays silent. */
export function combatAnimationToSoundKey(
  type: CombatAnimationType,
): SoundKey | null {
  switch (type) {
    case "SCISSORS_BEATS_PAPER":
    case "MIRROR_SCISSORS":
      return "SCISSORS_HIT";
    case "PAPER_COUNTERS_ROCK":
      return "PAPER_COUNTER";
    case "ROCK_BEATS_SCISSORS":
    case "MIRROR_ROCK":
      return "ROCK_IMPACT";
    case "SCISSORS_CHIPS_ROCK_CHARGE":
      return "CHIP_HIT";
    case "ROCK_CHARGE":
    case "ROCK_HOLD":
      return "CHARGE";
    case "STAGGER_SKIP":
      return "STAGGER";
    case "INVALID":
      return null;
    case "NEUTRAL":
      return "ACTION_REVEAL";
    default: {
      const _e: never = type;
      return _e;
    }
  }
}
