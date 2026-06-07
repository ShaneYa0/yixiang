import hexagrams from "@/lib/iching-data";
import type { HexagramData } from "@/lib/iching-data";

// ── 六爻起卦类型 ──

/**
 * 单爻的四种状态，由三枚铜钱的正反面决定：
 *   0 = 老阴（三反）→ 阴爻，动爻，将变为阳
 *   1 = 少阴（一反两正）→ 阴爻，不变
 *   2 = 少阳（一正两反）→ 阳爻，不变
 *   3 = 老阳（三正）→ 阳爻，动爻，将变为阴
 */
export type LineValue = 0 | 1 | 2 | 3;

export function isYin(l: LineValue): boolean {
  return l < 2; // 0老阴, 1少阴 → 阴爻
}

export function isChanging(l: LineValue): boolean {
  return l === 0 || l === 3; // 老阴或老阳 → 动爻
}

// ── 类型 ──

export type IchingResult = {
  lineValues: LineValue[];           // 原始六爻值，固定从初爻到上爻
  hexagramNumber: number;
  hexagramChar: string;
  chineseName: string;
  upperTrigram: string;
  lowerTrigram: string;
  judgment: string;
  image: string;
  changingLines: number[];           // 动爻位置（1-6），空数组=静卦
  changingLinesText: string[];       // 每条动爻的爻辞
  changedHexagram?: {
    number: number;
    name: string;
    char: string;
    judgment: string;
  };
};

// ── 工具 ──

function getHexagram(index: number): HexagramData {
  return hexagrams[index] ?? hexagrams[0];
}

function trigramName(yao3: boolean[]): string {
  const [b0, b1, b2] = yao3;
  if (!b0 && !b1 && !b2) return "乾";
  if (!b0 && !b1 &&  b2) return "兑";
  if (!b0 &&  b1 && !b2) return "离";
  if (!b0 &&  b1 &&  b2) return "震";
  if ( b0 && !b1 && !b2) return "巽";
  if ( b0 && !b1 &&  b2) return "坎";
  if ( b0 &&  b1 && !b2) return "艮";
  return "坤";
}

const HEXAGRAM_INDEX_MAP: Record<string, number> = {
  "乾:乾":0,"坤:坤":1,"坎:震":2,"艮:坎":3,"坎:乾":4,"乾:坎":5,"坤:坎":6,"坎:坤":7,
  "巽:乾":8,"乾:兑":9,"坤:乾":10,"乾:坤":11,"乾:离":12,"离:乾":13,"坤:艮":14,"震:坤":15,
  "兑:震":16,"艮:巽":17,"坤:兑":18,"巽:坤":19,"离:震":20,"艮:离":21,"艮:坤":22,"坤:震":23,
  "乾:震":24,"艮:乾":25,"艮:震":26,"兑:巽":27,"坎:坎":28,"离:离":29,"兑:艮":30,"震:巽":31,
  "乾:艮":32,"震:乾":33,"离:坤":34,"坤:离":35,"巽:离":36,"离:兑":37,"坎:艮":38,"震:坎":39,
  "艮:兑":40,"巽:震":41,"兑:乾":42,"乾:巽":43,"兑:坤":44,"坤:巽":45,"兑:坎":46,"坎:巽":47,
  "兑:离":48,"离:巽":49,"震:震":50,"艮:艮":51,"巽:艮":52,"震:兑":53,"震:离":54,"离:艮":55,
  "巽:巽":56,"兑:兑":57,"巽:坎":58,"坎:兑":59,"巽:兑":60,"震:艮":61,"坎:离":62,"离:坎":63,
};

/** yao[i] = true(阴) / false(阳)，从初爻到上爻 */
export function getHexagramIndex(yao: boolean[]): number {
  const lower = trigramName([yao[0], yao[1], yao[2]]);
  const upper = trigramName([yao[3], yao[4], yao[5]]);
  return HEXAGRAM_INDEX_MAP[`${upper}:${lower}`] ?? 0;
}

// ── 核心：三钱六摇起卦 ──

/** 抛一枚铜钱 */
function tossOneCoin(): boolean {
  return Math.random() < 0.5;
}

/** 抛三枚铜钱，返回 0-3（正面数） */
function tossThreeCoins(): number {
  let heads = 0;
  for (let i = 0; i < 3; i++) {
    if (tossOneCoin()) heads++;
  }
  return heads;
  // 0 → 老阴（概率 1/8）
  // 1 → 少阴（概率 3/8）
  // 2 → 少阳（概率 3/8）
  // 3 → 老阳（概率 1/8）
}

/** 完整起卦：抛六次铜钱，返回六条爻（从初爻到上爻） */
export function castYao(): LineValue[] {
  return Array.from({ length: 6 }, () => tossThreeCoins() as LineValue);
}

// ── 核心：根据爻值计算卦象 ──

/**
 * 根据六条爻值计算完整的起卦结果。
 * @param lineValues 六条爻值（coins[0]=初爻, coins[5]=上爻）
 */
