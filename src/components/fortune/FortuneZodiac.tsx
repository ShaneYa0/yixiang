import type { FortuneResult } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";

export function FortuneZodiac({ fortune }: { fortune: FortuneResult }) {
  const { clash, harmony, tripleHarmony } = fortune.zodiacGuide;

  return (
    <Card>
      <SectionTitle>生肖日运</SectionTitle>
      <div className="grid gap-3 text-[13px] sm:grid-cols-3">
        {clash && (
          <div className="rounded bg-red-50 px-3 py-2.5 dark:bg-red-950/40">
            <div className="mb-0.5 text-[10px] tracking-[0.2em] text-red-600/70 dark:text-red-400/70">冲</div>
            <div className="text-red-700 dark:text-red-300">
              属<span className="font-medium">{clash}</span>宜谨慎
            </div>
          </div>
        )}
        {harmony && (
          <div className="rounded bg-emerald-50 px-3 py-2.5 dark:bg-emerald-950/40">
            <div className="mb-0.5 text-[10px] tracking-[0.2em] text-emerald-600/70 dark:text-emerald-400/70">合</div>
            <div className="text-emerald-700 dark:text-emerald-300">
              属<span className="font-medium">{harmony}</span>运势旺
            </div>
          </div>
        )}
        {tripleHarmony && (
          <div className="rounded bg-blue-50 px-3 py-2.5 dark:bg-blue-950/40">
            <div className="mb-0.5 text-[10px] tracking-[0.2em] text-blue-600/70 dark:text-blue-400/70">三合</div>
            <div className="text-blue-700 dark:text-blue-300">
              属<span className="font-medium">{tripleHarmony}</span>皆吉
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
