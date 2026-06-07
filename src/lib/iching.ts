import hexagrams from "@/lib/iching-data";
import type { HexagramData } from "@/lib/iching-data";

export type IchingResult = {
  hexagramNumber: number;
  hexagramChar: string;
  chineseName: string;
  upperTrigram: string;
  lowerTrigram: string;
  judgment: string;
  image: string;
  changingLine: number;
  changingLineText?: string;
  changedHexagram?: { number: number; name: string; char: string; judgment: string };
};

function getHexagram(index: number): HexagramData {
  // index is 0-63
  return hexagrams[index] ?? hexagrams[0];
}

/** 三爻 → 八卦名（bit0=初爻, true=阴爻, false=阳爻） */
function trigramName(yao3: boolean[]): string {
  const [b0, b1, b2] = yao3;
  if (!b0 && !b1 && !b2) return "乾"; // ☰
  if ( b0 && !b1 && !b2) return "兑"; // ☱
  if (!b0 &&  b1 && !b2) return "离"; // ☲
  if ( b0 &&  b1 && !b2) return "震"; // ☳
  if (!b0 && !b1 &&  b2) return "巽"; // ☴
  if ( b0 && !b1 &&  b2) return "坎"; // ☵
  if (!b0 &&  b1 &&  b2) return "艮"; // ☶
  return "坤"; // ☷
}

/** 六爻 → 在 hexagrams 数组中的位置（匹配上下卦） */
function yaoToIndex(yao: boolean[]): number {
  const lower = trigramName([yao[0], yao[1], yao[2]]); // 下卦 = 初爻+二爻+三爻
  const upper = trigramName([yao[3], yao[4], yao[5]]); // 上卦 = 四爻+五爻+上爻
  const found = hexagrams.findIndex(
    (h) => h.lowerTrigram === lower && h.upperTrigram === upper,
  );
  return found >= 0 ? found : 0;
}

export function castIching(question = "", yao?: boolean[]): IchingResult {
  let index: number;
  let seed: number;
  if (yao && yao.length === 6) {
    // 标准化为布尔：防止 JSON 解析将 true/false 变成字符串
    index = yaoToIndex(yao.map((y) => y === true || (y as unknown as string) === "true"));
    seed = index + [...question].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  } else {
    seed = Date.now() + [...question].reduce((sum, char) => sum + char.charCodeAt(0), 0);
    index = ((seed % 64) + 64) % 64;
  }
  const hexagram = getHexagram(index);
  const changingLine = (seed % 6) + 1;
  const changedIndex = ((index + changingLine * 7) % 64 + 64) % 64;
  const changedHexagram = getHexagram(changedIndex);

  return {
    hexagramNumber: hexagram.index,
    hexagramChar: hexagram.char,
    chineseName: hexagram.name,
    upperTrigram: hexagram.upperTrigram,
    lowerTrigram: hexagram.lowerTrigram,
    judgment: hexagram.judgment,
    image: hexagram.image,
    changingLine,
    changingLineText: `第${changingLine}爻动：${hexagram.lines[changingLine - 1]}`,
    changedHexagram: {
      number: changedHexagram.index,
      name: changedHexagram.name,
      char: changedHexagram.char,
      judgment: changedHexagram.judgment,
    },
  };
}

export function getIchingFreeReading(result: IchingResult) {
  return [
    explainGua(result),
    explainLine(result),
    explainChanged(result),
    adviceItems(result).join("\n"),
  ].join("\n---\n");
}

/** 卦辞白话解释 */
function explainGua(r: IchingResult): string {
  const upper = r.upperTrigram;
  const lower = r.lowerTrigram;
  const name = r.chineseName;

  // 根据卦名和上下卦关系给出白话解读
  const dynamic = `${upper}在上、${lower}在下`; // e.g. "离在上、坎在下"
  const pair = upperLowerRelation(upper, lower);

  return `${name}，${dynamic}。${pair}\n\n"${r.judgment.split("。")[0]}"——这句话的意思是：${simplifyJudgment(r)}`;
}

/** 动爻白话解释 */
function explainLine(r: IchingResult): string {
  const pos = r.changingLine;
  const stageText = ["", "事情刚刚起步，还在摸索阶段", "有了初步进展，但还不够稳固", "小有成就，需要稳住阵脚", "进入关键转折点，面临重要选择", "发展到了高峰，要把握好度", "事情接近尾声，宜回顾总结"][pos];

  return `当前动在${["", "初", "二", "三", "四", "五", "上"][pos]}爻。${stageText}。\n\n这一爻提醒你：${simplifyLine(r.changingLineText ?? "")}`;
}

/** 变卦白话解释 */
function explainChanged(r: IchingResult): string {
  if (!r.changedHexagram) return "本卦无动爻，以当前卦象为主。";
  const from = r.chineseName;
  const to = r.changedHexagram.name;
  return `从「${from}」变到「${to}」，代表事情会朝这个方向发展。\n\n"${r.changedHexagram.judgment.split("。")[0]}"——意思是：${simplifyChangedJudgment(r.changedHexagram.judgment)}`;
}

/** 综合建议 */
function adviceItems(r: IchingResult): string[] {
  const items = [
    `当前局面：${describeSituation(r)}`,
    `行动方向：${describeAction(r)}`,
    `注意事项：${describeCaution(r)}`,
  ];
  if (r.changedHexagram) {
    items.push(`后续走势：从「${r.chineseName}」走向「${r.changedHexagram.name}」，${describeTrend(r)}`);
  }
  return items;
}

