"use client";

import { useState } from "react";
import type { IchingResult } from "@/lib/iching";
import { Card } from "@/components/ui/Card";

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

      {/* 白话解读 — 始终可见 */}
      <p className="mt-3 text-[14px] leading-8 text-ink">{plain}</p>

      {/* 古文原文 — 折叠 */}
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

  return (
    <div className="space-y-4 pt-8">
      {/* 卦象 header */}
      <div className="text-center">
        <div className="mb-4 text-[72px] leading-none">{result.hexagramChar}</div>
        <h1 className="mb-1 text-2xl font-medium tracking-[0.25em] text-ink">
          {result.chineseName}
        </h1>
        <p className="text-xs tracking-[0.15em] text-ink-fade">
          第{result.hexagramNumber}卦 · {result.upperTrigram}上{result.lowerTrigram}下
        </p>
      </div>

      {/* 折叠式原文 + 白话 */}
      <ToggleSection
        title="卦辞"
        classical={`《${result.chineseName}》：${result.judgment}\n\n《象》曰：${result.image || ""}`}
        plain={sections.guaExplanation}
      />

      <ToggleSection
        title={`动爻 · 第${result.changingLine}爻`}
        classical={result.changingLineText?.replace(/^第\d+爻动：/, "") ?? ""}
        plain={sections.lineExplanation}
      />

      {result.changedHexagram && (
        <ToggleSection
          title={`变卦 · ${result.changedHexagram.name}`}
          classical={`《${result.changedHexagram.name}》：${result.changedHexagram.judgment}`}
          plain={sections.changedExplanation}
        />
      )}

      {/* 综合建议 — 始终展开 */}
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

/** 从 reading 文本中解析出各部分的解释 */
function parseReading(reading: string): {
  guaExplanation: string;
  lineExplanation: string;
  changedExplanation: string;
  advice: string[];
} {
  const parts = reading.split("\n---\n");
  return {
    guaExplanation: parts[0] ?? "此卦揭示你当前的处境与整体趋势。",
    lineExplanation: parts[1] ?? "动爻指示当前的关键转折点。",
    changedExplanation: parts[2] ?? "变卦预示事态的可能发展方向。",
    advice: parts[3] ? parts[3].split("\n").filter(Boolean) : [
      "结合卦辞和爻辞，判断当前处境和行动方向。",
      "关注动爻所在阶段，把握时机。",
      "参考变卦趋势，提前做好应对准备。",
    ],
  };
}
