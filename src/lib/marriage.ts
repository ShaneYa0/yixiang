import { calculateBazi } from "@/lib/bazi";
import type { ElementName } from "@/lib/types";

export type PersonInput = {
  name: string;
  birthDate: string;
  birthHour: number;
  gender: "male" | "female";
};

export type SingleMarriageInput = {
  name: string;
  birthDate: string;
  birthHour: number;
  gender: "male" | "female";
};

export type PairFinding = {
  label: string;   // 发现项名称，如 "天干五合"
  detail: string;  // 具体内容，如 "甲己合化土"
  level: "合" | "吉" | "平" | "慎" | "冲";
};

export type PairDimension = {
  title: string;
  text: string;           // 解读文本
  compare: { label: string; a: string; b: string }[];  // 对比数据
  findings: PairFinding[];
};

export type MarriageResult = {
  yuanType: string;
  summary: string;
  dimensions: PairDimension[];
  people: {
    name: string;
    dominantElement: ElementName;
    dayMaster: string;
    zodiac: string;
    birthDate: string;
    birthHour: number;
    gender: string;
    pillars: string[];
  }[];
};

// ==================== Single-person marriage ====================

export type SingleMarriageResult = {
  yuanType: string;
  summary: string;
  details: Record<string, { text: string }>;
  timing: { text: string; pastYears: number[]; currentYear: number | null; futureYears: number[]; yearReasons: Record<number, string> };
  spousePortrait: {
    text: string;
    element: ElementName;
    starLabel: "财星" | "官杀";
    starNames: string[];
    surfaceCount: number;
    hiddenCount: number;
    inPalace: boolean;
  };
  person: { name: string; dominantElement: ElementName; dayMaster: string; zodiac: string; dayBranch: string };
};

// ---- Traditional relationship matrices ----

/** 天干五合: 甲己合土, 乙庚合金, 丙辛合水, 丁壬合木, 戊癸合火 */
const heavenlyStemHarmony: Record<string, string> = {
  "甲己": "土", "己甲": "土",
  "乙庚": "金", "庚乙": "金",
  "丙辛": "水", "辛丙": "水",
  "丁壬": "木", "壬丁": "木",
  "戊癸": "火", "癸戊": "火",
};

/** 地支六合 */
const earthlyBranchHarmony: Record<string, string> = {
  "子丑": "土", "丑子": "土",
  "寅亥": "木", "亥寅": "木",
  "卯戌": "火", "戌卯": "火",
  "辰酉": "金", "酉辰": "金",
  "巳申": "水", "申巳": "水",
  "午未": "土", "未午": "土",
};

/** 地支六冲 */
const earthlyBranchClash = new Set([
  "子午", "午子", "丑未", "未丑",
  "寅申", "申寅", "卯酉", "酉卯",
  "辰戌", "戌辰", "巳亥", "亥巳",
]);

/** 地支六害 */
const earthlyBranchHarm = new Set([
  "子未", "未子", "丑午", "午丑",
  "寅巳", "巳寅", "卯辰", "辰卯",
  "申亥", "亥申", "酉戌", "戌酉",
]);

/** 地支相刑：子卯无礼、寅巳申恃势、丑戌未无恩 */
const earthlyBranchXing = new Set([
  "子卯", "卯子",
  "寅巳", "巳寅", "寅申", "申寅", "巳申", "申巳",
  "丑戌", "戌丑", "丑未", "未丑", "戌未", "未戌",
]);

/** 地支相破 */
const earthlyBranchPo = new Set([
  "子酉", "酉子",
  "寅亥", "亥寅",
  "卯午", "午卯",
  "辰丑", "丑辰",
  "巳申", "申巳", // 巳申既是六合也是刑也是破，六合优先
  "未戌", "戌未",
]);

/** 五行相生关系 */
const generating: Record<ElementName, ElementName> = {
  木: "火", 火: "土", 土: "金", 金: "水", 水: "木",
};

/** 五行相克关系 */
const controlling: Record<ElementName, ElementName> = {
  木: "土", 土: "水", 水: "火", 火: "金", 金: "木",
};

// ---- Analysis helpers (pure text, no scores) ----

/** 日柱天干五合分析 */
function analyzeDayStemHarmony(dayStemA: string, dayStemB: string): string {
  const key = dayStemA + dayStemB;
  const harmony = heavenlyStemHarmony[key];
  if (harmony) {
    return `日柱天干${dayStemA}${dayStemB}为天干五合，化${harmony}，此为合婚中最重要的吉象之一。天干五合代表两人在核心价值观、人生方向和日常沟通中有天然的吸引与默契，不以激情为驱动，而以理解和认同为根基。`;
  }
  return `日柱天干${dayStemA}${dayStemB}无合，两人在沟通中需要更多有意识的磨合。但无合不代表无缘——许多长久关系恰恰建立在彼此察觉差异、主动理解的基础上。天干无合时，关注地支关系更能看出日常相处的底色。`;
}

/** 日柱地支关系分析 */
function analyzeDayBranchRelation(dayBranchA: string, dayBranchB: string): string {
  const key = dayBranchA + dayBranchB;
  if (earthlyBranchHarmony[key]) {
    return `日支${dayBranchA}${dayBranchB}为地支六合，主双方在生活习惯、家庭节奏和日常相处中自然协调。六合是合婚中最受重视的地支关系，代表两个人在同一屋檐下不容易产生根本性的摩擦，适合长期共同生活。`;
  }
  if (earthlyBranchClash.has(key)) {
    return `日支${dayBranchA}${dayBranchB}为地支六冲，主两人在日常节奏和行事风格上有显著差异。冲不一定是坏事——它也能带来活力和新鲜感，但需要双方在沟通中保持耐心，避免将小摩擦升级为原则冲突。`;
  }
  if (earthlyBranchHarm.has(key)) {
    return `日支${dayBranchA}${dayBranchB}为地支六害，传统上认为这是一种暗中损耗的关系——表面平静，实际在细节上容易互相触痛。需要双方在边界感和情绪表达上多下功夫。`;
  }
  return `日支无明显的合冲害关系，属于平和配置。两人在日常生活中可以保持各自的节奏和空间，适合在共同目标中逐步建立默契。`;
}

