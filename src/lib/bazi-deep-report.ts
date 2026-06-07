import type { BaziResult, LuckCycle } from "@/lib/types";

export type DeepReportSource = "free-credit" | "paid" | "subscription";

// ========== Section-specific structured data ==========

export type StructureData = {
  pattern: string;
  patternBasis: string;
  strengthLevel: string;
  strengthBasis: string;
  usefulGods: string[];
  tabooGods: string[];
  tiaoHou: string[];
  palaces: {
    taiYuan: { ganZhi: string; note: string };
    mingGong: { ganZhi: string; note: string };
    shenGong: { ganZhi: string; note: string };
  };
};

export type TenGodCombo = {
  name: string;
  involved: string;
  location: string;
  meaning: string;
};

export type TenGodData = {
  pillarBreakdown: {
    label: string;
    stemTenGod: string;
    branchTenGods: string[];
  }[];
  frequency: {
    name: string;
    count: number;
    meaning: string;
  }[];
  combos: TenGodCombo[];
};

export type CareerWealthData = {
  industries: string[];
  wealthType: string;
  careerRhythm: string;
  riskBoundary: string;
};

export type RelationshipData = {
  spouseStar: {
    location: string;
    element: string;
    tenGod: string;
    analysis: string;
  };
  marriagePalace: {
    branch: string;
    element: string;
    analysis: string;
  };
  signals: string[];
};

export type HealthData = {
  elementHealth: {
    element: string;
    tendency: string;
    advice: string;
  }[];
  personalityTags: string[];
  lifestyleFlags: string[];
};

export type LuckCycleDetail = {
  ganZhi: string;
  startYear: number;
  endYear: number;
  startAge: number;
  endAge: number;
  theme: string;
  focusAreas: string[];
  keyYears: { year: number; age: number; ganZhi: string; hint: string }[];
};

export type LuckData = {
  currentCycle: LuckCycleDetail | null;
  nextCycle: LuckCycleDetail | null;
  cycles: LuckCycleDetail[];
};

export type ConclusionData = {
  coreFindings: string[];
  nearTerm: string[];
  longTerm: string[];
};

// ========== Section type (discriminated union) ==========

export type BaziSection =
  | { kind: "structure"; title: string; summary: string; body: string; highlights: string[]; data: StructureData }
  | { kind: "tenGod"; title: string; summary: string; body: string; highlights: string[]; data: TenGodData }
  | { kind: "careerWealth"; title: string; summary: string; body: string; highlights: string[]; data: CareerWealthData }
  | { kind: "relationship"; title: string; summary: string; body: string; highlights: string[]; data: RelationshipData }
  | { kind: "health"; title: string; summary: string; body: string; highlights: string[]; data: HealthData }
  | { kind: "luck"; title: string; summary: string; body: string; highlights: string[]; data: LuckData }
  | { kind: "conclusion"; title: string; summary: string; body: string; highlights: string[]; data: ConclusionData };

// ========== Full report type ==========

export type BaziDeepReport = {
  id: string;
  type: "bazi";
  ownerEmail: string;
  source: DeepReportSource;
  priceLabel: string;
  generatedAt: string;
  headline: string;
  summary: string;
  dashboard: {
    pillars: {
      label: string;
      ganZhi: string;
      tenGod: string;
      hiddenTenGods: string[];
      nayin: string;
      element: string;
      xunKong: string;
    }[];
    elements: {
      name: string;
      value: number;
      role: string;
    }[];
    tenGods: {
      name: string;
      count: number;
      meaning: string;
    }[];
    strengths: string[];
    risks: string[];
  };
  sections: BaziSection[];
};

// ========== Constants ==========

const TEN_GOD_MEANINGS: Record<string, string> = {
  "比肩": "自我、同辈、执行与竞争",
  "劫财": "行动、资源争夺、合作边界",
  "食神": "表达、作品、稳定输出",
  "伤官": "突破、表达锋芒、规则张力",
  "正财": "稳定收入、现实经营",
  "偏财": "机会财、资源调度、外部市场",
  "正官": "规则、职位、责任与秩序",
  "七杀": "压力、挑战、决断与风险",
  "正印": "学习、保护、贵人与资源",
  "偏印": "洞察、非典型资源、独立思考",
  "日主": "自我核心与判断基准",
};

