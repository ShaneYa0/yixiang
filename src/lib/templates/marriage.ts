import type { MarriageResult, SingleMarriageResult } from "@/lib/marriage";

export function getMarriageFreeReading(
  result: MarriageResult | SingleMarriageResult
): string {
  if ("person" in result && !("people" in result)) {
    return getSoloReading(result as SingleMarriageResult);
  }
  return getPairReading(result as MarriageResult);
}

function getPairReading(r: MarriageResult): string {
  const [a, b] = r.people;

  const yuanTypeInsight: Record<string, string> = {
    "天赐良缘": "双方在日柱天干、五行生克和生肖三个核心维度上均呈现吉象，这种配置在传统合婚中极为少见。以下从六个维度展开分析，帮助你理解这段关系的深层结构。",
    "互补良缘": "五行相生之势让这段关系天然具备「补其所缺」的潜力。互补型关系的优势在于，各自擅长的领域恰好是对方需要的支撑。以下从各维度展开。",
    "契合之缘": "多数维度中性偏吉，关系的发展更依赖于后天的经营而非先天的命理推动。这是一种需要时间来浮现其深度的缘分类型。以下为各维度详解。",
    "成长之缘": "命理层面存在张力，但张力也是关系的催化剂。传统合婚不否定冲害配置——很多经历冲害磨合的关系，最终反而比一路平顺的关系更稳固。以下为各维度详解。",
  };

  return [
    `此合婚命盘判定为「${r.yuanType}」。${yuanTypeInsight[r.yuanType] ?? ""}`,
    `双方日主：${a.name || "甲方"}为${a.dayMaster}（${a.dominantElement}），${b.name || "乙方"}为${b.dayMaster}（${b.dominantElement}）。生肖：${a.zodiac}与${b.zodiac}。${r.summary}`,
    `日柱匹配维度——${r.details.rizhu?.text ?? ""}`,
    `五行互补维度——${r.details.wuxing?.text ?? ""}`,
    `纳音气质维度——${r.details.nayin?.text ?? ""}`,
    `生肖匹配维度——${r.details.shengxiao?.text ?? ""}`,
    `大运同步维度——${r.details.dayun?.text ?? ""}`,
    `财官互动维度——${r.details.caiguan?.text ?? ""}`,
    "以上为合婚命盘的全维度解读。合婚看的是先天结构的匹配度，但每一段关系最终的走向，取决于两个人的意愿、沟通和共同成长。命理分析提供的是理解彼此的框架，而非对关系的定论。",
  ].join("\n\n");
}

function getSoloReading(r: SingleMarriageResult): string {
  const yuanTypeInsight: Record<string, string> = {
    "正缘明朗": "配偶星、婚姻宫、桃花位三个维度均呈吉象，先天姻缘结构清晰。以下从婚姻宫、配偶星、桃花运、正缘时机和配偶画像五个维度展开分析。",
    "佳期可期": "配偶星有所显现，婚姻宫基本稳固。在合适的时机到来之前，做好自己往往是最好的准备。以下为各维度详解。",
    "缘待时机": "配偶星偏隐，姻缘需要大运流年的引动。不必焦虑——很多在30岁以后才遇到正缘的命局，恰恰在最合适的人生阶段走进了婚姻。以下为各维度详解。",
    "水到渠成": "配偶星不显但无冲害，属于顺其自然发展型。这类配置的缘分往往来自日常生活和工作环境，而非戏剧化的浪漫。以下为各维度详解。",
  };

  return [
    `此命盘姻缘判定为「${r.yuanType}」。${yuanTypeInsight[r.yuanType] ?? ""}`,
    `命主${r.person.name || "命主"}，日主${r.person.dayMaster}（${r.person.dominantElement}），生肖${r.person.zodiac}。${r.summary}`,
    `婚姻宫维度——${r.details.marriagePalace?.text ?? ""}`,
    `配偶星维度——${r.details.spouseStar?.text ?? ""}`,
    `桃花运维度——${r.details.romanceLuck?.text ?? ""}`,
    `正缘时机——${r.timing?.text ?? ""}`,
    `配偶画像——${r.spousePortrait?.text ?? ""}五行属性：${r.spousePortrait?.element ?? "未知"}。`,
    "姻缘分析看的是先天结构和趋势，但不是宿命。命理框架提供的是理解自己的工具——了解自己的感情模式、需求和节奏，比任何预测都更有价值。",
  ].join("\n\n");
}