/** 五行互补分析 */
function analyzeWuxing(
  dominantA: ElementName,
  dominantB: ElementName,
  nameA: string,
  nameB: string,
): string {
  const a = nameA || "甲方";
  const b = nameB || "乙方";
  if (generating[dominantA] === dominantB) {
    return `${dominantA}生${dominantB} · ${a}的主导五行生扶${b}，${a}在关系中倾向于给予支持与情绪价值，${b}则在被滋养中获得成长。需注意避免单方面付出过多。`;
  }
  if (generating[dominantB] === dominantA) {
    return `${dominantB}生${dominantA} · ${b}的主导五行生扶${a}，${b}在关系中扮演支持者的角色，${a}在关系中感受到滋养和安全感。`;
  }
  if (dominantA === dominantB) {
    return `两人主导五行同为${dominantA}，性格底色相近，价值观容易一致，相处舒服自然。但同类五行也意味着在冲突时可能缺少互补的缓冲——一个急另一个也急。`;
  }
  if (controlling[dominantA] === dominantB) {
    return `${dominantA}克${dominantB} · ${a}的主导五行克制${b}，${a}可能天然处于主导位置。相克不代表不好——很多互补关系正是建立在合理的制衡之上，关键是双方都有表达空间。`;
  }
  if (controlling[dominantB] === dominantA) {
    return `${dominantB}克${dominantA} · ${b}的主导五行克制${a}，${b}可能更具主动性。相克在传统合婚中不被简单否定，它带来的是张力也是活力，重点在于相互尊重边界。`;
  }
  return `两人五行关系平和，不形成明显的生克链条。适合在共同经历中培养默契，五行互补的作用会随大运流年的变化而浮动。`;
}

/** 纳音气质分析 */
function getNayinRelation(nayinA: string, nayinB: string): { type: string; detail: string; level: "合" | "吉" | "平" | "慎" | "冲" } {
  const lastA = nayinA[nayinA.length - 1];
  const lastB = nayinB[nayinB.length - 1];
  if (lastA === lastB) {
    return { type: "纳音同气", detail: `同属${lastA}气，内在节奏共振`, level: "合" };
  }
  const isGenerating =
    (lastA === "金" && lastB === "水") || (lastA === "水" && lastB === "木") ||
    (lastA === "木" && lastB === "火") || (lastA === "火" && lastB === "土") ||
    (lastA === "土" && lastB === "金") ||
    (lastB === "金" && lastA === "水") || (lastB === "水" && lastA === "木") ||
    (lastB === "木" && lastA === "火") || (lastB === "火" && lastA === "土") ||
    (lastB === "土" && lastA === "金");
  if (isGenerating) {
    return { type: "纳音相生", detail: `${nayinA}生${nayinB}，气场自然滋养`, level: "吉" };
  }
  return { type: "纳音各异", detail: `${nayinA}与${nayinB}各有其韵`, level: "平" };
}

function analyzeNayin(nayinA: string, nayinB: string): string {
  const lastCharA = nayinA[nayinA.length - 1];
  const lastCharB = nayinB[nayinB.length - 1];
  if (lastCharA === lastCharB) {
    return `日柱纳音分别为${nayinA}与${nayinB}，同属${lastCharA}气。纳音反映一个人内在的气韵和生命节奏，同气意味着两人在直觉层面容易共振，不需太多解释就能理解对方的情绪底色。`;
  }
  if (
    (lastCharA === "金" && lastCharB === "水") || (lastCharA === "水" && lastCharB === "金") ||
    (lastCharA === "木" && lastCharB === "火") || (lastCharA === "火" && lastCharB === "木") ||
    (lastCharA === "火" && lastCharB === "土") || (lastCharA === "土" && lastCharB === "火") ||
    (lastCharA === "土" && lastCharB === "金") || (lastCharA === "金" && lastCharB === "土")
  ) {
    return `日柱纳音${nayinA}与${nayinB}呈相生之势，一方的内在节奏自然滋养另一方。纳音不像天干地支那样显性，它是一种更底层的"气场契合"，让两人在无声处有共鸣。`;
  }
  return `日柱纳音${nayinA}与${nayinB}各有其韵。纳音不同不代表不合，而是两人的内在节奏各有侧重——一个可能偏快一个偏慢，在理解彼此节奏差异的基础上相处反而更有层次。`;
}

/** 生肖→地支 */
const zodiacToBranchMap: Record<string, string> = {
  "鼠": "子", "牛": "丑", "虎": "寅", "兔": "卯",
  "龙": "辰", "蛇": "巳", "马": "午", "羊": "未",
  "猴": "申", "鸡": "酉", "狗": "戌", "猪": "亥",
};

