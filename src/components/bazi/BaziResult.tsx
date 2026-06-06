import type { BaziResult as Result } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { PillarCard } from "@/components/ui/PillarCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SectionTitle } from "@/components/ui/SectionTitle";

export function BaziResult({ result }: { result: Result }) {
  const currentLuck = result.luck.currentCycle;

  return (
    <div className="space-y-5 pt-8">
      <Card>
        <SectionTitle>命盘概要</SectionTitle>
        <div className="grid gap-3 text-[13px] leading-7 text-ink-light sm:grid-cols-3">
          <span>农历：{result.lunarText}</span>
          <span>生肖：{result.zodiac}</span>
          <span>
            日主：{result.dayMaster} · {result.strength}
          </span>
          <span>胎元：{result.taiYuan}</span>
          <span>命宫：{result.mingGong}</span>
          <span>身宫：{result.shenGong}</span>
          <span>当前节气：{result.solarTerm}</span>
          <span>前一节气：{result.prevSolarTerm}</span>
          <span>后一节气：{result.nextSolarTerm}</span>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {result.pillars.map((pillar) => (
          <PillarCard
            key={pillar.label}
            label={pillar.label}
            ganZhi={pillar.ganZhi}
            nayin={pillar.nayin}
            tenGod={pillar.tenGod}
            hiddenTenGods={pillar.hiddenTenGods}
            xunKong={pillar.xunKong}
          />
        ))}
      </div>

      <Card>
        <SectionTitle>五行分布</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-5">
          {Object.entries(result.elements).map(([element, value]) => (
            <ProgressBar key={element} label={element} value={value} />
          ))}
        </div>
        <p className="mt-5 text-[13px] leading-relaxed text-ink-light">{result.summary}</p>
        <p className="mt-3 text-[13px] leading-relaxed text-ink-light">
          参考调候：{result.usefulElements.join("、")}。此处只作结构参考，真正取用仍要看月令、通根、透干、合冲刑害与大运流年的配合。
        </p>
      </Card>

      <Card>
        <SectionTitle>关键判断</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ["日主强弱", result.professionalReport.dayMaster],
            ["格局取向", result.professionalReport.structure],
            ["当前大运", currentLuck ? `${currentLuck.ganZhi}运，${currentLuck.startYear}-${currentLuck.endYear}，${currentLuck.theme}` : "当前大运未起，先看原局结构。"],
            ["取用提醒", `此盘先看${result.usefulElements.join("、")}是否能形成有效平衡，再结合十神落位判断事业、财运与关系。`],
          ].map(([title, text]) => (
            <div key={title} className="border-t border-divider pt-4">
              <h4 className="mb-2 text-[11px] font-semibold tracking-[0.16em] text-ink">{title}</h4>
              <p className="text-[13px] leading-7 text-ink-light">{text}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <SectionTitle>当前大运概览</SectionTitle>
        <p className="mb-4 text-[13px] leading-7 text-ink-light">{result.luck.startText}</p>
        {currentLuck && (
          <div className="mb-5 border border-ink/20 bg-divider/20 p-4">
            <div className="mb-1 text-[11px] font-semibold tracking-[0.16em] text-ink">当前大运</div>
            <div className="text-sm text-ink">
              {currentLuck.ganZhi} · {currentLuck.startYear}-{currentLuck.endYear} · {currentLuck.startAge}-{currentLuck.endAge}岁
            </div>
            <p className="mt-2 text-[12px] leading-6 text-ink-light">{currentLuck.theme}</p>
          </div>
        )}
        <div className="border border-divider p-4 text-[13px] leading-7 text-ink-light">
          免费版只显示当前阶段，用来确认命盘方向。完整详批会展开每步大运、流年触发点和具体事项。
        </div>
      </Card>
    </div>
  );
}