const PATTERN_NAMES: Record<string, string> = {
  "正官": "正官格",
  "七杀": "七杀格",
  "正印": "正印格",
  "偏印": "偏印格",
  "正财": "正财格",
  "偏财": "偏财格",
  "食神": "食神格",
  "伤官": "伤官格",
  "比肩": "建禄格",
  "劫财": "月劫格",
};

const PATTERN_DESCRIPTIONS: Record<string, string> = {
  "正官格": "以规则和责任为行事主轴，重视秩序、信誉和长期积累。",
  "七杀格": "以决断和抗压为行事主轴，适合在挑战中建立权威。",
  "正印格": "以学习和保护为行事主轴，适合知识型、教育型路径。",
  "偏印格": "以洞察和独立思考为行事主轴，适合研究型、创意型工作。",
  "正财格": "以稳定经营和现实积累为行事主轴，重视现金流和持续产出。",
  "偏财格": "以机会调度和市场嗅觉为行事主轴，适合开拓型商业路径。",
  "食神格": "以表达和作品为行事主轴，适合内容创作、技术服务方向。",
  "伤官格": "以突破和创新为行事主轴，适合变革型、竞争型领域。",
  "建禄格": "以自我承载和均衡发展为行事主轴，适合稳扎稳打的职业路径。",
  "月劫格": "以竞争和资源调配为行事主轴，适合在合作中寻找定位。",
};

const ELEMENT_HEALTH_MAP: Record<string, { tendency: string; advice: string }> = {
  "木": { tendency: "肝胆、筋腱、神经系统易紧张", advice: "规律作息，避免熬夜透支，适当户外舒展" },
  "火": { tendency: "心血管、眼部、炎症反应需留意", advice: "避免长期高强度刺激，保持情绪稳定" },
  "土": { tendency: "脾胃、消化系统、体重管理需关注", advice: "饮食节律稳定，避免思虑过度伤脾" },
  "金": { tendency: "肺、呼吸道、皮肤敏感需留意", advice: "注意空气质量，适当有氧运动增强肺活量" },
  "水": { tendency: "肾、泌尿系统、骨骼关节需保养", advice: "保暖防寒，避免长期久坐，适当补充水分" },
};

const INDUSTRY_MAP: Record<string, string[]> = {
  "木": ["教育", "文化", "出版", "林业", "医药", "设计", "咨询"],
  "火": ["科技", "能源", "媒体", "娱乐", "餐饮", "美容", "互联网"],
  "土": ["地产", "建筑", "农业", "金融", "管理", "物流", "陶瓷"],
  "金": ["法律", "金融", "机械", "汽车", "精密制造", "审计", "军事"],
  "水": ["贸易", "物流", "旅游", "渔业", "饮料", "通讯", "艺术"],
};

const PERSONALITY_MAP: Record<string, string[]> = {
  "木": ["善于规划", "有同理心", "成长导向"],
  "火": ["行动力强", "热情主动", "感染力强"],
  "土": ["稳重可靠", "包容承压", "务实执行"],
  "金": ["原则分明", "判断敏捷", "重视规则"],
  "水": ["灵活应变", "洞察力强", "善于沟通"],
};

// ========== Helpers ==========

function makeId(result: BaziResult) {
  return `bazi-${result.birthDate}-${result.birthHour}-${Date.now()}`;
}

function elementRole(result: BaziResult, name: string) {
  if (name === result.dominantElement) return "偏显";
  if (result.missingElements.includes(name as never)) return "不足";
  if (result.usefulElements.includes(name as never)) return "可用";
  return "平衡";
}

/** Determine pattern from month pillar tenGod */
function determinePattern(result: BaziResult): { pattern: string; basis: string } {
  const monthPillar = result.pillars[1]; // 月柱
  if (!monthPillar) return { pattern: "待定", basis: "月柱信息不完整" };

  const monthTenGod = monthPillar.tenGod;
  const patternName = PATTERN_NAMES[monthTenGod] ?? "待定格";
  const basis = `月令${monthPillar.ganZhi}，天干十神为${monthTenGod}，取${patternName}。`;

  return { pattern: patternName, basis };
}

