import type { FortuneResult } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SectionTitle } from "@/components/ui/SectionTitle";

export function FortuneDetails({ fortune }: { fortune: FortuneResult }) {
  return (
    <Card>
      <SectionTitle>四项走势</SectionTitle>
      <div className="grid gap-5 sm:grid-cols-2">
        {fortune.details.map((item) => (
          <div key={item.label}>
            <ProgressBar label={item.label} value={item.value} />
            <p className="mt-2 text-[12px] leading-relaxed text-ink-light">{item.text}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
