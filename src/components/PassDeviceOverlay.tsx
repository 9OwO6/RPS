"use client";

import { useSound } from "@/audio/SoundContext";
import { useI18n } from "@/i18n/useI18n";

interface PassDeviceOverlayProps {
  open: boolean;
  onContinueAsP2: () => void;
}

export function PassDeviceOverlay({
  open,
  onContinueAsP2,
}: PassDeviceOverlayProps) {
  const { play } = useSound();
  const { t } = useI18n();

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pass-device-title"
      aria-describedby="pass-device-details"
      className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-black/95 px-5 backdrop-blur-[2px]"
    >
      <div className="w-full max-w-lg rounded-2xl border border-amber-700/35 bg-gradient-to-br from-slate-950 via-slate-900 to-black p-8 text-center shadow-[0_0_60px_-12px_rgba(251,191,36,0.35)]">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl border border-amber-900/60 bg-black/70 font-mono text-2xl text-amber-400">
          ∴
        </div>
        <p className="mt-6 text-[0.7rem] font-bold uppercase tracking-[0.55em] text-amber-500/95">
          {t("passDevice.tagline")}
        </p>
        <h2 id="pass-device-title" className="mt-2 text-3xl font-black text-white">
          {t("passDevice.title")}
        </h2>

        <ul
          id="pass-device-details"
          className="mt-6 space-y-3 text-left text-sm leading-relaxed text-slate-300"
        >
          <li className="flex gap-3">
            <span className="shrink-0 font-mono text-amber-500">01</span>
            <span>
              <strong className="text-slate-100">{t("passDevice.li1Strong")}</strong>{" "}
              {t("passDevice.li1Rest")}
            </span>
          </li>
          <li className="flex gap-3">
            <span className="shrink-0 font-mono text-amber-500">02</span>
            <span>{t("passDevice.li2")}</span>
          </li>
          <li className="flex gap-3">
            <span className="shrink-0 font-mono text-amber-500">03</span>
            <span>{t("passDevice.li3")}</span>
          </li>
        </ul>

        <button
          type="button"
          className="mt-10 w-full rounded-xl bg-amber-500 px-4 py-3.5 text-base font-black uppercase tracking-widest text-slate-950 shadow-lg transition hover:bg-amber-400"
          onClick={() => {
            play("UI_CONFIRM");
            onContinueAsP2();
          }}
        >
          {t("passDevice.cta")}
        </button>
      </div>
    </div>
  );
}