/** 生肖匹配分析 */
function analyzeShengxiao(zodiacA: string, zodiacB: string): string {
  const branchA = zodiacToBranchMap[zodiacA] ?? "";
  const branchB = zodiacToBranchMap[zodiacB] ?? "";
  const pair = branchA + branchB;

  if (earthlyBranchHarmony[pair]) {
    return `生肖${zodiacA}与${zodiacB}为六合配对，在传统婚配中视为吉象。六合生肖在性格和精神层面容易相互欣赏，相处起来比别的组合少一些摩擦。`;
  }
  const ziA = zodiacIndex(zodiacA);
  const ziB = zodiacIndex(zodiacB);
  const gap = Math.abs(ziA - ziB);
  if (gap === 4) {
    return `生肖${zodiacA}与${zodiacB}间距为三合配对，在传统婚配中属于上佳组合。三合生肖在生活节奏、家庭观念和长期规划上容易同步。`;
  }
  if (earthlyBranchClash.has(pair)) {
    return `生肖${zodiacA}与${zodiacB}为六冲，传统观念中视为需要更多耐心和智慧来经营。冲代表动力和变化——很多六冲夫妻恰恰在调适中建立了更深的连结。`;
  }
  if (earthlyBranchXing.has(pair)) {
    return `生肖${zodiacA}与${zodiacB}为相刑，传统合婚中认为是需要特别注意的配置。相刑意味着双方的处事方式和价值判断容易产生摩擦，关系中需要更多的理解和包容，避免小事积累成大问题。`;
  }
  if (earthlyBranchHarm.has(pair)) {
    return `生肖${zodiacA}与${zodiacB}为六害，传统观念中双方在脾气和处事方式上容易产生误会。六害提醒的是沟通中多一份耐心——很多六害夫妻正是因为学会了跨越性格差异，关系反而更稳固。`;
  }
  if (earthlyBranchPo.has(pair)) {
    return `生肖${zodiacA}与${zodiacB}为相破，属于较轻微的生肖不合。相破的影响比冲和害要小，更多体现为生活中的一些细节上的不协调，注意沟通即可。`;
  }
  if (zodiacA === zodiacB) {
    return `两人同为${zodiacA}生肖，性格底色有天然的相似性，容易在人生阶段和心理节奏上同步。同生肖组合在传统中视为中等偏吉。`;
  }
  return `生肖${zodiacA}与${zodiacB}无冲无合，在传统中属于平缘。生肖只是合婚的一个参考维度，日柱关系和五行互补的重要性远大于此。`;
}

function zodiacIndex(z: string): number {
  return ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"].indexOf(z);
}

/** 大运同步分析 */
function analyzeLuckSync(
  a: ReturnType<typeof calculateBazi>,
  b: ReturnType<typeof calculateBazi>,
): string {
  const cycleA = a.luck.currentCycle;
  const cycleB = b.luck.currentCycle;

  if (!cycleA || !cycleB) {
    return "一方或双方尚未起运，大运同步度的参考有限。建议更多关注当下相处的感受和沟通质量，而非命理层面的阶段匹配。";
  }

  const rel = generating[cycleA.element] === cycleB.element
    ? "相生"
    : generating[cycleB.element] === cycleA.element
      ? "相生"
      : cycleA.element === cycleB.element
        ? "相同"
        : controlling[cycleA.element] === cycleB.element || controlling[cycleB.element] === cycleA.element
          ? "相克"
          : "平和";

  if (rel === "相生") {
    return `双方当前大运${cycleA.ganZhi}（${cycleA.startAge}-${cycleA.endAge}岁）与${cycleB.ganZhi}（${cycleB.startAge}-${cycleB.endAge}岁）呈相生之势，人生阶段的节奏比较合拍。一方的运势走向自然支持另一方的发展方向，适合一起做长期规划和重要决策。`;
  }
  if (rel === "相同") {
    return `双方大运五行同为${cycleA.element}，步调相近。默契不错，但也要注意避免同质化带来的疲倦——两个人都处于相似的能量阶段，可能同时激进或同时消沉，需要有意识地在关系中保持不同的视角。`;
  }
  if (rel === "相克") {
    return `当前大运阶段张力较大：${cycleA.ganZhi}与${cycleB.ganZhi}五行相克。一方可能在事业冲刺或人生转型期，另一方则在沉淀或调整阶段。建议各自给彼此更多空间和理解，不强求在每个节点都同步。`;
  }
  return `大运阶段各有侧重，${cycleA.ganZhi}与${cycleB.ganZhi}的关系不形成明显的生克冲合。理解和沟通是让节奏互补的关键。`;
}

/** 财官互动分析 */
function analyzeCaiGuan(
  a: ReturnType<typeof calculateBazi>,
  b: ReturnType<typeof calculateBazi>,
): { text: string; findings: PairFinding[] } {
  const husbandStars = ["正官", "七杀"];
  const wifeStars = ["正财", "偏财"];

  const maleChart = a.gender === "male" ? a : b.gender === "male" ? b : null;
  const femaleChart = a.gender === "female" ? a : b.gender === "female" ? b : null;

  if (!maleChart || !femaleChart) {
    return {
      text: "双方性别相同，财官互动维度参考有限。建议更多从五行互补和日柱关系看两人的配合模式。",
      findings: [{ label: "同性别", detail: "财官互动维度不适用", level: "平" }],
    };
  }

  let interactions = 0;
  const detailLines: string[] = [];

  for (const p of femaleChart.pillars) {
    if (wifeStars.includes(p.tenGod)) {
      interactions++;
      detailLines.push(`男方财星${p.tenGod}现于女方${p.label}`);
    }
    if (p.hiddenTenGods.some((t) => wifeStars.includes(t))) {
      interactions++;
    }
  }

  for (const p of maleChart.pillars) {
    if (husbandStars.includes(p.tenGod)) {
      interactions++;
      detailLines.push(`女方官星${p.tenGod}现于男方${p.label}`);
    }
    if (p.hiddenTenGods.some((t) => husbandStars.includes(t))) {
      interactions++;
    }
  }

  const level: PairFinding["level"] = interactions >= 3 ? "合" : interactions >= 1 ? "吉" : "平";
  const detail = detailLines.length > 0 ? detailLines.slice(0, 2).join("；") : "配偶星未见明显互动";

  if (interactions >= 3) {
    return {
      text: `${detail}。双方的配偶星在对方命盘中出现多次，这是传统合婚中最为看重的信号之一——代表彼此的性别能量有天然的呼应和引力，缘分根基深厚。`,
      findings: [{ label: "配偶星互动", detail, level }],
    };
  }
  if (interactions >= 1) {
    return {
      text: `${detail}。配偶星在对方盘中有所呼应，有一定程度的缘分牵引，但不够密集。这意味着两人的吸引可能更依赖于后天的相处和共同成长，而非先天的命理结构。`,
      findings: [{ label: "配偶星互动", detail, level }],
    };
  }
  return {
    text: "双方配偶星未在对方盘中明显显现。这不代表无缘——许多幸福的婚姻中，配偶星互动并不密集。它意味着这段关系更多地建立在现实相处、共同经历和自主选择的基础上，而非命理层面的先天牵引。",
    findings: [{ label: "配偶星互动", detail: "未见明显夫妻星互动", level: "平" }],
  };
}

