"use client";

import { Moon, Sun, Palette } from "lucide-react";
import { useLayoutEffect, useState } from "react";

type Theme = "dark" | "dark-red" | "light";

const applyTheme = (theme: Theme) => {
  document.documentElement.classList.remove("dark", "dark-red", "light");
  if (theme !== "dark") {
    document.documentElement.classList.add(theme);
  }
  localStorage.setItem("theme", theme);
};

const getInitialTheme = (): Theme => {
  const savedTheme =
    typeof window !== "undefined" ? (localStorage.getItem("theme") as Theme | null) : null;
  if (savedTheme) {
    return savedTheme;
  }

  // Detect from document classes
  if (typeof window !== "undefined" && document.documentElement.classList.contains("dark-red")) {
    return "dark-red";
  } else if (
    typeof window !== "undefined" &&
    document.documentElement.classList.contains("light")
  ) {
    return "light";
  }
  return "dark";
};

export function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState<Theme>(() => getInitialTheme());
  const [isOpen, setIsOpen] = useState(false);

  useLayoutEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);

  const handleThemeChange = (theme: Theme) => {
    setCurrentTheme(theme);
    applyTheme(theme);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/20 bg-secondary/20 transition-colors hover:bg-secondary/40"
        aria-label="Theme switcher"
      >
        <Palette className="h-5 w-5 text-primary" />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-48 rounded-lg border border-border bg-card shadow-lg">
          <button
            onClick={() => handleThemeChange("dark")}
            className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/20 ${
              currentTheme === "dark" ? "bg-primary/10 text-primary" : "text-foreground"
            }`}
          >
            <Moon className="h-4 w-4" />
            <span>Dark Blue</span>
            {currentTheme === "dark" && <span className="ml-auto text-primary">✓</span>}
          </button>
          <button
            onClick={() => handleThemeChange("dark-red")}
            className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/20 ${
              currentTheme === "dark-red" ? "bg-primary/10 text-primary" : "text-foreground"
            }`}
          >
            <div className="h-4 w-4 rounded-full bg-red-600" />
            <span>Dark Red</span>
            {currentTheme === "dark-red" && <span className="ml-auto text-primary">✓</span>}
          </button>
          <button
            onClick={() => handleThemeChange("light")}
            className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/20 ${
              currentTheme === "light" ? "bg-primary/10 text-primary" : "text-foreground"
            }`}
          >
            <Sun className="h-4 w-4" />
            <span>Light</span>
            {currentTheme === "light" && <span className="ml-auto text-primary">✓</span>}
          </button>
        </div>
      )}
    </div>
  );
}