/** Identify ten god combinations in the chart */
function identifyTenGodCombos(result: BaziResult): TenGodCombo[] {
  const combos: TenGodCombo[] = [];
  const allTenGods = new Set<string>();

  result.pillars.forEach((p) => {
    allTenGods.add(p.tenGod);
    p.hiddenTenGods.forEach((h) => allTenGods.add(h));
  });

  const has = (name: string) => allTenGods.has(name);
  const findLocation = (names: string[]) => {
    const found: string[] = [];
    result.pillars.forEach((p) => {
      if (names.includes(p.tenGod)) found.push(p.label);
      p.hiddenTenGods.forEach((h) => { if (names.includes(h) && !found.includes(`${p.label}藏`)) found.push(`${p.label}藏`); });
    });
    return found.join("/");
  };

  // 食神制杀
  if (has("食神") && has("七杀")) {
    combos.push({
      name: "食神制杀",
      involved: "食神 + 七杀",
      location: findLocation(["食神", "七杀"]),
      meaning: "有能力用专业技能化解外部压力，适合走技术型或专业权威路线，不宜硬碰硬对抗。",
    });
  }

  // 伤官见官
  if (has("伤官") && has("正官")) {
    combos.push({
      name: "伤官见官",
      involved: "伤官 + 正官",
      location: findLocation(["伤官", "正官"]),
      meaning: "创新表达与规则秩序之间存在张力，需注意言行边界。适合需要突破但又不完全脱离体制的角色。",
    });
  }

  // 官杀混杂
  if (has("正官") && has("七杀")) {
    combos.push({
      name: "官杀混杂",
      involved: "正官 + 七杀",
      location: findLocation(["正官", "七杀"]),
      meaning: "同时面对规则压力和外部挑战，需要分清哪些是必须遵守的规则、哪些是可以主动应对的挑战。",
    });
  }

  // 财破印
  if ((has("正财") || has("偏财")) && (has("正印") || has("偏印"))) {
    combos.push({
      name: "财印相碍",
      involved: "财星 + 印星",
      location: findLocation(["正财", "偏财", "正印", "偏印"]),
      meaning: "现实利益与学习积累可能互相拉扯，需要明确阶段性重心——先积累还是先变现。",
    });
  }

  // 食伤生财
  if ((has("食神") || has("伤官")) && (has("正财") || has("偏财"))) {
    combos.push({
      name: "食伤生财",
      involved: "食伤 + 财星",
      location: findLocation(["食神", "伤官", "正财", "偏财"]),
      meaning: "表达能力和创造力可以直接转化为财务回报，适合内容创业、技术服务等以能力换收益的模式。",
    });
  }

  // 印星护身
  if (has("正印") || has("偏印")) {
    combos.push({
      name: "印星护身",
      involved: "印星",
      location: findLocation(["正印", "偏印"]),
      meaning: "有学习和贵人运作为后盾，遇到困难时优先寻求知识和长辈支持。",
    });
  }

  // 比劫林立（比肩/劫财出现3次以上）
  const biJieCount = Array.from(allTenGods).filter((t) => t === "比肩" || t === "劫财").length;
  const caiPresent = has("正财") || has("偏财");
  if (biJieCount >= 2 && caiPresent) {
    combos.push({
      name: "比劫争财",
      involved: "比劫 + 财星",
      location: findLocation(["比肩", "劫财", "正财", "偏财"]),
      meaning: "合作中需注意资源边界，收入和机会容易因竞争分流。建议合伙前明确权责和分配。",
    });
  }

  return combos;
}

/** Build personalized ten god frequency with meanings */
function buildTenGodFrequency(result: BaziResult) {
  const counts = new Map<string, number>();
  result.pillars.forEach((pillar) => {
    counts.set(pillar.tenGod, (counts.get(pillar.tenGod) ?? 0) + 1);
    pillar.hiddenTenGods.forEach((tenGod) => counts.set(tenGod, (counts.get(tenGod) ?? 0) + 1));
  });

  return Array.from(counts.entries())
    .map(([name, count]) => ({
      name,
      count,
      meaning: personalizeTenGodMeaning(name, result),
    }))
    .sort((a, b) => b.count - a.count);
}