// ---- Main calculation ----

export function calculateMarriage(personA: PersonInput, personB: PersonInput): MarriageResult {
  const a = calculateBazi(personA);
  const b = calculateBazi(personB);

  const dayStemA = a.pillars[2].ganZhi[0];
  const dayStemB = b.pillars[2].ganZhi[0];
  const dayBranchA = a.pillars[2].ganZhi[1];
  const dayBranchB = b.pillars[2].ganZhi[1];

  // 各维度纯文本分析
  const rizhuText = [
    analyzeDayStemHarmony(dayStemA, dayStemB),
    analyzeDayBranchRelation(dayBranchA, dayBranchB),
  ].join("\n\n");

  const wuxingText = analyzeWuxing(a.dominantElement, b.dominantElement, personA.name, personB.name);
  const nayinText = analyzeNayin(a.pillars[2].nayin, b.pillars[2].nayin);
  const shengxiaoText = analyzeShengxiao(a.zodiac, b.zodiac);
  const dayunText = analyzeLuckSync(a, b);
  const caiguanResult = analyzeCaiGuan(a, b);

  // 缘型判定：基于日柱合、五行生、生肖合三个核心维度
  const dayStemHarmonized = heavenlyStemHarmony[dayStemA + dayStemB];
  const dayBranchHarmonized = earthlyBranchHarmony[dayBranchA + dayBranchB];
  const dayBranchClashed = earthlyBranchClash.has(dayBranchA + dayBranchB);
  const dayBranchHarmed = earthlyBranchHarm.has(dayBranchA + dayBranchB);
  const wuxingGenerating = generating[a.dominantElement] === b.dominantElement
    || generating[b.dominantElement] === a.dominantElement;
  const wuxingControlling = controlling[a.dominantElement] === b.dominantElement
    || controlling[b.dominantElement] === a.dominantElement;

  const zodiacGap = Math.abs(zodiacIndex(a.zodiac) - zodiacIndex(b.zodiac));
  const zodiacTriple = zodiacGap === 4;

  let yuanType: string;
  if (dayStemHarmonized && wuxingGenerating && zodiacTriple) {
    yuanType = "天赐良缘";
  } else if (wuxingGenerating && (dayStemHarmonized || dayBranchHarmonized || zodiacTriple)) {
    yuanType = "互补良缘";
  } else if (dayBranchClashed || dayBranchHarmed || wuxingControlling) {
    yuanType = "成长之缘";
  } else {
    yuanType = "契合之缘";
  }

  const summaries: Record<string, string> = {
    "天赐良缘": "日柱天干五合有情，五行相生有助，生肖三合有应。三个核心维度均呈吉象，先天匹配度较高。感情中保持真诚与珍惜，顺其自然地发展即可。",
    "互补良缘": "五行有相生之势，关键维度多有和谐。两人各自擅长的领域恰好是对方需要的支撑，「不同而和」是这段关系最大的优势。",
    "契合之缘": "多数维度中性偏吉，有一定的合拍基础。关系能否深入，更多取决于双方的意愿和现实经营，而非命理结构。适合在日常相处中逐步建立信任。",
    "成长之缘": "命理层面存在冲害或五行制衡，意味着相处中需要更多的耐心和智慧。但张力也是成长的机会——愿意在关系里学习和调整的双方，往往能建立更深的连结。",
  };

  // ---- Build structured dimensions ----

  // 日柱关系
  const rizhuFindings: PairFinding[] = [];
  if (dayStemHarmonized) {
    rizhuFindings.push({ label: "天干五合", detail: `${dayStemA}${dayStemB}合化${dayStemHarmonized}`, level: "合" });
  }
  if (dayBranchHarmonized) {
    rizhuFindings.push({ label: "地支六合", detail: `${dayBranchA}${dayBranchB}六合`, level: "吉" });
  }
  if (dayBranchClashed) {
    rizhuFindings.push({ label: "地支六冲", detail: `${dayBranchA}${dayBranchB}相冲`, level: "冲" });
  }
  if (dayBranchHarmed) {
    rizhuFindings.push({ label: "地支六害", detail: `${dayBranchA}${dayBranchB}相害`, level: "慎" });
  }
  if (!dayStemHarmonized && !dayBranchHarmonized && !dayBranchClashed && !dayBranchHarmed) {
    rizhuFindings.push({ label: "无冲无合", detail: "日柱之间无明显冲合关系", level: "平" });
  }

  // 五行互补
  const wuxingFindings: PairFinding[] = [];
  const wxRel = generating[a.dominantElement] === b.dominantElement
    ? `${a.dominantElement}生${b.dominantElement}`
    : generating[b.dominantElement] === a.dominantElement
      ? `${b.dominantElement}生${a.dominantElement}`
      : controlling[a.dominantElement] === b.dominantElement
        ? `${a.dominantElement}克${b.dominantElement}`
        : controlling[b.dominantElement] === a.dominantElement
          ? `${b.dominantElement}克${a.dominantElement}`
          : `${a.dominantElement}${b.dominantElement}比和`;
  wuxingFindings.push({ label: "五行关系", detail: wxRel, level: "平" });

  // 纳音
  const nayinFindings: PairFinding[] = [];
  const nayinRelation = getNayinRelation(a.pillars[2].nayin, b.pillars[2].nayin);
  nayinFindings.push({
    label: nayinRelation.type,
    detail: nayinRelation.detail,
    level: nayinRelation.level,
  });

  // 生肖
  const shengxiaoFindings: PairFinding[] = [];
  const zBranchA = zodiacToBranchMap[a.zodiac] ?? "";
  const zBranchB = zodiacToBranchMap[b.zodiac] ?? "";
  const zPair = zBranchA + zBranchB;

  if (earthlyBranchHarmony[zPair]) {
    shengxiaoFindings.push({ label: "生肖六合", detail: `${a.zodiac}${b.zodiac}六合`, level: "合" });
  } else if (zodiacTriple) {
    shengxiaoFindings.push({ label: "生肖三合", detail: `${a.zodiac}${b.zodiac}三合`, level: "吉" });
  } else if (earthlyBranchClash.has(zPair)) {
    shengxiaoFindings.push({ label: "生肖六冲", detail: `${a.zodiac}${b.zodiac}相冲`, level: "冲" });
  } else if (earthlyBranchXing.has(zPair)) {
    shengxiaoFindings.push({ label: "生肖相刑", detail: `${a.zodiac}${b.zodiac}相刑`, level: "冲" });
  } else if (earthlyBranchHarm.has(zPair)) {
    shengxiaoFindings.push({ label: "生肖六害", detail: `${a.zodiac}${b.zodiac}相害`, level: "慎" });
  } else if (earthlyBranchPo.has(zPair)) {
    shengxiaoFindings.push({ label: "生肖相破", detail: `${a.zodiac}${b.zodiac}相破`, level: "慎" });
  } else if (a.zodiac === b.zodiac) {
    shengxiaoFindings.push({ label: "生肖相同", detail: "同生肖，性格底色相近", level: "平" });
  } else {
    shengxiaoFindings.push({ label: "生肖无冲合", detail: "生肖关系中性", level: "平" });
  }

  // 大运同步
  const dayunFindings: PairFinding[] = [];
  if (a.luck.currentCycle && b.luck.currentCycle) {
    const aCycle = a.luck.currentCycle;
    const bCycle = b.luck.currentCycle;
    const isGenerating = generating[aCycle.element] === bCycle.element || generating[bCycle.element] === aCycle.element;
    const isSame = aCycle.element === bCycle.element;

    if (isSame) {
      dayunFindings.push({ label: "大运同气", detail: `双方均行${aCycle.element}运`, level: "合" });
    } else if (isGenerating) {
      dayunFindings.push({ label: "大运相生", detail: `${aCycle.element}${bCycle.element}相生`, level: "吉" });
    } else {
      dayunFindings.push({ label: "大运异气", detail: `甲方${aCycle.element} · 乙方${bCycle.element}`, level: "平" });
    }
  } else {
    dayunFindings.push({ label: "大运未起", detail: "一方或双方尚未起运", level: "平" });
  }
  // 财官互动
  const caiguanFindings = caiguanResult.findings;
  const aSpouseStar = personA.gender === "male" ? "正财" : "正官";
  const bSpouseStar = personB.gender === "male" ? "正财" : "正官";
  const aDayStem = a.pillars[2].ganZhi[0];
  const bDayStem = b.pillars[2].ganZhi[0];

  const dimensions: PairDimension[] = [
    {
      title: "日柱关系",
      text: rizhuText,
      compare: [
        { label: "日柱", a: `${a.pillars[2].ganZhi}（${a.pillars[2].element}）`, b: `${b.pillars[2].ganZhi}（${b.pillars[2].element}）` },
        { label: "日主", a: a.dayMaster, b: b.dayMaster },
        { label: "日支", a: dayBranchA, b: dayBranchB },
      ],
      findings: rizhuFindings,
    },
    {
      title: "五行关系",
      text: wuxingText,
      compare: [
        { label: "主气", a: a.dominantElement, b: b.dominantElement },
        { label: "五行分布", a: `${a.elements.木}木${a.elements.火}火${a.elements.土}土${a.elements.金}金${a.elements.水}水`, b: `${b.elements.木}木${b.elements.火}火${b.elements.土}土${b.elements.金}金${b.elements.水}水` },
      ],
      findings: wuxingFindings,
    },
    {
      title: "纳音气质",
      text: nayinText,
      compare: [
        { label: "纳音", a: a.pillars[2].nayin, b: b.pillars[2].nayin },
      ],
      findings: nayinFindings,
    },
    {
      title: "生肖关系",
      text: shengxiaoText,
      compare: [
        { label: "生肖", a: a.zodiac, b: b.zodiac },
      ],
      findings: shengxiaoFindings,
    },
    {
      title: "大运同步",
      text: dayunText,
      compare: [
        { label: "当前大运", a: a.luck.currentCycle?.ganZhi ?? "未起运", b: b.luck.currentCycle?.ganZhi ?? "未起运" },
      ],
      findings: dayunFindings,
    },
    {
      title: "财官互动",
      text: caiguanResult.text,
      compare: [
        { label: "配偶星", a: aSpouseStar, b: bSpouseStar },
        { label: "日干", a: aDayStem, b: bDayStem },
      ],
      findings: caiguanFindings,
    },
  ];

  return {
    yuanType,
    summary: summaries[yuanType],
    dimensions,
    people: [
      {
        name: personA.name || "甲方",
        dominantElement: a.dominantElement,
        dayMaster: a.dayMaster,
        zodiac: a.zodiac,
        birthDate: personA.birthDate,
        birthHour: personA.birthHour,
        gender: personA.gender,
        pillars: a.pillars.map((p) => p.ganZhi),
      },
      {
        name: personB.name || "乙方",
        dominantElement: b.dominantElement,
        dayMaster: b.dayMaster,
        zodiac: b.zodiac,
        birthDate: personB.birthDate,
        birthHour: personB.birthHour,
        gender: personB.gender,
        pillars: b.pillars.map((p) => p.ganZhi),
      },
    ],
  };
}

