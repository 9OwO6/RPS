"use client";

interface DamageFloatProps {
  amount: number;
}

/**
 * Floating damage number; parent should use `key` to replay per resolve.
 * `pointer-events-none` — does not block layout interaction.
 */
export function DamageFloat({ amount }: DamageFloatProps) {
  if (amount <= 0) return null;

  return (
    <span
      className="damage-float-elem pointer-events-none absolute left-1/2 top-2 z-20 -translate-x-1/2 font-black tabular-nums tracking-tight text-red-100/95"
      aria-hidden
    >
      -{amount}
    </span>
  );
}
