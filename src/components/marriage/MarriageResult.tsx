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

/** 渲染结构化文本：每行按前缀自动着色 */
function DetailText({ text }: { text: string }) {
  const lines = text.split("\n").filter(Boolean);

  return (
    <div className="mt-2 space-y-1.5">
      {lines.map((line, i) => {
        const isGood = line.startsWith("✓");
        const isCaution = line.startsWith("△");
        const isBullet = line.startsWith("·");
        const isLabel = line.includes("：") && !isBullet && !isGood && !isCaution;

        return (
          <div
            key={i}
            className={`text-[13px] leading-6 ${
              isGood
                ? "text-emerald-700 dark:text-emerald-400"
                : isCaution
                  ? "text-amber-700 dark:text-amber-400"
                  : "text-ink-light"
            } ${isBullet ? "pl-3" : ""} ${isLabel ? "font-medium text-ink dark:text-paper" : ""}`}
          >
            {line}
          </div>
        );
      })}
    </div>
  );
}

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
            <div className="mt-3 flex items-center justify-center gap-5 text-[13px] text-ink-light">
              <span>日主 <span className="text-ink dark:text-paper">{r.person.dayMaster}</span></span>
              <span className="text-divider">|</span>
              <span>五行 <span className="text-ink dark:text-paper">{r.person.dominantElement}</span></span>
              <span className="text-divider">|</span>
              <span>生肖 <span className="text-ink dark:text-paper">{r.person.zodiac}</span></span>
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
                <DetailText text={detail.text} />
              </Card>
            );
          })}
        </div>

        {/* 正缘时机 */}
        {r.timing && (
          <Card>
            <SectionTitle>正缘时机</SectionTitle>
            <DetailText text={r.timing.text} />
            <div className="mt-3 flex flex-wrap gap-2">
              {r.timing.bestYears.map((y) => (
                <span key={y} className="border border-divider px-2.5 py-1 text-[12px] text-ink-light">
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
            <DetailText text={r.spousePortrait.text} />
            <div className="mt-2 inline-block border border-divider px-2 py-0.5 text-[11px] text-ink-fade">
              五行：{r.spousePortrait.element}
            </div>
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
          <div className="mt-3 flex items-center justify-center gap-5 text-[13px] text-ink-light">
            <span>
              {personA.name || "甲方"}：日主 <span className="text-ink dark:text-paper">{personA.dayMaster}</span>
              {" · "}{personA.dominantElement} · 肖{personA.zodiac}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-center gap-5 text-[13px] text-ink-light">
            <span>
              {personB.name || "乙方"}：日主 <span className="text-ink dark:text-paper">{personB.dayMaster}</span>
              {" · "}{personB.dominantElement} · 肖{personB.zodiac}
            </span>
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
              <DetailText text={detail.text} />
            </Card>
          );
        })}
      </div>
    </div>
  );
}
