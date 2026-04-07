"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type ThemeName = "light" | "dark" | "contrast";

type ThemeContextValue = {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
};

const THEME_STORAGE_KEY = "aitsi.theme";
const DEFAULT_THEME: ThemeName = "light";

const ThemeContext = createContext<ThemeContextValue | null>(null);

function isThemeName(value: string | null): value is ThemeName {
  return value === "light" || value === "dark" || value === "contrast";
}

function applyTheme(theme: ThemeName): void {
  document.documentElement.dataset.theme = theme;
}

export function ThemeProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [theme, setThemeState] = useState<ThemeName>(DEFAULT_THEME);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

    if (isThemeName(storedTheme)) {
      setThemeState(storedTheme);
      applyTheme(storedTheme);
      return;
    }

    applyTheme(DEFAULT_THEME);
  }, []);

  function setTheme(nextTheme: ThemeName): void {
    setThemeState(nextTheme);
    applyTheme(nextTheme);
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  }

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme,
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (context === null) {
    throw new Error("useTheme must be used within a ThemeProvider.");
  }

  return context;
}
