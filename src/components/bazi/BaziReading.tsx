import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";
import type { BaziResult } from "@/lib/types";

export function BaziReading({ result }: { result: BaziResult & { reading: string } }) {
  const currentLuck = result.luck.currentCycle;
  const missing = result.missingElements.length > 0 ? result.missingElements.join("、") : "无明显单项缺口";
  const useful = result.usefulElements.join("、") || "需结合大运再定";
  const items = [
    {
      title: "原局判断",
      label: "月令 · 透干 · 通根",
      text: `以${result.dayMaster}日主为核心，综合月令旺衰、天干透出与地支通根，原局判断为「${result.strength}」。这是身强弱与承载能力的结构判断，不直接等同吉凶。`,
      color: "#8B6C4E",
    },
    {
      title: "五行取用",
      label: `${result.dominantElement}气较显 · 缺口${missing}`,
      text: `五行分布以${result.dominantElement}气较显，参考调候先看${useful}。免费版仅给出平衡方向，正式取用仍需核对格局成败、合冲刑害及岁运配合。`,
      color: "#C4A24A",
    },
    {
      title: "岁运落点",
      label: currentLuck ? `${currentLuck.ganZhi}运 · ${currentLuck.startYear}-${currentLuck.endYear}` : "尚未进入正式大运",
      text: currentLuck
        ? `当前大运先看运干运支与日主、月令及财官印食的关系，再判断事业、财运与关系重点。此阶段主题为：${currentLuck.theme}`
        : "当前判断以原局为主；进入正式大运后，需结合运势变化重新核对取用与事项侧重。",
      color: "#5C7A9A",
    },
  ];

  return (
    <Card>
      <SectionTitle>基础解读</SectionTitle>
      <div className="grid gap-3 md:grid-cols-3">
        {items.map((item, index) => (
          <div key={item.title} className="relative overflow-hidden rounded-sm border px-4 py-5" style={{ borderColor: `${item.color}35`, backgroundColor: `${item.color}0B`, animation: `yx-fade-up 0.45s ease both`, animationDelay: `${index * 80}ms` }}>
            <div className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: item.color }} />
            <div className="text-[9px] font-semibold tracking-[0.15em]" style={{ color: item.color }}>{item.label}</div>
            <h3 className="mt-3 text-[14px] font-medium text-ink">{item.title}</h3>
            <p className="mt-3 text-[12px] leading-7 text-ink-light">{item.text}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