/** Personalize ten god meaning based on chart context */
function personalizeTenGodMeaning(name: string, result: BaziResult): string {
  const base = TEN_GOD_MEANINGS[name] ?? "命盘中的辅助关系";

  // Contextualize based on position
  const dayPillar = result.pillars[2];
  const monthPillar = result.pillars[1];

  if (name === "日主") return `${result.dayMaster}日主，${result.strength}。${result.strength === "偏旺" ? "宜克泄耗" : result.strength === "偏弱" ? "宜生扶" : "宜平衡流通"}。`;

  if (dayPillar?.tenGod === name) return `${base}。出现在日柱，与自我核心紧密相关。`;
  if (monthPillar?.tenGod === name) return `${base}。出现在月柱，影响事业节奏和外部环境。`;

  return base;
}

/** Determine spouse star info */
function analyzeSpouseStar(result: BaziResult): RelationshipData["spouseStar"] {
  // For male: 正财/偏财 is spouse star; for female: 正官/七杀
  const isMale = result.gender === "male";
  const spouseTenGods = isMale ? ["正财", "偏财"] : ["正官", "七杀"];

  let foundPillar = result.pillars.find((p) => spouseTenGods.includes(p.tenGod));
  let foundHidden = false;

  if (!foundPillar) {
    foundPillar = result.pillars.find((p) => p.hiddenTenGods.some((h) => spouseTenGods.includes(h)));
    foundHidden = true;
  }

  if (foundPillar) {
    const tenGod = foundHidden
      ? foundPillar.hiddenTenGods.find((h) => spouseTenGods.includes(h)) ?? spouseTenGods[0]
      : foundPillar.tenGod;
    const location = foundHidden ? `${foundPillar.label}地支藏干` : `${foundPillar.label}天干`;
    const element = foundPillar.element;

    const locationNotes: Record<string, string> = {
      "年柱": "配偶可能来自较远环境，或年龄差距较大。",
      "月柱": "配偶可能通过工作或社交圈认识，背景相近。",
      "日柱": "配偶星在婚姻宫，配偶与自身关系紧密。",
      "时柱": "配偶缘较晚显现，或配偶年龄较小。",
    };
    const baseNote = locationNotes[foundPillar.label] ?? "";

    return {
      location: foundHidden ? `${foundPillar.label}（藏干）` : foundPillar.label,
      element,
      tenGod,
      analysis: `${tenGod}为配偶星，落于${location}，五行属${element}。${baseNote}`,
    };
  }

  return {
    location: "日支",
    element: result.pillars[2]?.element ?? "土",
    tenGod: spouseTenGods[0],
    analysis: "配偶星在原局不显，日支婚姻宫是判断配偶特征的主要依据。",
  };
}

/** Analyze marriage palace (day branch) */
function analyzeMarriagePalace(result: BaziResult): RelationshipData["marriagePalace"] {
  const dayPillar = result.pillars[2];
  if (!dayPillar) return { branch: "", element: "", analysis: "" };

  const branch = dayPillar.ganZhi[1] ?? "";
  const element = dayPillar.element;
  const dayStemEl = result.dayMaster;

  // Day stem element
  const stemElementMap: Record<string, string> = { "甲": "木", "乙": "木", "丙": "火", "丁": "火", "戊": "土", "己": "土", "庚": "金", "辛": "金", "壬": "水", "癸": "水" };
  const stemEl = stemElementMap[dayPillar.ganZhi[0]] ?? "土";

  const generationOrder = ["木", "火", "土", "金", "水"];
  const stemIdx = generationOrder.indexOf(stemEl);
  const branchIdx = generationOrder.indexOf(element);

  let relation = "";
  if (stemIdx === branchIdx) relation = "同气——婚姻宫与日主五行相同，配偶与自身气质相近，相处自然但需注意互补性不足。";
  else if ((stemIdx + 1) % 5 === branchIdx) relation = "日主生婚姻宫——你在关系中倾向付出和滋养对方，注意保持双向平衡。";
  else if ((branchIdx + 1) % 5 === stemIdx) relation = "婚姻宫生日主——配偶对你有关照和支持，是滋养型关系。";
  else if ((stemIdx + 2) % 5 === branchIdx || (branchIdx + 2) % 5 === stemIdx) relation = "相克——婚姻宫与日主五行相克，关系中存在天然张力，需要更多沟通和理解来平衡。";
  else relation = "一般——婚姻宫与日主关系中性，关系质量更多取决于后天经营。";

  return {
    branch,
    element,
    analysis: `日支${branch}为婚姻宫，五行属${element}，与日主${dayStemEl}的五行关系为：${relation}`,
  };
}