// ==================== Single-person marriage ====================

/** 桃花位：申子辰在酉，寅午戌在卯，亥卯未在子，巳酉丑在午 */
const peachBlossomMap: Record<string, string> = {
  "申": "酉", "子": "酉", "辰": "酉",
  "寅": "卯", "午": "卯", "戌": "卯",
  "亥": "子", "卯": "子", "未": "子",
  "巳": "午", "酉": "午", "丑": "午",
};

/** 日支藏干表中是否含有指定十神 */
function branchHasStar(hiddenTenGods: string[], stars: string[]): boolean {
  return hiddenTenGods.some((t) => stars.includes(t));
}

/** 天干是否有配偶星 */
function stemHasStar(tenGod: string, stars: string[]): boolean {
  return stars.includes(tenGod);
}

export function calculateSingleMarriage(input: SingleMarriageInput): SingleMarriageResult {
  const bazi = calculateBazi(input);
  const { pillars, dominantElement, zodiac, gender } = bazi;
  const dayPillar = pillars[2];
  const dayBranch = dayPillar.ganZhi[1];

  const spouseStars = gender === "male" ? ["正财", "偏财"] : ["正官", "七杀"];

  // ---- 1. 婚姻宫分析 ----
  const palaceGood: string[] = [];
  const palaceIssues: string[] = [];
  let hasPalaceIssue = false;

  // 去重：用 Set 追踪已报告的冲/害/合类型
  const reportedClashes = new Set<string>();
  const reportedHarms = new Set<string>();
  const reportedHarmonies = new Set<string>();

  const otherBranches = pillars.filter((_, i) => i !== 2).map((p) => p.ganZhi[1]);
  for (const branch of otherBranches) {
    const key = dayBranch + branch;
    if (earthlyBranchClash.has(key) && !reportedClashes.has(branch)) {
      hasPalaceIssue = true;
      reportedClashes.add(branch);
      palaceIssues.push(`与${branch}六冲，感情中易有外部变动或内部情绪波动`);
    }
    if (earthlyBranchHarm.has(key) && !reportedHarms.has(branch)) {
      hasPalaceIssue = true;
      reportedHarms.add(branch);
      palaceIssues.push(`与${branch}六害，需在相处中注意细节摩擦`);
    }
    if (earthlyBranchHarmony[key] && !reportedHarmonies.has(branch)) {
      reportedHarmonies.add(branch);
      palaceGood.push(`与${branch}六合，关系根基稳固`);
    }
  }

  if (branchHasStar(dayPillar.hiddenTenGods, spouseStars)) {
    palaceGood.push("配偶星藏于日支，正缘得位");
  }

  const palaceLines: string[] = [];
  palaceLines.push(`日支${dayBranch} · 属${dayPillar.element} · 此为配偶宫`);

  if (palaceGood.length > 0) {
    palaceLines.push(palaceGood.map((g) => `✓ ${g}`).join("\n"));
  }
  if (palaceIssues.length > 0) {
    palaceLines.push(palaceIssues.map((i) => `△ ${i}`).join("\n"));
  }
  if (palaceGood.length === 0 && palaceIssues.length === 0) {
    palaceLines.push("婚姻宫无冲无合，平和稳定");
  }

  const palaceText = palaceLines.join("\n");

  // ---- 2. 配偶星分析 ----
  const starItems: string[] = [];
  let stemCount = 0;
  let branchCount = 0;

  for (let i = 0; i < pillars.length; i++) {
    const p = pillars[i];
    if (stemHasStar(p.tenGod, spouseStars)) {
      stemCount++;
      starItems.push(`${p.label}透${p.tenGod}`);
    }
    if (branchHasStar(p.hiddenTenGods, spouseStars)) {
      branchCount++;
    }
  }

  if (stemCount >= 2) {
    starItems.push("配偶星双透 · 异性缘旺，正缘信号明显");
  } else if (stemCount === 1) {
    starItems.push("配偶星一位透干 · 正缘清晰，方向明确");
  } else if (branchCount > 0) {
    starItems.push("配偶星藏于地支 · 缘分稍隐，节奏偏缓");
  } else {
    starItems.push("配偶星不显 · 需主动社交，等待大运引动");
  }

  if (branchHasStar(dayPillar.hiddenTenGods, spouseStars)) {
    starItems.push("配偶星坐日支 · 正星坐正位，婚后稳固");
  }

  const starText = starItems.map((s) => `· ${s}`).join("\n");

  // ---- 3. 桃花运分析 ----
  const romanceLines: string[] = [];
  const peachBranch = peachBlossomMap[dayBranch] ?? peachBlossomMap[zodiacToBranch(zodiac)];
  let peachCount = 0;
  const peachPillars: string[] = [];

  for (const p of pillars) {
    if (p.ganZhi[1] === peachBranch) {
      peachCount++;
      peachPillars.push(p.label);
    }
  }

  if (peachCount >= 2) {
    romanceLines.push(`桃花星在${peachPillars.join("、")} · 较旺，感情机遇多`);
  } else if (peachCount === 1) {
    romanceLines.push(`桃花星在${peachPillars[0]} · 适度，不过不失`);
  } else {
    romanceLines.push(`桃花星未显 · 理性克制，适合慢热发展`);
  }

  const peachPillar = pillars.find((p) => p.ganZhi[1] === peachBranch);
  if (peachPillar && (stemHasStar(peachPillar.tenGod, spouseStars) || branchHasStar(peachPillar.hiddenTenGods, spouseStars))) {
    romanceLines.push("桃花与配偶星同柱 · 机遇易导向稳定关系");
  }

  let peachClashed = false;
  for (const p of pillars) {
    const key = peachBranch + p.ganZhi[1];
    if (earthlyBranchClash.has(key)) {
      romanceLines.push("桃花星被冲 · 感情机遇有反复，建议不急于下结论");
      peachClashed = true;
      break;
    }
  }

  const romanceText = `桃花位：${peachBranch}\n${romanceLines.map((l) => `· ${l}`).join("\n")}`;

  // ---- 缘型判定 ----
  const hasClearSpouseStar = stemCount >= 1;
  const hasSolidPalace = palaceGood.length > 0 && !hasPalaceIssue;

  let yuanType: string;
  if (hasClearSpouseStar && hasSolidPalace) {
    yuanType = "正缘明朗";
  } else if (hasClearSpouseStar && !hasPalaceIssue) {
    yuanType = "佳期可期";
  } else if (stemCount === 0 && branchCount > 0) {
    yuanType = "缘待时机";
  } else {
    yuanType = "水到渠成";
  }

  const summaries: Record<string, string> = {
    "正缘明朗": "配偶星透干有力，婚姻宫稳固无冲，感情结构清晰。不必过于急切——好的关系会在合适的时机自然舒展，保持开放的心态即可。",
    "佳期可期": "配偶星有显现，婚姻宫尚稳，感情的基础不错。可关注大运流年引动配偶星或合日支的时段，那些节点往往带来关系走向的关键转折。",
    "缘待时机": "配偶星藏支未透，感情缘分需要更多耐心等待大运或流年的引动。在等待的过程中，做好自己、积累自己，往往比焦虑于结果更有意义。",
    "水到渠成": "配偶星不显但婚姻宫无冲无破，属于顺其自然型。这类配置往往通过日常相处或长期了解发展出深刻连接，而非闪电式的冲动。过程虽缓，但根基稳。",
  };

  // ---- Timing ----
  const timing = computeMarriageTiming(bazi, spouseStars, peachBranch);

  // ---- Spouse Portrait ----
  const spousePortrait = computeSpousePortrait(bazi, spouseStars);

  return {
    yuanType,
    summary: summaries[yuanType],
    details: {
      marriagePalace: { text: palaceText },
      spouseStar: { text: starText },
      romanceLuck: { text: romanceText },
    },
    timing,
    spousePortrait,
    person: {
      name: input.name || "命主",
      dominantElement,
      dayMaster: bazi.dayMaster,
      zodiac: bazi.zodiac,
      dayBranch: `${bazi.pillars[2].ganZhi[1]}${bazi.pillars[2].element}`,
    },
  };
}

