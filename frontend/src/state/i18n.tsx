import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import i18n, { I18N_STORAGE_KEY } from "../i18n";
import { useAuth } from "./auth";
import type { UserSettings } from "../types";

export type Language = "es" | "en";

type I18nContextValue = {
  language: Language;
  setLanguage: (next: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function resolveTemplate(template: string, params?: Record<string, string | number>) {
  if (!params) return template;
  return Object.entries(params).reduce(
    (text, [key, value]) => text.replaceAll(`{{${key}}}`, String(value)),
    template
  );
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const { user, saveUserSettings } = useAuth();
  const { t, i18n: i18nextInstance } = useTranslation();

  const language = (i18nextInstance.resolvedLanguage?.startsWith("en") ? "en" : "es") as Language;

  useEffect(() => {
    if (user?.settings?.language && user.settings.language !== language) {
      void i18n.changeLanguage(user.settings.language);
    }
  }, [language, user?.settings?.language]);

  useEffect(() => {
    document.documentElement.lang = language === "en" ? "en" : "es-CR";
    localStorage.setItem(I18N_STORAGE_KEY, language);
  }, [language]);

  const setLanguage = useCallback(
    (next: Language) => {
      void i18n.changeLanguage(next);
      if (!user) return;

      void saveUserSettings({ language: next } as Partial<UserSettings>).catch(() => {
        // Ignore preference sync failures.
      });
    },
    [saveUserSettings, user]
  );

  const translate = useMemo(
    () => (key: string, params?: Record<string, string | number>) => resolveTemplate(t(key), params),
    [t]
  );

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      setLanguage,
      t: translate
    }),
    [language, setLanguage, translate]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
