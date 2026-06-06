"use client";

import { useTheme } from "@/components/layout/ThemeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === "light";
  const label = isLight ? "切换到暗色模式" : "切换到亮色模式";

  return (
    <button
      onClick={toggleTheme}
      className="group relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-divider/60 bg-card text-ink shadow-[0_4px_24px_rgba(44,36,22,0.10),0_1px_3px_rgba(44,36,22,0.06)] transition-all duration-500 ease-out hover:-translate-y-0.5 hover:scale-105 hover:border-ink/30 hover:shadow-[0_8px_32px_rgba(44,36,22,0.15),0_2px_6px_rgba(44,36,22,0.08)] focus:outline-none focus:ring-2 focus:ring-ink/20 dark:border-divider/50 dark:bg-card/80 dark:text-paper dark:shadow-[0_4px_24px_rgba(0,0,0,0.25),0_1px_3px_rgba(0,0,0,0.15)] dark:hover:border-paper/40 dark:hover:bg-card dark:hover:shadow-[0_8px_36px_rgba(0,0,0,0.35),0_2px_8px_rgba(0,0,0,0.2)]"
      aria-label={label}
      title={label}
    >
      <span className="sr-only">{label}</span>
      {isLight ? <MoonIcon /> : <SunIcon />}
    </button>
  );
}

function MoonIcon() {
  return (
    <svg
      className="h-5 w-5 transition-all duration-500 ease-out group-hover:-rotate-[15deg] group-hover:scale-110"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      {/* Outer glow */}
      <circle cx="12" cy="12" r="10" className="fill-ink/5 dark:fill-paper/10" />
      {/* Crescent moon — classic Lucide-style path */}
      <path
        d="M20 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 20 12.79Z"
        className="fill-ink dark:fill-paper"
      />
      {/* Stars */}
      <circle cx="7" cy="4" r="1" className="fill-ink/70 dark:fill-paper/70" />
      <circle cx="16" cy="6" r="0.7" className="fill-ink/45 dark:fill-paper/45" />
      <circle cx="4.5" cy="9" r="0.5" className="fill-ink/30 dark:fill-paper/30" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg
      className="h-5 w-5 transition-all duration-500 ease-out group-hover:rotate-[60deg] group-hover:scale-110"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      {/* Outer glow aura */}
      <circle cx="12" cy="12" r="10" className="fill-ink/5 dark:fill-paper/10" />
      {/* 8 sun rays */}
      <g className="stroke-ink dark:stroke-paper" strokeWidth="1.8" strokeLinecap="round">
        <line x1="12" y1="1.5" x2="12" y2="4" />
        <line x1="12" y1="20" x2="12" y2="22.5" />
        <line x1="1.5" y1="12" x2="4" y2="12" />
        <line x1="20" y1="12" x2="22.5" y2="12" />
        <line x1="4.6" y1="4.6" x2="6.5" y2="6.5" />
        <line x1="17.5" y1="17.5" x2="19.4" y2="19.4" />
        <line x1="4.6" y1="19.4" x2="6.5" y2="17.5" />
        <line x1="17.5" y1="6.5" x2="19.4" y2="4.6" />
      </g>
      {/* Sun center */}
      <circle cx="12" cy="12" r="4.5" className="fill-ink dark:fill-paper" />
    </svg>
  );
}
