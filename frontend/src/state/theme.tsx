import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./auth";

type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  fontSize: "sm" | "md" | "lg";
  setFontSize: (fontSize: "sm" | "md" | "lg") => void;
  highContrast: boolean;
  toggleHighContrast: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => (localStorage.getItem("lawkey.theme") as Theme) || "light");
  const [fontSize, setFontSizeState] = useState<"sm" | "md" | "lg">(
    () => (localStorage.getItem("lawkey.fontSize") as "sm" | "md" | "lg") || "md"
  );
  const [highContrast, setHighContrastState] = useState<boolean>(() => localStorage.getItem("lawkey.highContrast") === "true");
  const { user, saveUserSettings } = useAuth();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("lawkey.theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.dataset.font = fontSize;
    localStorage.setItem("lawkey.fontSize", fontSize);
  }, [fontSize]);

  useEffect(() => {
    document.documentElement.classList.toggle("hc", highContrast);
    localStorage.setItem("lawkey.highContrast", String(highContrast));
  }, [highContrast]);

  useEffect(() => {
    if (!user?.settings) return;
    if (user.settings.theme) setThemeState(user.settings.theme);
    if (user.settings.fontSize) setFontSizeState(user.settings.fontSize);
    if (typeof user.settings.highContrast === "boolean") setHighContrastState(user.settings.highContrast);
  }, [user?.settings]);

  const setTheme = useCallback(
    (next: Theme) => {
      setThemeState(next);
      void saveUserSettings({ theme: next });
    },
    [saveUserSettings]
  );

  const setFontSize = useCallback(
    (next: "sm" | "md" | "lg") => {
      setFontSizeState(next);
      void saveUserSettings({ fontSize: next });
    },
    [saveUserSettings]
  );

  const toggleHighContrast = useCallback(() => {
    setHighContrastState((current) => {
      const next = !current;
      void saveUserSettings({ highContrast: next });
      return next;
    });
  }, [saveUserSettings]);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      const next: Theme = current === "dark" ? "light" : "dark";
      void saveUserSettings({ theme: next });
      return next;
    });
  }, [saveUserSettings]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme,
      toggleTheme,
      fontSize,
      setFontSize,
      highContrast,
      toggleHighContrast
    }),
    [fontSize, highContrast, setFontSize, setTheme, theme, toggleHighContrast, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
