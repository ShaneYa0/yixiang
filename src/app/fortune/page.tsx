import type { Metadata } from "next";
import { FortuneDetails } from "@/components/fortune/FortuneDetails";
import { FortuneElement } from "@/components/fortune/FortuneElement";
import { FortuneOverview } from "@/components/fortune/FortuneOverview";
import { FortuneTiming } from "@/components/fortune/FortuneTiming";
import { FortuneZodiac } from "@/components/fortune/FortuneZodiac";
import { getDailyFortune } from "@/lib/templates/fortune";

export const metadata: Metadata = {
  title: "今日运势 - 易象",
  description: "查看今日运势，基于真实黄历数据，包含日柱分析、总体评分、宜忌事项、吉神凶煞、吉时吉方与事业财运感情健康分析。",
  openGraph: {
    title: "今日运势 - 易象",
    description: "查看今日运势，基于真实黄历数据，包含日柱分析、总体评分、宜忌事项、吉神凶煞、吉时吉方与事业财运感情健康分析。",
  },
};

export default function FortunePage() {
  const fortune = getDailyFortune();

  return (
    <div className="space-y-5 pt-4">
      <FortuneOverview fortune={fortune} />
      <FortuneElement fortune={fortune} />
      <FortuneDetails fortune={fortune} />
      <FortuneZodiac fortune={fortune} />
      <FortuneTiming fortune={fortune} />
    </div>
  );
}
