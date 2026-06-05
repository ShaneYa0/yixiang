"use client";

import type { MarriageResult as PairResult, SingleMarriageResult as SoloResult } from "@/lib/marriage";
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";

const pairDimensionKeys = ["rizhu", "wuxing", "nayin", "shengxiao", "dayun", "caiguan"] as const;
const soloDimensionKeys = ["marriagePalace", "spouseStar", "romanceLuck"] as const;

const pairMeta: Record<string, { label: string; wide?: boolean }> = {
  rizhu: { label: "日柱匹配", wide: true },
  wuxing: { label: "五行互补" },
  nayin: { label: "纳音气质" },
  shengxiao: { label: "生肖匹配" },
  dayun: { label: "大运同步" },
  caiguan: { label: "财官互动", wide: true },
};

const soloMeta: Record<string, { label: string }> = {
  marriagePalace: { label: "婚姻宫" },
  spouseStar: { label: "配偶星" },
  romanceLuck: { label: "桃花运" },
};

type Props = {
  mode: "pair" | "solo";
  result: PairResult | SoloResult;
};

/** 逐行渲染，按前缀自动着色 */
function DetailLines({ text }: { text: string }) {
  const lines = text.split("\n").filter(Boolean);
  return (
    <>
      {lines.map((line, i) => {
        const isGood = line.startsWith("✓");
        const isCaution = line.startsWith("△");
        const isBullet = line.startsWith("·");
        const isLabel = line.includes("·") && !isBullet && !isGood && !isCaution && line.length < 40;

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
    </>
  );
}

/** 紧凑面板：比 Card 轻量的分隔区块 */
function Panel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-divider pt-4">
      <div className="mb-2 text-[11px] font-semibold tracking-[0.16em] text-ink">{label}</div>
      <div className="space-y-1.5">{children}</div>
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
            <div className="mt-3 flex items-center justify-center gap-4 text-[13px] text-ink-light">
              <span>
                日主 <span className="font-medium text-ink dark:text-paper">{r.person.dayMaster}</span>
              </span>
              <span className="text-divider">·</span>
              <span>
                <span className="font-medium text-ink dark:text-paper">{r.person.dominantElement}</span> 性
              </span>
              <span className="text-divider">·</span>
              <span>
                肖<span className="font-medium text-ink dark:text-paper">{r.person.zodiac}</span>
              </span>
            </div>
            <p className="mt-4 text-[13px] leading-7 text-ink-light">{r.summary}</p>
          </div>
        </Card>

        {/* 三核心维度：紧凑卡片 */}
        <div className="grid gap-4 sm:grid-cols-3">
          {soloDimensionKeys.map((key) => {
            const detail = (r.details as Record<string, { text: string }>)[key];
            if (!detail) return null;
            return (
              <Card key={key} className="py-5">
                <SectionTitle>{soloMeta[key].label}</SectionTitle>
                <div className="mt-1.5 space-y-1">
                  <DetailLines text={detail.text} />
                </div>
              </Card>
            );
          })}
        </div>

        {/* 正缘时机：轻量 Panel + 年份徽章 */}
        {r.timing && (
          <div className="space-y-3">
            <div className="border-t border-divider pt-4">
              <div className="mb-2 text-[11px] font-semibold tracking-[0.16em] text-ink">正缘时机</div>
              <div className="space-y-1.5">
                <DetailLines text={r.timing.text} />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {r.timing.bestYears.map((y, index) => (
                <span
                  key={y}
                  className={`border px-3 py-1.5 text-[13px] tracking-[0.08em] ${
                    index === 0
                      ? "border-ink bg-ink/5 font-medium text-ink dark:border-paper dark:bg-paper/10 dark:text-paper"
                      : "border-divider text-ink-light"
                  }`}
                >
                  {y}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 配偶画像：轻量 Panel */}
        {r.spousePortrait && (
          <Panel label="配偶画像">
            <DetailLines text={r.spousePortrait.text} />
            <div className="mt-2 inline-flex items-center gap-2 border border-divider px-2.5 py-1">
              <span className="text-[10px] tracking-[0.12em] text-ink-fade">五行</span>
              <span className="text-[12px] font-medium text-ink dark:text-paper">{r.spousePortrait.element}</span>
            </div>
          </Panel>
        )}
      </div>
    );
  }

  // ==================== Pair mode ====================
  const r = result as PairResult;
  const [personA, personB] = r.people;
  const details = r.details as Record<string, { text: string }>;

  return (
    <div className="space-y-5 pt-8">
      {/* 总览 */}
      <Card>
        <div className="text-center">
          <div className="text-2xl font-light tracking-[0.2em] text-ink dark:text-paper">
            {r.yuanType}
          </div>

          {/* 两人信息左右并排 */}
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="border border-divider px-4 py-3 text-left">
              <div className="text-[10px] tracking-[0.14em] text-ink-fade">{personA.name || "甲方"}</div>
              <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5 text-[13px] text-ink-light">
                <span>日主 <span className="font-medium text-ink dark:text-paper">{personA.dayMaster}</span></span>
                <span>{personA.dominantElement} 性</span>
                <span>肖 {personA.zodiac}</span>
              </div>
            </div>
            <div className="border border-divider px-4 py-3 text-left">
              <div className="text-[10px] tracking-[0.14em] text-ink-fade">{personB.name || "乙方"}</div>
              <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5 text-[13px] text-ink-light">
                <span>日主 <span className="font-medium text-ink dark:text-paper">{personB.dayMaster}</span></span>
                <span>{personB.dominantElement} 性</span>
                <span>肖 {personB.zodiac}</span>
              </div>
            </div>
          </div>

          <p className="mt-4 text-[13px] leading-7 text-ink-light">{r.summary}</p>
        </div>
      </Card>

      {/* 日柱匹配：最重要 — 全宽 Card */}
      {details.rizhu && (
        <Card>
          <SectionTitle>日柱匹配</SectionTitle>
          <div className="mt-2 space-y-1.5">
            <DetailLines text={details.rizhu.text} />
          </div>
        </Card>
      )}

      {/* 中间四个维度：2x2 紧凑网格 */}
      <div className="grid gap-4 sm:grid-cols-2">
        {["wuxing", "nayin", "shengxiao", "dayun"].map((key) => {
          const detail = details[key];
          if (!detail) return null;
          return (
            <Card key={key} className="py-5">
              <SectionTitle>{pairMeta[key].label}</SectionTitle>
              <div className="mt-1.5 space-y-1.5">
                <DetailLines text={detail.text} />
              </div>
            </Card>
          );
        })}
      </div>

      {/* 财官互动：全宽 Panel */}
      {details.caiguan && (
        <Panel label="财官互动">
          <DetailLines text={details.caiguan.text} />
        </Panel>
      )}
    </div>
  );
}
