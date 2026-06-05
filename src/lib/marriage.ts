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

export type MarriageResult = {
  yuanType: string;
  summary: string;
  details: Record<string, { text: string }>;
  people: { name: string; dominantElement: ElementName; dayMaster: string; zodiac: string }[];
};

// ==================== Single-person marriage ====================

export type SingleMarriageResult = {
  yuanType: string;
  summary: string;
  details: Record<string, { text: string }>;
  timing: { text: string; bestYears: number[] };
  spousePortrait: { text: string; element: ElementName };
  person: { name: string; dominantElement: ElementName; dayMaster: string; zodiac: string };
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
function analyzeWuxing(dominantA: ElementName, dominantB: ElementName): string {
  if (generating[dominantA] === dominantB) {
    return `${dominantA}生${dominantB}：命主A的主导五行生扶命主B，A在关系中倾向于给予支持、提供情绪价值和行动力，B则在被滋养中获得成长。这种结构下A像是关系的"发动机"，需注意避免过度付出。`;
  }
  if (generating[dominantB] === dominantA) {
    return `${dominantB}生${dominantA}：命主B的主导五行生扶命主A，B在关系中扮演支持者的角色。A在关系中感受到滋养和安全感，适合长期发展。`;
  }
  if (dominantA === dominantB) {
    return `两人主导五行同为${dominantA}，性格底色相近，价值观容易一致，相处舒服自然。但同类五行也意味着在压力和冲突时可能缺少互补的缓冲——一个急另一个也急。适合在有共同目标的框架下经营。`;
  }
  if (controlling[dominantA] === dominantB) {
    return `${dominantA}克${dominantB}：命主A的主导五行克制B，关系中A可能天然处于主导位置，B则可能有被压制的感觉。这种配置需要在权力感和表达空间上做出有意识的平衡。`;
  }
  if (controlling[dominantB] === dominantA) {
    return `${dominantB}克${dominantA}：命主B的主导五行克制A，关系中B可能更具主导性。这种配置下A需要确保自己的声音被听到，B需要注意尊重对方的边界。`;
  }
  return `两人五行关系平和，不形成明显的生克链条。适合在共同经历中培养默契，五行互补的作用会随大运流年的变化而浮动。`;
}

/** 纳音气质分析 */
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

/** 生肖匹配分析 */
function analyzeShengxiao(zodiacA: string, zodiacB: string): string {
  const zodiacIndex = (z: string) => ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"].indexOf(z);
  const za = zodiacIndex(zodiacA);
  const zb = zodiacIndex(zodiacB);
  const gap = Math.abs(za - zb);
  if (gap === 4) {
    return `生肖${zodiacA}与${zodiacB}间距为三合配对（差4位），在传统婚配中属于上佳组合。三合生肖在生活节奏、家庭观念和长期规划上容易同步，这种默契往往超越了语言层面的沟通。`;
  }
  if (gap === 6) {
    return `生肖${zodiacA}与${zodiacB}为六冲（差6位），传统观念中视为需要更多耐心和智慧来经营的关系。冲代表动力和变化，不一定导致分离——很多六冲夫妻恰恰在不断的调适中建立了更深的连结。关键是双方是否愿意在冲突中学习而非逃避。`;
  }
  if (gap === 0) {
    return `两人同为${zodiacA}生肖，性格底色有天然的相似性，容易在人生阶段和心理节奏上同步。同生肖组合在传统中视为中等偏吉，优势在于互相理解，需注意的是在相似的压力点面前都缺少缓冲。`;
  }
  return `生肖${zodiacA}与${zodiacB}无冲无合，在传统中属于平缘。生肖只是合婚的一个参考维度，日柱关系和五行互补的重要性远大于此。`;
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
): string {
  const husbandStars = ["正官", "七杀"];
  const wifeStars = ["正财", "偏财"];

  const maleChart = a.gender === "male" ? a : b.gender === "male" ? b : null;
  const femaleChart = a.gender === "female" ? a : b.gender === "female" ? b : null;

  if (!maleChart || !femaleChart) {
    return "双方性别相同，财官互动维度参考有限。建议更多从五行互补和日柱关系看两人的配合模式。同性别伴侣关系在传统命理框架外，但五行生克和日柱合冲的维度仍然适用。";
  }

  let interactions = 0;
  const findings: string[] = [];

  for (const p of femaleChart.pillars) {
    if (wifeStars.includes(p.tenGod)) {
      interactions++;
      findings.push(`男方财星（${p.tenGod}）出现在女方${p.label}`);
    }
    if (p.hiddenTenGods.some((t) => wifeStars.includes(t))) {
      interactions++;
    }
  }

  for (const p of maleChart.pillars) {
    if (husbandStars.includes(p.tenGod)) {
      interactions++;
      findings.push(`女方官星（${p.tenGod}）出现在男方${p.label}`);
    }
    if (p.hiddenTenGods.some((t) => husbandStars.includes(t))) {
      interactions++;
    }
  }

  if (interactions >= 3) {
    return `${findings.slice(0, 2).join("；")}。双方的配偶星在对方命盘中出现多次，这是传统合婚中最为看重的信号之一——代表彼此的性别能量有天然的呼应和引力，缘分根基深厚。`;
  }
  if (interactions >= 1) {
    return `${findings[0]}。配偶星在对方盘中有所呼应，有一定程度的缘分牵引，但不够密集。这意味着两人的吸引可能更依赖于后天的相处和共同成长，而非先天的命理结构。`;
  }
  return "双方配偶星未在对方盘中明显显现。这不代表无缘——许多幸福的婚姻中，配偶星互动并不密集。它意味着这段关系更多地建立在现实相处、共同经历和自主选择的基础上，而非命理层面的先天牵引。";
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

  const wuxingText = analyzeWuxing(a.dominantElement, b.dominantElement);
  const nayinText = analyzeNayin(a.pillars[2].nayin, b.pillars[2].nayin);
  const shengxiaoText = analyzeShengxiao(a.zodiac, b.zodiac);
  const dayunText = analyzeLuckSync(a, b);
  const caiguanText = analyzeCaiGuan(a, b);

  // 缘型判定：基于日柱合、五行生、生肖合三个核心维度
  const dayStemHarmonized = heavenlyStemHarmony[dayStemA + dayStemB];
  const dayBranchHarmonized = earthlyBranchHarmony[dayBranchA + dayBranchB];
  const dayBranchClashed = earthlyBranchClash.has(dayBranchA + dayBranchB);
  const dayBranchHarmed = earthlyBranchHarm.has(dayBranchA + dayBranchB);
  const wuxingGenerating = generating[a.dominantElement] === b.dominantElement
    || generating[b.dominantElement] === a.dominantElement;
  const wuxingControlling = controlling[a.dominantElement] === b.dominantElement
    || controlling[b.dominantElement] === a.dominantElement;

  const zodiacIndex = (z: string) => ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"].indexOf(z);
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
    "天赐良缘": "日柱天干五合有情，五行相生有助，生肖三合有应。各方面高度契合，这种配置在传统合婚中极为难得。建议在感情中保持真诚与珍惜，顺其自然地发展，不必刻意用力。",
    "互补良缘": "五行有相生之势，关键维度多有和谐。两人在相处中能互相补充对方所缺，适合共同经营长期关系。优势在于「不同而和」——各自的特质恰好是对方所需要的力量。",
    "契合之缘": "多数维度协调中性，有一定的合拍基础。关系是否能深入发展，更多取决于双方的意愿和现实经营而非命理结构。适合在共同目标和日常相处中逐步建立信任。",
    "成长之缘": "命理层面存在冲害或五行制衡，传统观念中需要更多耐心和智慧来经营。但张力也是成长的机会——如果双方都愿意在关系里学习和调整，这种配置反而可能带来更深层的连结。",
  };

  return {
    yuanType,
    summary: summaries[yuanType],
    details: {
      rizhu: { text: rizhuText },
      wuxing: { text: wuxingText },
      nayin: { text: nayinText },
      shengxiao: { text: shengxiaoText },
      dayun: { text: dayunText },
      caiguan: { text: caiguanText },
    },
    people: [
      { name: personA.name || "甲方", dominantElement: a.dominantElement, dayMaster: a.dayMaster, zodiac: a.zodiac },
      { name: personB.name || "乙方", dominantElement: b.dominantElement, dayMaster: b.dayMaster, zodiac: b.zodiac },
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
    "正缘明朗": "配偶星透干有力，婚姻宫稳固无冲，各方面信号清晰。不必过于急切——好的缘分会在合适的时机自然出现，保持开放的心态即可。",
    "佳期可期": "配偶星有显现，婚姻宫尚稳，姻缘的基础不错。可关注大运流年引动配偶星或合日支的年份，那些时间窗口往往带来关键的缘分转折。",
    "缘待时机": "配偶星藏支未透，缘分需要更多耐心等待大运或流年的引动。在等待的过程中，做好自己、积累自己，往往比焦虑于「何时遇到」更有意义。",
    "水到渠成": "配偶星不显但婚姻宫无冲无破，属于顺其自然型。这类配置往往通过朋友介绍、工作环境或长期相处发展出感情，而非闪电式的浪漫。过程虽缓，但根基稳。",
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
function computeMarriageTiming(
  bazi: ReturnType<typeof calculateBazi>,
  spouseStars: string[],
  peachBranch: string,
): { text: string; bestYears: number[] } {
  const currentYear = new Date().getFullYear();
  const bestYears: number[] = [];

  if (bazi.luck.currentCycle) {
    const cycle = bazi.luck.currentCycle;
    for (const year of cycle.years) {
      if (year.year < currentYear - 2) continue;
      if (year.year > currentYear + 10) break;
      const yearBranch = year.ganZhi[1];
      if (yearBranch === peachBranch || earthlyBranchHarmony[yearBranch + bazi.pillars[2].ganZhi[1]]) {
        bestYears.push(year.year);
      }
    }
  }

  if (bestYears.length === 0) {
    bestYears.push(currentYear + 1, currentYear + 2);
  }

  const text = bestYears.length > 0
    ? `从大运流年看，${bestYears.slice(0, 3).join("、")}等年份桃花星或合日支引动，适合发展感情或进入婚姻。桃花星引动之年往往带来关键的缘分转折，合日支之年则适合确定关系和进入婚姻。`
    : "近期大运引动不够明显，建议在生活节奏稳定、事业和心态平衡的阶段主动社交，不必强求某个特定时间点。";

  return { text, bestYears: bestYears.slice(0, 5) };
}

/** Generate spouse portrait based on bazi patterns */
function computeSpousePortrait(
  bazi: ReturnType<typeof calculateBazi>,
  spouseStars: string[],
): { text: string; element: ElementName } {
  const dayBranchElement = bazi.pillars[2].element;

  // Spouse element: the element that the day-branch element generates
  const spouseElement: ElementName = generating[dayBranchElement];

  const starLabel = spouseStars[0].includes("财") ? "财星" : "官星";

  const traitMap: Record<string, string> = {
    "火": "热情主动、有感染力",
    "土": "稳重可靠、有耐心",
    "金": "果断利落、有原则",
    "水": "灵活变通、善交际",
    "木": "温和包容、有同理心",
  };

  const text = [
    `从命局${starLabel}分布来看，未来伴侣五行偏${spouseElement}性，`,
    `性格特征：${traitMap[spouseElement] ?? "综合素质均衡"}。`,
    `相处中宜以相互理解和尊重为基础，给彼此足够的成长空间和正向反馈。`,
    `日支${bazi.pillars[2].ganZhi[1]}属${dayBranchElement}，日支生${spouseElement}，代表命主天然倾向于滋养和支持伴侣。`,
  ].join("");

  return { text, element: spouseElement };
}
