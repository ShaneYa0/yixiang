import type { IchingResult } from "@/lib/iching";
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";

export function IchingResultDisplay({ result, reading }: { result: IchingResult; reading: string }) {
  return (
    <div className="space-y-5 pt-8">
      {/* 卦象 header */}
      <div className="text-center">
        <div className="mb-4 text-[72px] leading-none">{result.hexagramChar}</div>
        <h1 className="mb-1 text-2xl font-medium tracking-[0.25em] text-ink">
          {result.chineseName}
        </h1>
        <p className="text-xs tracking-[0.15em] text-ink-fade">
          第{result.hexagramNumber}卦 · {result.upperTrigram}上{result.lowerTrigram}下
          {result.changedHexagram && (
            <span> · 之{result.changedHexagram.name}</span>
          )}
        </p>
      </div>

      {/* 卦辞 */}
      <Card>
        <SectionTitle>卦辞</SectionTitle>
        <p className="text-[14px] leading-8 text-ink">{result.judgment}</p>
        {result.image && (
          <div className="mt-4 border-t border-divider pt-4">
            <p className="text-[11px] tracking-[0.12em] text-ink-fade">象</p>
            <p className="mt-1 text-[13px] leading-7 text-ink-light">{result.image}</p>
          </div>
        )}
      </Card>

      {/* 动爻 */}
      <Card>
        <SectionTitle>动爻 · 第{result.changingLine}爻</SectionTitle>
        <p className="text-[14px] leading-8 text-ink">{result.changingLineText}</p>
        {result.changedHexagram && (
          <div className="mt-4 border-t border-divider pt-4">
            <p className="text-[11px] tracking-[0.12em] text-ink-fade">之卦</p>
            <p className="mt-1 text-2xl">{result.changedHexagram.char}</p>
            <p className="mt-1 text-[13px] font-medium text-ink">
              第{result.changedHexagram.number}卦 · {result.changedHexagram.name}
            </p>
            <p className="mt-2 text-[13px] leading-7 text-ink-light">
              {result.changedHexagram.judgment}
            </p>
          </div>
        )}
      </Card>

      {/* 解卦 */}
      <Card>
        <SectionTitle>解卦</SectionTitle>
        <div className="whitespace-pre-line text-[14px] leading-8 text-ink-light">
          {reading}
        </div>
      </Card>
    </div>
  );
}
