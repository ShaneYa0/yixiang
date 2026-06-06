import type { FortuneResult } from "@/lib/types";

export function FortuneOverview({ fortune }: { fortune: FortuneResult }) {
  return (
    <section className="py-8 text-center">
      <div className="mb-2 text-[11px] tracking-[0.25em] text-ink-fade">{fortune.date}</div>
      <div className="mb-2 text-4xl font-thin tracking-[0.2em] text-ink">{fortune.level}</div>
      <div className="mb-4 text-[72px] font-thin leading-none text-ink">{fortune.score}</div>
      <p className="mx-auto max-w-lg text-sm leading-7 text-ink-light">{fortune.summary}</p>
    </section>
  );
}
