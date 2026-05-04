"use client";

interface PassDeviceOverlayProps {
  open: boolean;
  onContinueAsP2: () => void;
}

export function PassDeviceOverlay({
  open,
  onContinueAsP2,
}: PassDeviceOverlayProps) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pass-device-title"
      className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-black/90 px-6"
    >
      <div className="max-w-md rounded-2xl border border-slate-600 bg-slate-900 p-8 text-center shadow-2xl">
        <h2
          id="pass-device-title"
          className="text-xl font-semibold text-amber-300"
        >
          Pass the device
        </h2>
        <p className="mt-4 text-slate-300">
          Player 1 has locked in a hidden action. Hand the screen to Player 2.
          Player 2 must not see Player 1&apos;s selection.
        </p>
        <button
          type="button"
          className="mt-8 w-full rounded-lg bg-amber-600 px-4 py-3 text-base font-semibold text-slate-950 transition hover:bg-amber-500"
          onClick={onContinueAsP2}
        >
          I am Player 2 — continue
        </button>
      </div>
    </div>
  );
}
