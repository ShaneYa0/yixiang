import type { IchingResult } from "@/lib/iching";
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { VIPGate } from "@/components/ui/VIPGate";

export function IchingResultDisplay({ result, reading }: { result: IchingResult; reading: string }) {
  return (
    <div className="space-y-5 pt-8">
      <div className="text-center">
        <div className="mb-4 text-[64px]">{result.hexagramChar}</div>
        <h1 className="mb-2 text-2xl font-thin tracking-[0.3em] text-ink">{result.chineseName}</h1>
        <div className="text-xs tracking-[0.15em] text-ink-soft">
          第{result.hexagramNumber}卦 · {result.upperTrigram}上{result.lowerTrigram}下
        </div>
      </div>
      <Card>
        <SectionTitle>卦辞</SectionTitle>
        <p className="text-[13px] leading-7 text-ink-light">{result.judgment}</p>
      </Card>
      <Card>
        <SectionTitle>动爻 · 第{result.changingLine}爻</SectionTitle>
        <p className="text-[13px] leading-7 text-ink">{result.changingLineText}</p>
        {result.changedHexagram && (
          <div className="mt-4 border-t border-divider pt-4 text-xs text-ink-soft">
            变卦：{result.changedHexagram.char} {result.changedHexagram.name}（第{result.changedHexagram.number}卦）
          </div>
        )}
      </Card>
      <Card>
        <SectionTitle>解卦</SectionTitle>
        <div className="whitespace-pre-line text-[13px] leading-7 text-ink-light">{reading}</div>
      </Card>
      <VIPGate featureName="AI 深度解卦" isVip={false}>
        <div />
      </VIPGate>
    </div>
  );
}