export function castIching(lineValues: LineValue[]): IchingResult {
  // 阴阳分布 → 本卦
  const yao = lineValues.map((l) => isYin(l)); // true=阴
  const index = getHexagramIndex(yao);
  const hexagram = getHexagram(index);

  // 动爻
  const changingLines: number[] = [];
  const changingLinesText: string[] = [];
  const POS_NAMES = ["初", "二", "三", "四", "五", "上"];

  lineValues.forEach((l, i) => {
    if (isChanging(l)) {
      changingLines.push(i + 1); // 1-6
      changingLinesText.push(`第${POS_NAMES[i]}爻动：${hexagram.lines[i]}`);
    }
  });

  // 变卦：翻转动爻
  let changedHexagram: IchingResult["changedHexagram"];
  if (changingLines.length > 0) {
    const changedYao = [...yao];
    for (const pos of changingLines) {
      changedYao[pos - 1] = !changedYao[pos - 1];
    }
    const changedIndex = getHexagramIndex(changedYao);
    const changed = getHexagram(changedIndex);
    changedHexagram = {
      number: changed.index,
      name: changed.name,
      char: changed.char,
      judgment: changed.judgment,
    };
  }

  return {
    lineValues: [...lineValues],
    hexagramNumber: hexagram.index,
    hexagramChar: hexagram.char,
    chineseName: hexagram.name,
    upperTrigram: hexagram.upperTrigram,
    lowerTrigram: hexagram.lowerTrigram,
    judgment: hexagram.judgment,
    image: hexagram.image,
    changingLines,
    changingLinesText,
    changedHexagram,
  };
}

// ── 解读生成 ──

export function getIchingFreeReading(result: IchingResult): string {
  return [
    explainGua(result),
    explainLines(result),
    explainChanged(result),
    adviceItems(result).join("\n"),
  ].join("\n---\n");
}

function explainGua(r: IchingResult): string {
  const upper = r.upperTrigram;
  const lower = r.lowerTrigram;
  const name = r.chineseName;
  const dynamic = `${upper}在上、${lower}在下`;
  const pair = upperLowerRelation(upper, lower);
  return `${name}，${dynamic}。${pair}\n\n"${r.judgment.split("。")[0]}"——这句话的意思是：${simplifyJudgment(r)}`;
}

function explainLines(r: IchingResult): string {
  if (r.changingLines.length === 0) {
    return "本卦为静卦，六爻皆不动。以本卦卦辞为主进行判断，卦象所揭示的趋势较为稳定持久。若需更具体的行动指引，可参考本卦的彖辞和象辞。";
  }

  return r.changingLines
    .map((pos, idx) => {
      const stageText = [
        "", "事情刚刚起步，还在摸索阶段", "有了初步进展，但还不够稳固",
        "小有成就，需要稳住阵脚", "进入关键转折点，面临重要选择",
        "发展到了高峰，要把握好度", "事情接近尾声，宜回顾总结",
      ][pos];
      const lineText = r.changingLinesText[idx] || "";
      return `动在${["", "初", "二", "三", "四", "五", "上"][pos]}爻。${stageText}。\n\n这一爻提醒你：${simplifyLine(lineText)}`;
    })
    .join("\n\n");
}

function explainChanged(r: IchingResult): string {
  if (!r.changedHexagram) {
    return "本卦为静卦，无变卦。以本卦卦象和卦辞为主，当下的局面较为稳定。";
  }
  const from = r.chineseName;
  const to = r.changedHexagram.name;
  const lineDesc = r.changingLines.length === 1
    ? `因第${r.changingLines[0]}爻变动`
    : `因第${r.changingLines.join("、")}爻共${r.changingLines.length}处变动`;
  return `从「${from}」变到「${to}」(${lineDesc})，代表事情会朝此方向发展。\n\n"${r.changedHexagram.judgment.split("。")[0]}"——意思是：${simplifyChangedJudgment(r.changedHexagram.judgment)}`;
}

function adviceItems(r: IchingResult): string[] {
  const items = [
    `当前局面：${describeSituation(r)}`,
    `行动方向：${describeAction(r)}`,
  ];
  if (r.changingLines.length > 0) {
    items.push(`注意事项：${describeCaution(r)}`);
  }
  if (r.changedHexagram) {
    items.push(`后续走势：从「${r.chineseName}」走向「${r.changedHexagram.name}」，${describeTrend(r)}`);
  }
  return items;
}

// ── 辅助解读 ──

function upperLowerRelation(upper: string, lower: string): string {
  const relations: Record<string, Record<string, string>> = {
    "乾": { "乾": "纯阳至健，两乾相叠，有自强不息之势", "坤": "天在上、地在下，天地各安其位，但需注意沟通" },
    "坤": { "坤": "纯阴至顺，两坤相叠，宜顺势而为不宜强求", "乾": "地在上、天在下，位置倒置，暗示需要调整主次关系" },
    "坎": { "离": "水在火上，水火既济，事情已经完成但需守住成果" },
    "离": { "坎": "火在水上，水火未交，事情尚未完成需要继续努力" },
  };
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
  if (r.changingLines.length === 0) {
    return "静卦意味着当前局面稳定，宜顺势守成，不必急于改变。";
  }
  // 以最上面的动爻为主
  const topLine = Math.max(...r.changingLines);
  if (topLine <= 2) return "事情还在早期，重点是把基础打牢，不要急于求成。";
  if (topLine <= 4) return "现在到了关键节点，需要做出明确选择，犹豫反而错失机会。";
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
  return "变化是自然的发展方向，提前做好准备可以更从容地应对。";
}