// ---- 辅助函数 ----

function upperLowerRelation(upper: string, lower: string): string {
  const relations: Record<string, Record<string, string>> = {
    "乾": { "乾": "纯阳至健，两乾相叠，有自强不息之势", "坤": "天在上、地在下，天地各安其位，但需注意沟通" },
    "坤": { "坤": "纯阴至顺，两坤相叠，宜顺势而为不宜强求", "乾": "地在上、天在下，位置倒置，暗示需要调整主次关系" },
    "坎": { "离": "水在火上，水火既济，事情已经完成但需守住成果" },
    "离": { "坎": "火在水上，水火未交，事情尚未完成需要继续努力" },
  };

  // 通用描述
  const upperNature = trigramNature(upper);
  const lowerNature = trigramNature(lower);
  const specific = relations[upper]?.[lower];

  if (specific) return specific;
  if (upper === lower) return `两${upper}相叠，${upperNature}的力量加倍，宜顺势集中发力。`;
  return `上${upper}（${upperNature}）下${lower}（${lowerNature}），${upperNature}在外主导，${lowerNature}在内支撑。`;
}

function trigramNature(name: string): string {
  const map: Record<string, string> = {
    "乾": "刚健果决", "坤": "柔顺包容", "震": "行动突破",
    "巽": "渗透适应", "坎": "谨慎避险", "离": "洞察依附",
    "艮": "稳重克制", "兑": "沟通愉悦",
  };
  return map[name] ?? name;
}

function simplifyJudgment(r: IchingResult): string {
  const j = r.judgment.split("。")[0];
  const parts: string[] = [];
  if (j.includes("元亨") || j.includes("元 亨")) parts.push("从根源上就是通达的，大方向很好");
  else if (j.includes("亨")) parts.push("整体趋势是通达顺利的");
  if (j.includes("利贞")) parts.push("坚持正道会很有利");
  else if (j.includes("利")) parts.push("方向是有利的，但要选对时机");
  if (j.includes("贞")) parts.push("坚守正道是前提条件");
  if (j.includes("凶")) parts.push("但存在风险，需要谨慎");
  if (j.includes("悔")) parts.push("过去的困扰会逐渐消退");
  if (j.includes("咎")) parts.push("注意避免过错，小心行事");
  if (j.includes("勿用")) parts.push("现在不适合轻举妄动");
  if (j.includes("有攸往")) parts.push("适合主动出击，有所行动");
  if (parts.length === 0) parts.push("需要结合卦象和动爻综合判断，不能只看卦辞表面意思");
  return parts.join("，") + "。";
}

function simplifyLine(text: string): string {
  if (text.includes("贞吉")) return "坚持正确的做法会带来好结果。";
  if (text.includes("悔亡")) return "之前的困扰会逐渐消退，别太担心。";
  if (text.includes("无咎")) return "虽然没有大的问题，但也不要掉以轻心。";
  if (text.includes("凶")) return "这一阶段需要格外小心，建议保守行事。";
  if (text.includes("利")) return "这是适合行动的时机，但要做好充分准备。";
  return "这一爻的变化是关键，需要结合整体卦象来理解。";
}

function simplifyChangedJudgment(judgment: string): string {
  if (judgment.includes("亨")) return "大方向是向好的，顺利与否取决于你如何应对变化。";
  if (judgment.includes("利")) return "变化的趋势有利，适合调整策略、顺势而为。";
  return "变化中蕴含机会，也伴随不确定，需要灵活应对。";
}

function describeSituation(r: IchingResult): string {
  const upper = trigramNature(r.upperTrigram);
  const lower = trigramNature(r.lowerTrigram);
  return `你正处在「${r.chineseName}」所描述的阶段——外在表现为${upper}，内在基础是${lower}。`;
}

function describeAction(r: IchingResult): string {
  const pos = r.changingLine;
  if (pos <= 2) return "事情还在早期，重点是把基础打牢，不要急于求成。";
  if (pos <= 4) return "现在到了关键节点，需要做出明确选择，犹豫反而错失机会。";
  return "事情已经发展到较高阶段，重点是把控节奏，避免过度。";
}

function describeCaution(r: IchingResult): string {
  const missing: string[] = [];
  const all = ["乾", "坤", "震", "巽", "坎", "离", "艮", "兑"];
  const present = new Set([r.upperTrigram, r.lowerTrigram]);
  for (const t of all) {
    if (!present.has(t)) missing.push(trigramNature(t));
  }
  if (missing.length > 0) {
    return `当前卦象中缺少${missing.slice(0, 2).join("和")}的力量，在这些方面需要特别注意和补充。`;
  }
  return "注意保持上下卦力量的平衡，不要偏向任何一端。";
}

function describeTrend(r: IchingResult): string {
  if (!r.changedHexagram) return "";
  const fromNature = trigramNature(r.lowerTrigram);
  const toNature = trigramNature(r.changedHexagram.name.includes("乾") ? "乾" : r.changedHexagram.name.includes("坤") ? "坤" : r.lowerTrigram);
  return `从${fromNature}向${toNature}转变是自然的发展方向，提前做好准备可以更从容地应对。`;
}
