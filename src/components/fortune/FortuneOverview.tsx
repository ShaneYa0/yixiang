import type { FortuneResult } from "@/lib/types";

export function FortuneOverview({ fortune }: { fortune: FortuneResult }) {
  return (
    <section className="py-8 text-center">
      <div className="mb-1 flex items-center justify-center gap-3 text-[11px] tracking-[0.2em] text-ink-fade">
        <span>{fortune.date}</span>
        <span className="text-ink/20">|</span>
        <span>{fortune.lunarDate}</span>
      </div>
      <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-ink/10 px-4 py-1 text-[12px] tracking-[0.15em] text-ink-light">
        <span className="text-ink/40">日柱</span>
        <span className="text-ink font-medium">{fortune.dayPillar}</span>
      </div>
      <div className="mb-2 text-4xl font-thin tracking-[0.2em] text-ink">{fortune.level}</div>
      <div className="mb-4 text-[72px] font-thin leading-none text-ink">{fortune.score}</div>
      <p className="mx-auto max-w-xl text-sm leading-7 text-ink-light">{fortune.summary}</p>
      <div className="mt-4 flex items-center justify-center gap-2">
        {fortune.keywords.map((kw) => (
          <span key={kw} className="rounded-full border border-ink/10 px-3 py-0.5 text-[11px] tracking-[0.15em] text-ink">
            {kw}
          </span>
        ))}
      </div>
    </section>
  );
}
