export type Locale = "zh" | "en";

export const DEFAULT_LOCALE: Locale = "zh";

export const LOCALE_STORAGE_KEY = "rps-locale";

export function parseStoredLocale(raw: string | null): Locale | null {
  if (raw === "zh" || raw === "en") return raw;
  return null;
}
