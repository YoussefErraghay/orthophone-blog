"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

/**
 * Light/dark toggle.
 *
 * The class is applied to <html> by an inline script in the root layout before
 * paint, so there's no flash. This component only flips it and stores the
 * choice; it reads the current value from the DOM rather than duplicating it in
 * React state.
 */

const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function isDark() {
  return document.documentElement.classList.contains("dark");
}

export function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, isDark, () => false);

  function toggle() {
    const next = !isDark();
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("ortho_theme", next ? "dark" : "light");
    } catch {
      // Storage blocked; the choice just won't persist.
    }
    listeners.forEach((notify) => notify());
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Passer en thème clair" : "Passer en thème sombre"}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[--c-text-soft] transition hover:bg-[--c-muted] hover:text-[--c-accent]"
    >
      {dark ? (
        <Sun className="h-4 w-4" aria-hidden />
      ) : (
        <Moon className="h-4 w-4" aria-hidden />
      )}
    </button>
  );
}