/** Build health-personality mapping from element distribution */
function buildHealthData(result: BaziResult): HealthData {
  const elementHealth = (Object.entries(result.elements) as [string, number][])
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => {
      const mapping = ELEMENT_HEALTH_MAP[name] ?? { tendency: "五行均衡，无明显偏向", advice: "保持现有生活节律" };
      const isExcess = name === result.dominantElement;
      const isDeficient = result.missingElements.includes(name as never);
      let tendency = mapping.tendency;
      if (isExcess) tendency = `【偏显】${tendency}`;
      if (isDeficient) tendency = `【不足】${tendency}`;
      return { element: name, tendency, advice: mapping.advice };
    });

  const personalityTags: string[] = [];
  const dominantTags = PERSONALITY_MAP[result.dominantElement] ?? [];
  personalityTags.push(...dominantTags);

  if (result.usefulElements.length > 0) {
    const usefulEl = result.usefulElements[0];
    const usefulTags = PERSONALITY_MAP[usefulEl] ?? [];
    personalityTags.push(...usefulTags.filter((t) => !personalityTags.includes(t)).slice(0, 2));
  }

  const lifestyleFlags: string[] = [
    `${result.dominantElement}气偏显，注意不要过度依赖单一优势，适当补充${result.missingElements.length > 0 ? result.missingElements.join("/") : "其他维度"}的体验。`,
    result.strength === "偏旺" ? "身旺宜适度消耗——运动、创作、社交都是好的出口。" : result.strength === "偏弱" ? "身弱宜先稳后进——充足的睡眠和稳定的节奏比冲刺更重要。" : "中和体质，保持现有节奏，注意季节性调整。",
    `参考调候为${result.usefulElements.join("、")}，在重要选择时优先考虑这些元素对应的方向和季节。`,
  ];

  return { elementHealth, personalityTags, lifestyleFlags };
}

/** Build luck cycle details from existing luck data */
function buildLuckData(result: BaziResult): LuckData {
  const current = result.luck.currentCycle;
  const currentIndex = current
    ? result.luck.cycles.findIndex((c) => c.ganZhi === current.ganZhi && c.startYear === current.startYear)
    : -1;
  const next = currentIndex >= 0 && currentIndex + 1 < result.luck.cycles.length
    ? result.luck.cycles[currentIndex + 1]
    : undefined;

  const buildDetail = (cycle: LuckCycle): LuckCycleDetail => {
    // Pick key years (every ~3 years or significant transitions)
    const keyYearIndices = [0, 2, 4, 6, 8].filter((i) => i < cycle.years.length);
    const keyYears = keyYearIndices.map((i) => {
      const y = cycle.years[i];
      return { year: y.year, age: y.age, ganZhi: y.ganZhi, hint: `${y.ganZhi}流年，重点观察冲合关系。` };
    });

    // Determine focus areas from theme keywords
    const focusAreas: string[] = [];
    const theme = cycle.theme;
    if (theme.includes("事业") || theme.includes("职业") || theme.includes("工作")) focusAreas.push("事业方向");
    if (theme.includes("财") || theme.includes("收入") || theme.includes("资源")) focusAreas.push("财务资源");
    if (theme.includes("感情") || theme.includes("婚姻") || theme.includes("关系")) focusAreas.push("人际关系");
    if (theme.includes("健康") || theme.includes("身体")) focusAreas.push("健康管理");
    if (theme.includes("学习") || theme.includes("贵人")) focusAreas.push("学习成长");
    if (focusAreas.length === 0) focusAreas.push("综合发展");

    return {
      ganZhi: cycle.ganZhi,
      startYear: cycle.startYear,
      endYear: cycle.endYear,
      startAge: cycle.startAge,
      endAge: cycle.endAge,
      theme: cycle.theme,
      focusAreas,
      keyYears,
    };
  };

  return {
    currentCycle: current ? buildDetail(current) : null,
    nextCycle: next ? buildDetail(next) : null,
    cycles: result.luck.cycles.map(buildDetail),
  };
}

