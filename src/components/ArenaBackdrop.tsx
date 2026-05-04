"use client";

import Image from "next/image";

import { ASSETS } from "@/lib/assetPaths";

/** Full-viewport duel arena art + dark overlays (presentation only). */
export function ArenaBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
      <Image
        src={ASSETS.duelArenaBg}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-[center_30%]"
      />
      <div className="absolute inset-0 bg-slate-950/74" />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/88 via-slate-950/50 to-slate-950/92" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_0%,rgba(251,191,36,0.06),transparent_55%)]" />
    </div>
  );
}