/** Convert zodiac name to branch for peach blossom lookup */
function zodiacToBranch(zodiac: string): string {
  const map: Record<string, string> = {
    "鼠": "子", "牛": "丑", "虎": "寅", "兔": "卯",
    "龙": "辰", "蛇": "巳", "马": "午", "羊": "未",
    "猴": "申", "鸡": "酉", "狗": "戌", "猪": "亥",
  };
  return map[zodiac] ?? "子";
}

/** Compute best marriage timing from luck cycles */
/** 地支三合局 */
const threeHarmony: Record<string, string[]> = {
  "申": ["子", "辰"], "子": ["申", "辰"], "辰": ["申", "子"],
  "亥": ["卯", "未"], "卯": ["亥", "未"], "未": ["亥", "卯"],
  "寅": ["午", "戌"], "午": ["寅", "戌"], "戌": ["寅", "午"],
  "巳": ["酉", "丑"], "酉": ["巳", "丑"], "丑": ["巳", "酉"],
};

const reasonVariants: Record<string, string[]> = {
  "桃花星引动": [
    "桃花星入年支，感情层面的能见度明显提升，关系容易出现重要转折",
    "年支坐桃花，这一年更容易被关注和靠近，适合打开社交、出现在对的场合",
    "桃花到位的年份，周围的人际温度会升高，把握好节奏和第一印象",
  ],
  "日支六合": [
    "流年地支与配偶宫六合，关系容易在此年趋于稳定，是推进承诺的优选时段",
    "配偶宫被流年合住，感情从模糊走向明确，适合认真讨论关系的下一步",
    "日支逢合，这一年关系推进比平时顺畅，适合把重要的感情决定放在此时",
  ],
  "三合日支": [
    "流年参与三合局引动配偶宫，感情的中长期走向趋于明朗，方向会比之前清晰",
    "三合局入配偶宫，关系稳定性在这一年明显提升，心里的答案会比之前确定",
    "配偶宫得三合助力，不再是被动等待的状态，适合主动规划感情的下一阶段",
  ],
  "三合桃花": [
    "三合局带动桃花位，社交圈扩大带来更多接触机会，需要分辨而非来者不拒",
    "三合把桃花位激活，新的人际连接会变多，关键是看清谁值得深入相处",
    "桃花位被三合引动，人缘和社交机会都上来了，保持开放也保持清醒",
  ],
  "天干五合": [
    "流年天干与日主五合，人缘与吸引力自然提升，适合主动沟通、拉近重要关系",
    "天干合日主，这一年你的表达更容易被对方接收，适合修复或加深感情连接",
    "日主得流年天干来合，人际魅力在线，顺势维护好身边的重要关系",
  ],
};

