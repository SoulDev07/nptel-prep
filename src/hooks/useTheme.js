import { useCallback, useEffect, useState } from "react";

function getInitialTheme() {
  const saved = globalThis.localStorage?.getItem("nptel_prep_theme");
  if (saved === "light" || saved === "dark") return saved;
  return globalThis.matchMedia?.("(prefers-color-scheme: dark)")?.matches ? "dark" : "light";
}

export function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    globalThis.localStorage?.setItem("nptel_prep_theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  return { theme, setTheme, toggleTheme, isDark: theme === "dark" };
}
