import { Moon, Sun } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useEffect } from "react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useAppStore();

  // Apply theme on mount
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors border border-zinc-800 dark:border-zinc-700"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? (
        <Sun size={18} className="text-yellow-400" />
      ) : (
        <Moon size={18} className="text-indigo-400" />
      )}
    </button>
  );
}