function getReasonText(reason: string, counter: Record<string, number>): string {
  const variants = reasonVariants[reason];
  if (!variants) return reason;
  const idx = (counter[reason] ?? 0) % variants.length;
  counter[reason] = (counter[reason] ?? 0) + 1;
  return variants[idx];
}

export function computeMarriageTiming(
  bazi: ReturnType<typeof calculateBazi>,
  spouseStars: string[],
  peachBranch: string,
): { text: string; pastYears: number[]; currentYear: number | null; futureYears: number[]; yearReasons: Record<number, string> } {
  const now = new Date().getFullYear();
  const allYears: number[] = [];
  const yearReasons: Record<number, string> = {};
  const reasonCounter: Record<string, number> = {};
  const dayBranch = bazi.pillars[2].ganZhi[1];
  const dayStem = bazi.pillars[2].ganZhi[0];

  // 扫描当前大运 + 下一个大运
  const currentIdx = bazi.luck.cycles.findIndex((c) => c === bazi.luck.currentCycle);
  const targetCycles = bazi.luck.cycles.slice(
    Math.max(0, currentIdx),
    currentIdx + 2,
  );

  for (const cycle of targetCycles) {
    for (const year of cycle.years) {
      if (year.year < now - 2) continue;
      if (year.year > now + 10) break;
      const yearStem = year.ganZhi[0];
      const yearBranch = year.ganZhi[1];
      const reasons: string[] = [];

      // 桃花星
      if (yearBranch === peachBranch) reasons.push("桃花星引动");
      // 日支六合
      if (earthlyBranchHarmony[yearBranch + dayBranch]) reasons.push("日支六合");
      // 地支三合
      if (threeHarmony[yearBranch]?.includes(dayBranch)) reasons.push("三合日支");
      if (threeHarmony[yearBranch]?.includes(peachBranch)) reasons.push("三合桃花");
      // 天干五合
      if (heavenlyStemHarmony[yearStem + dayStem]) reasons.push("天干五合");

      if (reasons.length > 0) {
        allYears.push(year.year);
        const terms = reasons.slice(0, 2).join("，");
        const explain = getReasonText(reasons[0], reasonCounter);
        yearReasons[year.year] = terms + " · " + explain;
      }
    }
  }

  const unique = [...new Set(allYears)].sort((a, b) => a - b);
  const pastYears = unique.filter((y) => y < now);
  const currentYear = unique.includes(now) ? now : null;
  const futureYears = unique.filter((y) => y > now).slice(0, 5);

  const hasRealYears = unique.length > 0;

  const text = hasRealYears
    ? `从大运流年看，${unique.slice(0, 3).join("、")}等年份桃花星或日支合相引动，感情节奏在这些节点容易出现变化或推进。桃花引动之年关系层面的能见度提升，日支合相之年则适合把关系推向更稳定的状态。`
    : "近期大运引动不够明显，感情的节奏更多由个人选择和日常经营主导，不必强求某个特定的时间节点。";

  return { text, pastYears, currentYear, futureYears, yearReasons };
}

