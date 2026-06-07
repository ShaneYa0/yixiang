"use client";

import { useTheme } from "@/components/layout/ThemeProvider";

export function LargeTextToggle() {
  const { largeText, toggleLargeText } = useTheme();
  const label = largeText ? "关闭大字模式" : "开启大字模式";

  return (
    <button
      type="button"
      onClick={toggleLargeText}
      aria-pressed={largeText}
      aria-label={label}
      title={label}
      className={`inline-flex min-h-10 shrink-0 items-center justify-center rounded-full border px-3 text-[12px] font-semibold tracking-[0.08em] shadow-[0_4px_20px_rgba(44,36,22,0.08)] transition-all duration-300 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-ink/20 ${
        largeText
          ? "border-ink bg-ink text-paper dark:border-paper dark:bg-paper dark:text-ink"
          : "border-divider/70 bg-card text-ink hover:border-ink/30 dark:bg-card/80 dark:text-paper"
      }`}
    >
      <span className="mr-1 text-base leading-none">字</span>
      <span>{largeText ? "标准" : "大字"}</span>
    </button>
  );
}
