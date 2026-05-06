"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { buildMessageTable } from "@/i18n/catalog/index";
import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  type Locale,
  parseStoredLocale,
} from "@/i18n/locales";

export type TranslateFn = (
  key: string,
  vars?: Record<string, string | number>,
) => string;

interface I18nContextValue {
  locale: Locale;
  setLocale: (next: Locale) => void;
  t: TranslateFn;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, name: string) => {
    const v = vars[name];
    return v === undefined ? `{${name}}` : String(v);
  });
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === "undefined") return DEFAULT_LOCALE;
    return parseStoredLocale(window.localStorage.getItem(LOCALE_STORAGE_KEY)) ?? DEFAULT_LOCALE;
  });

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
      /* ignore quota / private mode */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-Hans" : "en";
  }, [locale]);

  const table = useMemo(() => buildMessageTable(locale), [locale]);

  const t = useCallback<TranslateFn>(
    (key, vars) => {
      const raw = table[key];
      if (raw === undefined) {
        if (process.env.NODE_ENV !== "production") {
          console.warn(`[i18n] missing key: ${key}`);
        }
        return key;
      }
      return interpolate(raw, vars);
    },
    [table],
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
    }),
    [locale, setLocale, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return ctx;
}
