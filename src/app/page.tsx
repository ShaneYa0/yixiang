import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { FeatureCards } from "@/components/home/FeatureCards";

export const metadata: Metadata = {
  title: "易象 - 现代命理解读",
  description: "基于传统易学智慧，用现代界面呈现每日运势、八字排盘、姻缘配对、易经占卦与黄历查询。",
  openGraph: {
    title: "易象 - 现代命理解读",
    description: "基于传统易学智慧，用现代界面呈现每日运势、八字排盘、姻缘配对、易经占卦与黄历查询。",
    type: "website",
  },
};

export default function HomePage() {
  return (
    <div className="pt-10">
      <section className="pb-12 text-center">
        <p className="mb-4 text-[11px] tracking-[0.25em] text-ink-fade">现代命理 · 易学日用</p>
        <h1 className="mb-6 text-5xl font-thin tracking-[0.18em] text-ink sm:text-6xl">易象</h1>
        <p className="mx-auto mb-8 max-w-xl text-sm leading-8 text-ink-light">
          把传统易学里的日课、八字、卦象和黄历，用清爽的网页体验呈现出来。基础功能免费，重要事项可进一步查看深度详批。
        </p>
        <Button href="/fortune">查看今日运势</Button>
      </section>
      <FeatureCards />
    </div>
  );
}
