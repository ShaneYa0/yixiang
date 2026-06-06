import type { BaziResult } from "@/lib/types";

export function getBaziFreeReading(result: BaziResult) {
  const missing = result.missingElements.length > 0 ? result.missingElements.join("、") : "无明显单项缺口";
  const useful = result.usefulElements.length > 0 ? result.usefulElements.join("、") : "需结合大运再定";
  const currentLuck = result.luck.currentCycle;

  return [
    `此盘以${result.dayMaster}为日主，先看月令与四柱通根，再看天干透出和地支藏干。当前系统判断为「${result.strength}」，这是结构判断，不等同于吉凶定论。`,
    `五行分布中，${result.dominantElement}气较显；相对缺口为：${missing}。取用参考先看${useful}，但真正用神仍要结合月令旺衰、格局成败、合冲刑害和大运流年共同确认。`,
    currentLuck
      ? `当前行${currentLuck.ganZhi}大运（${currentLuck.startYear}-${currentLuck.endYear}，${currentLuck.startAge}-${currentLuck.endAge}岁）。此阶段先看大运干支与日主、月令、财官印食之间的关系，再判断事业、财运、关系和健康侧重点。`
      : "当前尚未进入正式大运阶段，基础判断以原局结构为主，后续仍需结合起运时间和流年变化。",
  ].join("\n\n");
}