/** Build dashboard from result */
function buildDashboard(result: BaziResult) {
  const current = result.luck.currentCycle;

  return {
    pillars: result.pillars.map((pillar) => ({
      label: pillar.label,
      ganZhi: pillar.ganZhi,
      tenGod: pillar.tenGod,
      hiddenTenGods: pillar.hiddenTenGods,
      nayin: pillar.nayin,
      element: pillar.element,
      xunKong: pillar.xunKong,
    })),
    elements: (Object.entries(result.elements) as [string, number][]).map(([name, value]) => ({
      name,
      value,
      role: elementRole(result, name),
    })),
    tenGods: buildTenGodFrequency(result),
    strengths: [
      `${result.dayMaster}日主${result.strength}，自我节奏和承载方式是判断核心。`,
      `${result.dominantElement}气较显，适合把优势转成稳定产出，而非单点猛冲。`,
      `参考调候为${result.usefulElements.join("、")}，用来平衡命盘偏性。`,
    ],
    risks: [
      result.missingElements.length > 0
        ? `${result.missingElements.join("、")}相对不足，相关事项宜主动补位。`
        : "五行缺口不明显，但仍需防止单一优势过度使用。",
      "事业财务不宜只看短期机会，应看长期资源是否能承接。",
      "关系和健康都怕长期失衡，节奏比一时判断更重要。",
    ],
  };
}

// ========== Main builder ==========

