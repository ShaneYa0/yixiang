import type { FortuneResult } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";

export function FortuneTiming({ fortune }: { fortune: FortuneResult }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card>
        <SectionTitle>宜</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {fortune.yi.map((item) => (
            <span key={item} className="bg-divider/40 px-2 py-1 text-[11px] tracking-[0.1em] text-ink">
              {item}
            </span>
          ))}
        </div>
      </Card>
      <Card>
        <SectionTitle>忌</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {fortune.ji.map((item) => (
            <span key={item} className="bg-divider/20 px-2 py-1 text-[11px] tracking-[0.1em] text-ink-light">
              {item}
            </span>
          ))}
        </div>
      </Card>
      <Card className="sm:col-span-2">
        <SectionTitle>吉时方位</SectionTitle>
        <div className="grid gap-3 text-[13px] text-ink-light sm:grid-cols-3">
          <span>吉时：{fortune.luckyHours.join("、") || "午时"}</span>
          <span>幸运色：{fortune.luckyColor}</span>
          <span>吉方：{fortune.luckyDirection}</span>
        </div>
      </Card>
    </div>
  );
}
