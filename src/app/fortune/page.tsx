import type { Metadata } from "next";
import { FortuneDetails } from "@/components/fortune/FortuneDetails";
import { FortuneOverview } from "@/components/fortune/FortuneOverview";
import { FortuneTiming } from "@/components/fortune/FortuneTiming";
import { VIPGate } from "@/components/ui/VIPGate";
import { getDailyFortune } from "@/lib/templates/fortune";

export const metadata: Metadata = {
  title: "今日运势 - 易象",
  description: "查看今日运势，包含总体评分、宜忌事项、吉时吉方和事业财运感情健康分析。",
  openGraph: {
    title: "今日运势 - 易象",
    description: "查看今日运势，包含总体评分、宜忌事项、吉时吉方和事业财运感情健康分析。",
  },
};

export default function FortunePage() {
  const fortune = getDailyFortune();

  return (
    <div className="space-y-5 pt-4">
      <FortuneOverview fortune={fortune} />
      <FortuneTiming fortune={fortune} />
      <FortuneDetails fortune={fortune} />
      <VIPGate featureName="完整流日分析" isVip={false}>
        <div />
      </VIPGate>
    </div>
  );
}