/** Generate spouse portrait based on bazi patterns */
function computeSpousePortrait(
  bazi: ReturnType<typeof calculateBazi>,
  spouseStars: string[],
): SingleMarriageResult["spousePortrait"] {
  const starLabel = bazi.gender === "male" ? "财星" : "官杀";
  const dayMaster = bazi.dayMaster as ElementName;
  const spouseElement =
    bazi.gender === "male"
      ? controlling[dayMaster]
      : (Object.entries(controlling).find(([, controlled]) => controlled === dayMaster)?.[0] as ElementName);

  let surfaceCount = 0;
  let hiddenCount = 0;
  const surfacePositions: string[] = [];
  const hiddenPositions: string[] = [];

  bazi.pillars.forEach((pillar) => {
    if (spouseStars.includes(pillar.tenGod)) {
      surfaceCount++;
      surfacePositions.push(`${pillar.label}${pillar.tenGod}`);
    }

    const hiddenHits = pillar.hiddenTenGods.filter((tenGod) => spouseStars.includes(tenGod));
    hiddenCount += hiddenHits.length;
    hiddenHits.forEach((tenGod) => hiddenPositions.push(`${pillar.label}藏${tenGod}`));
  });

  const inPalace = bazi.pillars[2].hiddenTenGods.some((tenGod) => spouseStars.includes(tenGod));
  const visibility =
    surfaceCount > 0
      ? `天干透出${surfaceCount}次（${surfacePositions.join("、")}），传统上视为配偶星信息较显，关系对象通常更容易被命主识别。`
      : hiddenCount > 0
        ? `天干未透，地支藏干出现${hiddenCount}次（${hiddenPositions.join("、")}），传统上视为配偶星信息偏隐，需要通过相处或时运引动后才更清晰。`
        : "四柱天干与地支藏干均未见配偶星，传统上称为配偶星不显，不能据此断定无婚姻，通常需结合大运流年观察。";
  const palaceText = inPalace
    ? `日支配偶宫藏有${spouseStars.filter((star) => bazi.pillars[2].hiddenTenGods.includes(star)).join("、")}，配偶星与婚姻宫有直接联系。`
    : "日支配偶宫未藏配偶星，伴侣特征不能只凭配偶宫单独下结论。";

  const text = [
    `${bazi.gender === "male" ? "男命以财星为配偶星" : "女命以官杀为配偶星"}，本命配偶星为${spouseStars.join("、")}；按日主生克定义，其十神五行属${spouseElement}。这只是配偶星的分类，不代表适合与${spouseElement}命人配对。`,
    `四柱中${visibility}`,
    palaceText,
    `配偶星用于观察感情信息的显隐与位置，不等同于伴侣的实际性格、职业、出生五行或相遇场景。`,
  ].join("");

  return {
    text,
    element: spouseElement,
    starLabel,
    starNames: spouseStars,
    surfaceCount,
    hiddenCount,
    inPalace,
  };
}