export function buildBaziDeepReport(
  result: BaziResult,
  options: {
    ownerEmail: string;
    source: DeepReportSource;
  },
): BaziDeepReport {
  const patternInfo = determinePattern(result);
  const tenGodCombos = identifyTenGodCombos(result);
  const tenGodFreq = buildTenGodFrequency(result);
  const spouseStar = analyzeSpouseStar(result);
  const marriagePalace = analyzeMarriagePalace(result);
  const healthData = buildHealthData(result);
  const luckData = buildLuckData(result);
  const missing = result.missingElements.length > 0 ? result.missingElements.join("、") : "无明显缺项";

  const dominantTenGod = tenGodFreq[0];
  const currentCycle = result.luck.currentCycle;

  return {
    id: makeId(result),
    type: "bazi",
    ownerEmail: options.ownerEmail,
    source: options.source,
    priceLabel: options.source === "free-credit" ? "首份免费" : "单次详批",
    generatedAt: new Date().toISOString(),
    headline: `${result.dayMaster}日主 · ${patternInfo.pattern} · ${result.strength}`,
    summary: `此详批依据四柱、十神、纳音、五行分布与大运流年综合推看。日主${result.dayMaster}，格局取${patternInfo.pattern}，五行缺口为${missing}，参考调候为${result.usefulElements.join("、")}。`,
    dashboard: buildDashboard(result),
    sections: [
      // Section 1: 命盘格局
      {
        kind: "structure",
        title: "命盘格局详解",
        summary: "判断日主强弱、格局类型、用神忌神与调候要素",
        body: `${result.professionalReport.structure} 胎元${result.taiYuan}、命宫${result.mingGong}、身宫${result.shenGong}为命盘的三层补充信息。胎元代表先天禀赋和潜在倾向，命宫关联人生舞台和外在机缘，身宫反映后天自我调整的能力和方向。`,
        highlights: [`格局：${patternInfo.pattern}`, `日主：${result.dayMaster}`, `强弱：${result.strength}`, `调候：${result.usefulElements.join("、")}`],
        data: {
          pattern: patternInfo.pattern,
          patternBasis: patternInfo.basis,
          strengthLevel: result.strength,
          strengthBasis: `日主${result.dayMaster}，生于${result.pillars[1]?.ganZhi ?? ""}月（${result.solarTerm}），综合月令、通根、生扶克制判断为${result.strength}。`,
          usefulGods: result.usefulElements.map((el) => `${el}（调候/平衡）`),
          tabooGods: result.missingElements.length > 0
            ? result.missingElements.map((el) => `${el}（不足需补）`)
            : ["无明显忌神，注意五行流通"],
          tiaoHou: result.usefulElements,
          palaces: {
            taiYuan: { ganZhi: result.taiYuan, note: "先天禀赋——代表与生俱来的倾向和潜在优势方向。" },
            mingGong: { ganZhi: result.mingGong, note: "命宫——关联人生舞台、外在机缘和事业发展的大环境。" },
            shenGong: { ganZhi: result.shenGong, note: "身宫——反映后天自我调整能力和行为方式的弹性空间。" },
          },
        },
      },

      // Section 2: 十神组合
      {
        kind: "tenGod",
        title: "十神组合分析",
        summary: "天干透出、地支藏干与十神之间的生克制化关系",
        body: `四柱天干十神：${result.pillars.map((p) => `${p.label}${p.tenGod}`).join("、")}。地支藏干：${result.pillars.map((p) => `${p.label}藏${p.hiddenTenGods.join("/")}`).join("；")}。${dominantTenGod ? `最频繁出现的十神是${dominantTenGod.name}（×${dominantTenGod.count}），在判断中占较大权重。` : ""}`,
        highlights: result.pillars.map((p) => `${p.label}：${p.tenGod}`),
        data: {
          pillarBreakdown: result.pillars.map((p) => ({
            label: p.label,
            stemTenGod: p.tenGod,
            branchTenGods: p.hiddenTenGods,
          })),
          frequency: tenGodFreq,
          combos: tenGodCombos,
        },
      },

      // Section 3: 事业财运
      {
        kind: "careerWealth",
        title: "事业与财运",
        summary: "适合的行业方向、财富获取方式与职业节奏建议",
        body: `${result.professionalReport.career} ${result.professionalReport.wealth} 在职业选择上，优先考虑能让${result.dominantElement}气稳定发挥的行业环境；财务上适合重视现金流、长期复利和风险边界，避免短期冲动透支长期积累。`,
        highlights: ["行业方向", "财富模式", "风险边界"],
        data: {
          industries: [
            ...(INDUSTRY_MAP[result.dominantElement] ?? []).slice(0, 3),
            ...(result.usefulElements.flatMap((el) => INDUSTRY_MAP[el] ?? []).filter((ind) => !(INDUSTRY_MAP[result.dominantElement] ?? []).includes(ind))).slice(0, 2),
          ],
          wealthType: (() => {
            const freq = tenGodFreq;
            const zhengCai = freq.find((f) => f.name === "正财");
            const pianCai = freq.find((f) => f.name === "偏财");
            if (zhengCai && pianCai) return "正财偏财并存，适合主业+副业的双轨模式，以正财保底、偏财拓展。";
            if (zhengCai) return "正财为主，稳定收入和长期积累是财务主线，适合薪资、专业服务等可预期收入。";
            if (pianCai) return "偏财为主，机会型收入占比大，适合市场开拓、投资等弹性收益模式。";
            return "财星不显，财运更多取决于后天经营和大运配合，建议先稳后扩。";
          })(),
          careerRhythm: result.strength === "偏旺"
            ? "身旺能扛事，适合节奏紧凑、需要持续输出的职业环境。但注意不要只冲不蓄，定期复盘和调整方向。"
            : result.strength === "偏弱"
              ? "身弱宜稳，适合节奏可控、有明确边界的职业环境。先建立专业壁垒，再逐步扩大影响力。"
              : "中和体质，职业节奏弹性大，能适应多种环境。关键在于选择适合自身五行偏好的方向。",
          riskBoundary: result.missingElements.length > 0
            ? `${result.missingElements.join("、")}相关领域是天然短板，重大决策时建议咨询对应领域的专业人士作为补充。`
            : "五行相对均衡，无明显短板领域，但仍需注意不在单一维度过度投入。",
        },
      },

      // Section 4: 感情婚姻
      {
        kind: "relationship",
        title: "感情与婚姻",
        summary: "配偶星定位、婚姻宫分析与感情经营方向",
        body: `${result.professionalReport.relationship} 关系经营不宜只靠情绪热度，宜看双方节奏、责任承担与沟通方式是否能互相补位。遇到分歧时，先谈现实安排，再谈立场输赢。`,
        highlights: [spouseStar.location, spouseStar.element, spouseStar.tenGod],
        data: {
          spouseStar,
          marriagePalace,
          signals: (() => {
            const sigs: string[] = [];
            const allTenGods = result.pillars.flatMap((p) => [p.tenGod, ...p.hiddenTenGods]);
            if (allTenGods.some((t) => t === "桃花")) sigs.push("命带桃花，感情机缘较多，需分辨短期吸引与长期适合。");
            if (spouseStar.location.includes("藏干")) sigs.push("配偶星藏于地支，感情倾向内敛，不轻易表露但一旦认定较为稳定。");
            if (spouseStar.location === "日柱") sigs.push("配偶星在婚姻宫，配偶与自身关联紧密，婚姻在人生中占重要位置。");
            if (result.missingElements.includes(spouseStar.element as never)) sigs.push(`配偶星五行${spouseStar.element}在盘中不足，可能需要主动创造相遇和相处的机会。`);
            return sigs.length > 0 ? sigs : ["感情信号以日支婚姻宫为主，建议关注大运流年中配偶星透出的时段。"];
          })(),
        },
      },

      // Section 5: 健康性格
      {
        kind: "health",
        title: "健康与性格倾向",
        summary: "从五行偏性看压力方式和生活习惯，不做医学诊断",
        body: `${result.professionalReport.health} 本段只作生活方式提醒，不构成医学诊断。建议关注睡眠、饮食节律、长期压力释放，以及与${result.dominantElement}气偏显相关的习惯性消耗。`,
        highlights: healthData.personalityTags.slice(0, 4),
        data: healthData,
      },

      // Section 6: 大运流年
      {
        kind: "luck",
        title: "大运流年详解",
        summary: "当前阶段主题、下步转向与每步十年的用力方向",
        body: (() => {
          const next = luckData.nextCycle;
          const earlyCycles = luckData.cycles.slice(0, 3).map((c) => `${c.ganZhi}（${c.startYear}-${c.endYear}）：${c.theme}`).join("；");
          const laterCycles = luckData.cycles.slice(3).map((c) => `${c.ganZhi}（${c.startYear}-${c.endYear}）`).join("、");
          return `${result.luck.startText} ${currentCycle ? `当前大运${currentCycle.ganZhi}：${currentCycle.theme}。这一阶段不宜只看年份吉凶，更要看资源、责任和节奏是否能接住。` : `当前尚未进入正式大运阶段，起运前先看原局稳定度。`}${next ? ` 下一步${next.ganZhi}大运转向：${next.theme}，建议提前观察人际、事业和生活重心是否开始变化。` : ""} 前三步大运脉络：${earlyCycles}。后续依次进入${laterCycles}。`;
        })(),
        highlights: luckData.cycles.slice(0, 4).map((c) => `${c.ganZhi}：${c.startYear}-${c.endYear}`),
        data: luckData,
      },

      // Section 7: 综合总结
      {
        kind: "conclusion",
        title: "综合总结",
        summary: "核心发现回顾与近期、长期的行动方向",
        body: "",
        highlights: [],
        data: {
          coreFindings: [
            `格局为${patternInfo.pattern}，日主${result.dayMaster}${result.strength}，以${result.dominantElement}气为行事主导。`,
            `用神取${result.usefulElements.join("、")}，忌神在${result.missingElements.length > 0 ? result.missingElements.join("、") + "之不足" : "五行流通之阻塞"}。`,
            currentCycle
              ? `当前${currentCycle.ganZhi}大运（${currentCycle.startYear}-${currentCycle.endYear}）阶段主题为：${currentCycle.theme}`
              : "当前尚未进入正式大运阶段，先以原局基础为判断依据。",
            tenGodCombos.length > 0
              ? `十神关键组合：${tenGodCombos.map((c) => c.name).join("、")}，这些组合是判断行事风格和潜在张力的核心线索。`
              : "十神组合以单一十神为主，判断重点在主导十神和五行流通。",
          ],
          nearTerm: [
            `优先采用${result.usefulElements.join("、")}相关的方向和节奏，先补短板再扩大投入。`,
            "重要决定避开情绪高峰，至少做一次现实成本核算。",
            currentCycle
              ? `当前${currentCycle.ganZhi}大运内，重点关注：${currentCycle.theme}`
              : "起运前先稳基础，不急于频繁变动。",
          ],
          longTerm: [
            "事业和财务以可持续为先，避免短期冲动透支长期资源。",
            "关系中把责任、边界和期待讲清楚，比反复试探更有效。",
            "把作息、饮食和压力释放作为长期调运的一部分，健康是最基础的运势。",
            `长期来看，${result.dominantElement}的偏显优势需要${result.missingElements.length > 0 ? result.missingElements.join("、") + "的补位" : "其他维度的平衡"}才能持续发挥。`,
          ],
        },
      },
    ],
  };
}
