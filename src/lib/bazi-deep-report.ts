import type { BaziResult, LuckCycle } from "@/lib/types";

export type DeepReportSource = "free-credit" | "paid" | "subscription";

export type BaziDeepReport = {
  id: string;
  type: "bazi";
  ownerEmail: string;
  source: DeepReportSource;
  priceLabel: string;
  generatedAt: string;
  headline: string;
  summary: string;
  keyFindings: string[];
  dashboard: {
    pillars: {
      label: string;
      ganZhi: string;
      tenGod: string;
      hiddenTenGods: string[];
      nayin: string;
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
    currentLuck?: {
      ganZhi: string;
      years: string;
      ages: string;
      theme: string;
    };
  };
  deliverables: {
    label: string;
    value: string;
    note: string;
  }[];
  sections: {
    title: string;
    summary: string;
    body: string;
    highlights: string[];
  }[];
  actionPlan: {
    title: string;
    items: string[];
  }[];
  luckTimeline: (Pick<LuckCycle, "ganZhi" | "startYear" | "endYear" | "startAge" | "endAge" | "theme"> & {
    years: {
      year: number;
      age: number;
      ganZhi: string;
    }[];
  })[];
};

function makeId(result: BaziResult) {
  return `bazi-${result.birthDate}-${result.birthHour}-${Date.now()}`;
}

function cycleLine(cycle: LuckCycle) {
  return `${cycle.ganZhi}大运（${cycle.startYear}-${cycle.endYear}，${cycle.startAge}-${cycle.endAge}岁）：${cycle.theme}`;
}

function nextCycleAfterCurrent(result: BaziResult) {
  const current = result.luck.currentCycle;
  if (!current) return result.luck.cycles[0];
  const index = result.luck.cycles.findIndex((cycle) => cycle.ganZhi === current.ganZhi && cycle.startYear === current.startYear);
  return index >= 0 ? result.luck.cycles[index + 1] : undefined;
}

const tenGodMeanings: Record<string, string> = {
  比肩: "自我、同辈、执行与竞争",
  劫财: "行动、资源争夺、合作边界",
  食神: "表达、作品、稳定输出",
  伤官: "突破、表达锋芒、规则张力",
  正财: "稳定收入、现实经营",
  偏财: "机会财、资源调度、外部市场",
  正官: "规则、职位、责任与秩序",
  七杀: "压力、挑战、决断与风险",
  正印: "学习、保护、贵人与资源",
  偏印: "洞察、非典型资源、独立思考",
  日主: "自我核心与判断基准",
};

function buildTenGodDistribution(result: BaziResult) {
  const counts = new Map<string, number>();
  result.pillars.forEach((pillar) => {
    counts.set(pillar.tenGod, (counts.get(pillar.tenGod) ?? 0) + 1);
    pillar.hiddenTenGods.forEach((tenGod) => counts.set(tenGod, (counts.get(tenGod) ?? 0) + 1));
  });

  return Array.from(counts.entries())
    .map(([name, count]) => ({
      name,
      count,
      meaning: tenGodMeanings[name] ?? "命盘中的辅助关系",
    }))
    .sort((a, b) => b.count - a.count);
}

function elementRole(result: BaziResult, name: string) {
  if (name === result.dominantElement) return "偏显";
  if (result.missingElements.includes(name as never)) return "不足";
  if (result.usefulElements.includes(name as never)) return "可用";
  return "平衡";
}

function buildDashboard(result: BaziResult) {
  const current = result.luck.currentCycle;

  return {
    pillars: result.pillars.map((pillar) => ({
      label: pillar.label,
      ganZhi: pillar.ganZhi,
      tenGod: pillar.tenGod,
      hiddenTenGods: pillar.hiddenTenGods,
      nayin: pillar.nayin,
      xunKong: pillar.xunKong,
    })),
    elements: Object.entries(result.elements).map(([name, value]) => ({
      name,
      value,
      role: elementRole(result, name),
    })),
    tenGods: buildTenGodDistribution(result),
    strengths: [
      `${result.dayMaster}日主${result.strength}，自我节奏和承载方式是判断核心。`,
      `${result.dominantElement}气较显，适合把优势转成稳定产出，而不是单点猛冲。`,
      `参考调候为${result.usefulElements.join("、")}，用来平衡命盘偏性。`,
    ],
    risks: [
      result.missingElements.length > 0 ? `${result.missingElements.join("、")}相对不足，相关事项宜主动补位。` : "五行缺口不明显，但仍需防止单一优势过度使用。",
      "事业财务不宜只看短期机会，应看长期资源是否能承接。",
      "关系和健康都怕长期失衡，节奏比一时判断更重要。",
    ],
    currentLuck: current
      ? {
          ganZhi: current.ganZhi,
          years: `${current.startYear}-${current.endYear}`,
          ages: `${current.startAge}-${current.endAge}岁`,
          theme: current.theme,
        }
      : undefined,
  };
}

export function buildBaziDeepReport(
  result: BaziResult,
  options: {
    ownerEmail: string;
    source: DeepReportSource;
  },
): BaziDeepReport {
  const currentCycle = result.luck.currentCycle;
  const currentText = currentCycle ? cycleLine(currentCycle) : "当前尚未进入正式大运阶段，以起运前基础节律为主。";
  const missing = result.missingElements.length > 0 ? result.missingElements.join("、") : "无明显缺项";

  return {
    id: makeId(result),
    type: "bazi",
    ownerEmail: options.ownerEmail,
    source: options.source,
    priceLabel: options.source === "free-credit" ? "首份免费" : "¥8.8 单次详批",
    generatedAt: new Date().toISOString(),
    headline: `${result.dayMaster}日主 · ${result.strength} · ${result.dominantElement}气较显`,
    summary: `此详批依据四柱、十神、纳音、五行分布与大运流年综合推看。当前命盘日主为${result.dayMaster}，五行缺口为${missing}，参考调候为${result.usefulElements.join("、")}。`,
    keyFindings: [
      `${result.dayMaster}日主整体呈${result.strength}，判断重点在月令和通根，而不是单看缺什么五行。`,
      `五行以${result.dominantElement}气最显，参考调候优先看${result.usefulElements.join("、")}。`,
      currentCycle ? `当前处于${currentCycle.ganZhi}大运，阶段主题是：${currentCycle.theme}` : "当前尚未进入正式大运阶段，先以基础节律为主。",
      "本次详批会把格局、十神、事业财运、关系、健康与大运流年分开说明，便于保存后反复查看。",
    ],
    dashboard: buildDashboard(result),
    deliverables: [
      { label: "详批项目", value: "6", note: "格局、十神、事业、财运、感情、健康、大运" },
      { label: "大运阶段", value: String(result.luck.cycles.length), note: "覆盖每步十年主题" },
      { label: "流年线索", value: String(result.luck.cycles.reduce((sum, cycle) => sum + cycle.years.length, 0)), note: "按阶段保留年份干支" },
      { label: "可保存", value: "永久", note: "登录账户后保存到我的报告" },
    ],
    sections: [
      {
        title: "命盘格局详解",
        summary: "判断日主强弱、五行偏性、胎元命宫身宫对整体气势的补充。",
        body: `${result.professionalReport.structure} 结合胎元${result.taiYuan}、命宫${result.mingGong}、身宫${result.shenGong}，此盘不宜只看单一五行强弱，应重点看月令、透干与地支藏干之间是否形成连续支持。`,
        highlights: [`日主：${result.dayMaster}`, `强弱：${result.strength}`, `调候：${result.usefulElements.join("、")}`],
      },
      {
        title: "十神组合分析",
        summary: "拆解天干透出的十神和地支藏干，观察表达、责任、资源、财务与关系模式。",
        body: `四柱天干十神分别为${result.pillars.map((pillar) => `${pillar.label}${pillar.tenGod}`).join("、")}。地支藏干十神则呈现${result.pillars.map((pillar) => `${pillar.label}藏${pillar.hiddenTenGods.join("/")}`).join("；")}。十神组合用于观察表达、资源、责任、财务和关系模式。`,
        highlights: result.pillars.map((pillar) => `${pillar.label}：${pillar.tenGod}`),
      },
      {
        title: "事业与财运",
        summary: "把事业模式、赚钱方式、资源调度和风险边界放在一起看。",
        body: `${result.professionalReport.career} ${result.professionalReport.wealth} 在职业选择上，优先考虑能让优势五行稳定发挥的环境；财务上适合重视现金流、长期复利和风险边界。`,
        highlights: ["职业节奏", "财务边界", "合作模式"],
      },
      {
        title: "感情与婚姻",
        summary: "结合日支、五行互动和沟通方式，给关系经营建议。",
        body: `${result.professionalReport.relationship} 关系经营不宜只靠情绪热度，宜看双方节奏、责任承担与沟通方式是否能互相补位。遇到分歧时，先谈现实安排，再谈立场输赢。`,
        highlights: ["关系节奏", "沟通方式", "责任分工"],
      },
      {
        title: "健康与性格倾向",
        summary: "从五行偏性看压力方式和生活习惯，不做医学诊断。",
        body: `${result.professionalReport.health} 本段只作生活方式提醒，不构成医学诊断。建议关注睡眠、饮食节律、长期压力释放，以及与${result.dominantElement}气偏显相关的习惯性消耗。`,
        highlights: ["作息", "压力释放", "长期习惯"],
      },
      {
        title: "大运流年详解",
        summary: "重点看当前十年的主题、下一阶段的转向，以及每一步大运该怎么取舍。",
        body: (() => {
          const next = nextCycleAfterCurrent(result);
          const earlyCycles = result.luck.cycles.slice(0, 3).map(cycleLine).join("；");
          const laterCycles = result.luck.cycles.slice(3).map((cycle) => `${cycle.ganZhi}（${cycle.startYear}-${cycle.endYear}）`).join("、");
          return `${result.luck.startText} ${currentCycle ? `当前大运重点看${currentCycle.ganZhi}：${currentCycle.theme}。这一阶段不宜只看年份吉凶，更要看资源、责任和节奏是否能接住。` : `${currentText} 起运前先看原局稳定度，不急于用单一年份下判断。`}${next ? ` 下一步${next.ganZhi}大运会转向：${next.theme}，适合提前观察人际、事业位置和生活重心是否开始变化。` : ""} 前三步大运脉络为：${earlyCycles}。后续阶段依次进入${laterCycles}。具体流年仍需结合当年干支与原局冲合刑害，本次先把十年阶段的用力方向讲清楚。`;
        })(),
        highlights: result.luck.cycles.slice(0, 4).map((cycle) => `${cycle.ganZhi}：${cycle.startYear}-${cycle.endYear}`),
      },
    ],
    actionPlan: [
      {
        title: "近期用事",
        items: [
          `优先采用${result.usefulElements.join("、")}相关的节奏：先补短板，再扩大投入。`,
          "重要决定建议避开情绪高峰，至少做一次现实成本核算。",
          currentCycle ? `当前${currentCycle.ganZhi}大运内，重点关注：${currentCycle.theme}` : "起运前先稳基础，不急于频繁变动。",
        ],
      },
      {
        title: "长期经营",
        items: [
          "事业和财务以可持续为先，避免短期冲动透支长期资源。",
          "关系中把责任、边界和期待讲清楚，比反复试探更有效。",
          "把作息、饮食和压力释放作为长期调运的一部分。",
        ],
      },
    ],
    luckTimeline: result.luck.cycles.map((cycle) => ({
      ganZhi: cycle.ganZhi,
      startYear: cycle.startYear,
      endYear: cycle.endYear,
      startAge: cycle.startAge,
      endAge: cycle.endAge,
      theme: cycle.theme,
      years: cycle.years,
    })),
  };
}
