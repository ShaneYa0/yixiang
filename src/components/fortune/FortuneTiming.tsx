import type { FortuneResult } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";

export function FortuneTiming({ fortune }: { fortune: FortuneResult }) {
  return (
    <Card>
      <SectionTitle>吉时方位</SectionTitle>
      <div className="grid gap-4 text-[13px] sm:grid-cols-3">
        <div className="text-center">
          <div className="mb-1 text-[10px] tracking-[0.2em] text-ink/40">贵人时</div>
          <div className="text-ink font-medium">{fortune.luckyHours.join(" · ")}</div>
        </div>
        <div className="text-center">
          <div className="mb-1 text-[10px] tracking-[0.2em] text-ink/40">幸运色</div>
          <div className="text-ink font-medium">{fortune.luckyColor}</div>
        </div>
        <div className="text-center">
          <div className="mb-1 text-[10px] tracking-[0.2em] text-ink/40">吉方</div>
          <div className="text-ink font-medium">{fortune.luckyDirection}</div>
        </div>
      </div>
      <div className="mt-5 border-t border-ink/5 pt-4 text-center">
        <p className="text-[12px] leading-relaxed text-ink-fade italic">{fortune.proverb}</p>
      </div>
    </Card>
  );
}
