"use client";

import { useState } from "react";
import type { IchingResult } from "@/lib/iching";
import { Card } from "@/components/ui/Card";
import { HexagramLines, HexagramMark } from "@/components/iching/HexagramLines";

const POS_NAMES = ["初", "二", "三", "四", "五", "上"];

function ToggleSection({ title, classical, plain }: { title: string; classical: string; plain: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Card>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="text-[13px] font-medium tracking-[0.15em] text-ink">{title}</span>
        <span className="text-[10px] tracking-[0.12em] text-ink-fade transition-transform" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
          ▼
        </span>
      </button>

      <p className="mt-3 text-[14px] leading-8 text-ink">{plain}</p>

      {open && (
        <div className="mt-3 border-t border-divider pt-3">
          <p className="text-[11px] tracking-[0.1em] text-ink-fade mb-1">原文</p>
          <p className="text-[13px] leading-7 text-ink-light whitespace-pre-line">{classical}</p>
        </div>
      )}
    </Card>
  );
}

export function IchingResultDisplay({ result, reading }: { result: IchingResult; reading: string }) {
  const sections = parseReading(reading);
  const isStatic = result.changingLines.length === 0;

  return (
    <div className="space-y-4 pt-8">
      {/* 卦象 header */}
      <div className="text-center">
        <HexagramMark lines={result.lineValues} />
        <p className="mb-3 text-[10px] font-semibold tracking-[0.28em] text-[#aa8b55]">本卦 · 六爻已成</p>
        <h1 className="mb-1 text-2xl font-medium tracking-[0.25em] text-ink">
          {result.chineseName}
        </h1>
        <p className="text-xs tracking-[0.15em] text-ink-fade">
          第{result.hexagramNumber}卦 · {result.upperTrigram}上{result.lowerTrigram}下
          {isStatic && <span className="ml-1 text-ink/40">· 静卦</span>}
        </p>
      </div>

      <Card>
        <div className="mb-5 flex items-end justify-between border-b border-divider pb-4">
          <div>
            <p className="text-[10px] tracking-[0.2em] text-ink-fade">本卦六爻</p>
            <p className="mt-1 text-sm text-ink">自上爻至初爻</p>
          </div>
          <span className="text-[10px] tracking-[0.16em] text-[#a85d44]">红色为动爻</span>
        </div>
        <HexagramLines lines={result.lineValues} compact />
      </Card>

      {/* 卦辞 */}
      <ToggleSection
        title="卦辞"
        classical={`《${result.chineseName}》：${result.judgment}\n\n《象》曰：${result.image || ""}`}
        plain={sections.guaExplanation}
      />

      {/* 动爻 — 每条一个折叠 */}
      {result.changingLines.map((pos, idx) => {
        const lineText = result.changingLinesText[idx] ?? "";
        const classicalContent = lineText.replace(/^第[初二三四五上]爻动：/, "");
        const lineExplanation = sections.lineExplanations?.[idx] ?? "";

        return (
          <ToggleSection
            key={pos}
            title={`动爻 · 第${pos}爻（${POS_NAMES[pos - 1]}爻）`}
            classical={classicalContent}
            plain={lineExplanation}
          />
        );
      })}

      {/* 静卦说明 */}
      {isStatic && (
        <Card>
          <p className="text-[13px] font-medium tracking-[0.15em] text-ink mb-2">静卦</p>
          <p className="text-[14px] leading-8 text-ink-light">{sections.lineExplanation}</p>
        </Card>
      )}

      {/* 变卦 */}
      {result.changedHexagram && (
        <ToggleSection
          title={`变卦 · ${result.changedHexagram.name}`}
          classical={`《${result.changedHexagram.name}》：${result.changedHexagram.judgment}`}
          plain={sections.changedExplanation}
        />
      )}

      {/* 综合建议 */}
      <Card>
        <p className="text-[13px] font-medium tracking-[0.15em] text-ink mb-3">综合建议</p>
        <div className="space-y-3 text-[14px] leading-8 text-ink-light">
          {sections.advice.map((item, i) => (
            <div key={i} className="flex gap-2">
              <span className="text-ink-fade shrink-0">{i + 1}.</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/** 从 reading 文本中解析各部分 */
function parseReading(reading: string): {
  guaExplanation: string;
  lineExplanation: string;
  lineExplanations: string[];
  changedExplanation: string;
  advice: string[];
} {
  const parts = reading.split("\n---\n");
  const lineSection = parts[1] ?? "";

  // 多动爻时用 \n\n 分割
  const lineExplanations = lineSection.includes("动在") && lineSection.includes("\n\n")
    ? lineSection.split("\n\n").filter(Boolean)
    : [lineSection];

  return {
    guaExplanation: parts[0] ?? "此卦揭示你当前的处境与整体趋势。",
    lineExplanation: lineSection || "动爻指示当前的关键转折点。",
    lineExplanations,
    changedExplanation: parts[2] ?? "变卦预示事态的可能发展方向。",
    advice: parts[3]
      ? parts[3].split("\n").filter(Boolean)
      : ["结合卦辞和爻辞，判断当前处境和行动方向。", "关注动爻所在阶段，把握时机。", "参考变卦趋势，提前做好应对准备。"],
  };
}
