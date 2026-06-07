import type { FortuneResult } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";

const ELEMENT_ICON: Record<string, string> = {
  木: "🌳", 火: "🔥", 土: "⛰️", 金: "⚜️", 水: "💧",
};

export function FortuneElement({ fortune }: { fortune: FortuneResult }) {
  const icon = ELEMENT_ICON[fortune.dayElement] || "☯";

  return (
    <Card>
      <SectionTitle>五行日运</SectionTitle>
      <div className="mb-4 flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <div className="text-sm font-medium text-ink">
            日柱 <span className="tracking-[0.15em]">{fortune.dayPillar}</span>
            <span className="mx-2 text-ink/20">·</span>
            五行属<span className="text-ink">{fortune.dayElement}</span>
          </div>
          <div className="mt-0.5 text-[12px] text-ink-light">
            纳音 {fortune.dayNayin}
          </div>
        </div>
      </div>
      <p className="text-[12px] leading-relaxed text-ink-light border-t border-ink/5 pt-3">
        {fortune.dayLu}
      </p>
    </Card>
  );
}
