import type { TranslateFn } from "@/i18n/useI18n";

export function localizedSocketError(
  t: TranslateFn,
  code: string | undefined,
  fallbackMessage: string,
): string {
  if (!code) return fallbackMessage;
  const key = `online.error.${code}`;
  const msg = t(key);
  if (!msg || msg === key) return fallbackMessage;
  return msg;
}
