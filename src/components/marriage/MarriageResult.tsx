"use client";

import type { MarriageResult as PairResult, SingleMarriageResult as SoloResult } from "@/lib/marriage";
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";

const pairLabels: Record<string, string> = {
  rizhu: "日柱匹配",
  wuxing: "五行互补",
  nayin: "纳音气质",
  shengxiao: "生肖匹配",
  dayun: "大运同步",
  caiguan: "财官互动",
};

const soloLabels: Record<string, string> = {
  marriagePalace: "婚姻宫",
  spouseStar: "配偶星",
  romanceLuck: "桃花运",
};

const pairDimensionKeys = ["rizhu", "wuxing", "nayin", "shengxiao", "dayun", "caiguan"];
const soloDimensionKeys = ["marriagePalace", "spouseStar", "romanceLuck"];

type Props = {
  mode: "pair" | "solo";
  result: PairResult | SoloResult;
};

export function MarriageResult({ mode, result }: Props) {
  if (mode === "solo") {
    const r = result as SoloResult;
    return (
      <div className="space-y-5 pt-8">
        {/* 总览 */}
        <Card>
          <div className="text-center">
            <div className="text-2xl font-light tracking-[0.2em] text-ink dark:text-paper">
              {r.yuanType}
            </div>
            <div className="mt-3 grid gap-1 text-[13px] leading-7 text-ink-light sm:grid-cols-3">
              <span>日主：{r.person.dayMaster}</span>
              <span>五行：{r.person.dominantElement}</span>
              <span>生肖：{r.person.zodiac}</span>
            </div>
            <p className="mt-4 text-[13px] leading-7 text-ink-light">{r.summary}</p>
          </div>
        </Card>

        {/* 维度卡片 */}
        <div className="grid gap-4 sm:grid-cols-3">
          {soloDimensionKeys.map((key) => {
            const detail = (r.details as Record<string, { text: string }>)[key];
            if (!detail) return null;
            return (
              <Card key={key}>
                <SectionTitle>{soloLabels[key]}</SectionTitle>
                <div className="mt-2 whitespace-pre-line text-[13px] leading-7 text-ink-light">
                  {detail.text}
                </div>
              </Card>
            );
          })}
        </div>

        {/* 正缘时机 */}
        {r.timing && (
          <Card>
            <SectionTitle>正缘时机</SectionTitle>
            <p className="mt-2 text-[13px] leading-7 text-ink-light">{r.timing.text}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {r.timing.bestYears.map((y) => (
                <span key={y} className="border border-divider px-2 py-1 text-[11px] text-ink-light">
                  {y} 年
                </span>
              ))}
            </div>
          </Card>
        )}

        {/* 配偶画像 */}
        {r.spousePortrait && (
          <Card>
            <SectionTitle>配偶画像</SectionTitle>
            <p className="mt-2 text-[13px] leading-7 text-ink-light">{r.spousePortrait.text}</p>
            <div className="mt-2 text-[11px] text-ink-fade">五行属性：{r.spousePortrait.element}</div>
          </Card>
        )}
      </div>
    );
  }

  // ---- Pair mode ----
  const r = result as PairResult;
  const [personA, personB] = r.people;

  return (
    <div className="space-y-5 pt-8">
      {/* 总览 */}
      <Card>
        <div className="text-center">
          <div className="text-2xl font-light tracking-[0.2em] text-ink dark:text-paper">
            {r.yuanType}
          </div>
          <div className="mt-3 grid gap-1 text-[13px] leading-7 text-ink-light sm:grid-cols-2">
            <span>{personA.name || "甲方"}：日主{personA.dayMaster} · {personA.dominantElement} · 肖{personA.zodiac}</span>
            <span>{personB.name || "乙方"}：日主{personB.dayMaster} · {personB.dominantElement} · 肖{personB.zodiac}</span>
          </div>
          <p className="mt-4 text-[13px] leading-7 text-ink-light">{r.summary}</p>
        </div>
      </Card>

      {/* 维度卡片 2x3 */}
      <div className="grid gap-4 sm:grid-cols-2">
        {pairDimensionKeys.map((key) => {
          const detail = (r.details as Record<string, { text: string }>)[key];
          if (!detail) return null;
          return (
            <Card key={key}>
              <SectionTitle>{pairLabels[key]}</SectionTitle>
              <div className="mt-2 whitespace-pre-line text-[13px] leading-7 text-ink-light">
                {detail.text}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
