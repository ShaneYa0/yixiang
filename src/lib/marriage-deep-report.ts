import type { MarriageResult, SingleMarriageResult } from "@/lib/marriage";
import type { BaziResult } from "@/lib/types";
import { calculateBazi } from "@/lib/bazi";
import { computeShenSha, shenShaSummary, getChangShengStage, type ShenShaItem } from "@/lib/shensha";

// ========== Types ==========

export type DeepReportSection = {
  title: string;
  subtitle?: string;
  body: string;
  highlights: string[];
  data?: Record<string, unknown>;
};

export type MarriageDeepReport = {
  id: string;
  mode: "solo" | "pair";
  headline: string;
  summary: string;
  createdAt: string;
  baziOverview?: {
    pillars: { label: string; ganZhi: string; nayin: string; tenGod: string; hiddenTenGods: string[]; element: string; xunKong: string }[];
    dayMaster: string;
    dominantElement: string;
    zodiac: string;
    elements: Record<string, number>;
    strength: string;
    shenGong: string;
    mingGong: string;
  };
  sections: DeepReportSection[];
};

let counter = 0;
function nextId(prefix: string) { counter += 1; return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}_${counter}`; }

const LABELS = ["年柱", "月柱", "日柱", "时柱"];

// ========== 基础元素信息 ==========

const STEM_ELEMENT: Record<string, string> = {
  "甲": "木", "乙": "木", "丙": "火", "丁": "火", "戊": "土", "己": "土", "庚": "金", "辛": "金", "壬": "水", "癸": "水",
};
const BRANCH_MAIN_ELEMENT: Record<string, string> = {
  "子": "水", "丑": "土", "寅": "木", "卯": "木", "辰": "土", "巳": "火", "午": "火", "未": "土", "申": "金", "酉": "金", "戌": "土", "亥": "水",
};
const GENERATING_ELEMENT: Record<string, string> = { "木": "火", "火": "土", "土": "金", "金": "水", "水": "木" };
const CONTROLLING_ELEMENT: Record<string, string> = { "木": "土", "火": "金", "土": "水", "金": "木", "水": "火" };

function describeElementRelation(from: string, to: string): string {
  if (from === to) return "同气";
  if (GENERATING_ELEMENT[from] === to) return "生扶";
  if (GENERATING_ELEMENT[to] === from) return "受生";
  if (CONTROLLING_ELEMENT[from] === to) return "相克";
  if (CONTROLLING_ELEMENT[to] === from) return "受克";
  return "无直接生克";
}

// ========== 合冲刑害系统 ==========

const LIU_HE: Record<string, string> = {
  "子": "丑", "丑": "子", "寅": "亥", "亥": "寅", "卯": "戌", "戌": "卯", "辰": "酉", "酉": "辰", "巳": "申", "申": "巳", "午": "未", "未": "午",
};
const LIU_CHONG: Record<string, string> = {
  "子": "午", "午": "子", "丑": "未", "未": "丑", "寅": "申", "申": "寅", "卯": "酉", "酉": "卯", "辰": "戌", "戌": "辰", "巳": "亥", "亥": "巳",
};
const LIU_HAI: Record<string, string> = {
  "子": "未", "未": "子", "丑": "午", "午": "丑", "寅": "巳", "巳": "寅", "卯": "辰", "辰": "卯", "申": "亥", "亥": "申", "酉": "戌", "戌": "酉",
};
const SAN_HE: Record<string, string[]> = {
  "申": ["子", "辰"], "子": ["申", "辰"], "辰": ["申", "子"],
  "亥": ["卯", "未"], "卯": ["亥", "未"], "未": ["亥", "卯"],
  "寅": ["午", "戌"], "午": ["寅", "戌"], "戌": ["寅", "午"],
  "巳": ["酉", "丑"], "酉": ["巳", "丑"], "丑": ["巳", "酉"],
};
const BAN_HE: Record<string, string> = {
  "申": "子", "子": "辰", "辰": "申",
  "亥": "卯", "卯": "未", "未": "亥",
  "寅": "午", "午": "戌", "戌": "寅",
  "巳": "酉", "酉": "丑", "丑": "巳",
};

interface InteractionResult {
  type: "合" | "冲" | "害" | "三合" | "半合" | "刑";
  target: string;
  description: string;
}

function analyzeDayBranchInteractions(dayBranch: string, otherBranches: { label: string; branch: string }[]): InteractionResult[] {
  const results: InteractionResult[] = [];

  for (const { label, branch } of otherBranches) {
    // 六合
    if (LIU_HE[dayBranch] === branch) {
      results.push({ type: "合", target: label, description: `日支${dayBranch}与${label}地支${branch}六合。合则稳定、亲近，${label === "月柱" ? "外部环境与婚姻宫和谐，家庭关系融洽，婚姻受外界认可和支持" : label === "时柱" ? "婚姻后期走向稳定，晚年夫妻关系和睦" : "家庭背景与婚姻互相融合，长辈关系良好"}。` });
    }
    // 六冲
    if (LIU_CHONG[dayBranch] === branch) {
      results.push({ type: "冲", target: label, description: `日支${dayBranch}与${label}地支${branch}六冲。${label === "月柱" ? "月支冲日支是婚姻中最需关注的信号——外部环境（工作、家庭、社会压力）对婚姻造成直接的冲击和变动。月日冲不代表婚姻不好，但意味着感情生活中会有更多'外力'干扰，需要双方有更强的定力。" : label === "时柱" ? "时支冲日支，婚姻后期容易出现变动或重新定义——子女问题、生活方向的分歧可能在晚年浮现。提前沟通长期规划可以降低冲击。" : "年支冲日支，家庭背景与婚姻之间存在天然张力。可能在择偶时遭遇家庭阻力，或婚后与长辈关系需要更多调适。"}` });
    }
    // 六害
    if (LIU_HAI[dayBranch] === branch) {
      results.push({ type: "害", target: label, description: `日支${dayBranch}与${label}地支${branch}六害。害比冲更隐蔽，不是剧烈的冲突而是慢性的不协调——${label === "月柱" ? "外界对婚姻的干扰是潜移默化的，可能表现为周围人的闲言碎语或无形的社会压力" : label === "时柱" ? "后期感情中可能存在隐性的不满足感，建议定期开诚布公地沟通" : "家庭与婚姻之间存在不容易言明的不协调，需要双方有意识地建立边界"}。害的影响可以通过主动沟通来化解。` });
    }
    // 三合
    const sanHePartners = SAN_HE[dayBranch];
    if (sanHePartners?.includes(branch) && !results.some((r) => r.target === label)) {
      results.push({ type: "三合", target: label, description: `日支${dayBranch}与${label}地支${branch}成三合局（需三支齐全方成局，缺一方则为半合）。三合局是强大的合力，代表${label === "月柱" ? "外部环境与婚姻形成良性合力，婚姻在社会和家庭层面获得强大支持" : label === "时柱" ? "婚姻后期有强劲的稳定力量，晚年夫妻同心" : "家庭背景对婚姻产生正面且持续的影响"}。` });
    }
    // 半合
    if (BAN_HE[dayBranch] === branch && !results.some((r) => r.target === label && (r.type === "三合" || r.type === "半合"))) {
      results.push({ type: "半合", target: label, description: `日支${dayBranch}与${label}地支${branch}半合，有一定合力但不完整。${label === "月柱" ? "外部环境对婚姻有正面影响但不够强烈，需要主动利用有利的外部因素" : label === "时柱" ? "婚姻后期有一定的和谐基础，但需要双方共同维护" : "家庭与婚姻之间存在一定亲和力但不够紧密"}。` });
    }
  }

  return results;
}

function analyzeDayStemInteractions(dayStem: string, otherStems: { label: string; stem: string }[]): InteractionResult[] {
  const results: InteractionResult[] = [];
  const TIAN_GAN_HE: Record<string, string> = {
    "甲": "己", "己": "甲", "乙": "庚", "庚": "乙", "丙": "辛", "辛": "丙",
    "丁": "壬", "壬": "丁", "戊": "癸", "癸": "戊",
  };

  for (const { label, stem } of otherStems) {
    if (TIAN_GAN_HE[dayStem] === stem) {
      results.push({
        type: "合",
        target: label,
        description: `日干${dayStem}与${label}天干${stem}天干五合。${label === "月柱" ? "日主合月干是重要的姻缘信号——你与外部环境（尤其是事业和社交圈）存在天然的亲和力，容易在工作和社交场合中遇到对的人。但合也意味着被牵制——在感情中需注意保持独立判断。" : label === "年柱" ? "日主合年干，长辈介绍的对象或家庭安排的相亲成功率较高，你的感情容易受到家庭和长辈的影响。" : "日主合时干，对感情的长期承诺认真，一旦确立关系就会全心投入。"}`,
      });
    }
  }

  return results;
}

// ========== 十神格局分析 ==========

function analyzeTenGodPattern(pillars: { ganZhi: string; tenGod: string; hiddenTenGods: string[]; label: string }[], dayStem: string, gender: string): string[] {
  const parts: string[] = [];
  const allTenGods = pillars.flatMap((p) => [p.tenGod, ...p.hiddenTenGods]);

  // 配偶星类型
  const spouseStars = gender === "male" ? ["正财", "偏财"] : ["正官", "七杀"];

  // 官杀混杂
  if (gender === "female") {
    const hasZhengGuan = allTenGods.includes("正官");
    const hasQiSha = allTenGods.includes("七杀");
    if (hasZhengGuan && hasQiSha) {
      parts.push("命局官杀混杂（正官与七杀并存），在感情中容易面临'稳定型'和'激情型'两种选择。传统命理视官杀混杂为女命感情波折的信号，但现代视角下这更多意味着你在不同人生阶段会遇到不同类型的伴侣——关键在于你如何辨别和选择。");
    }
  }
  if (gender === "male") {
    const hasZhengCai = allTenGods.includes("正财");
    const hasPianCai = allTenGods.includes("偏财");
    if (hasZhengCai && hasPianCai) {
      parts.push("命局正偏财混杂，感情中容易同时面对'稳定伴侣'和'心动对象'两种类型。传统视角下此为桃花偏重的信号，核心课题是学会在合适的时间做出明确的选择。");
    }
  }

  // 配偶星是否得令（月支生扶）
  const monthPillar = pillars[1];
  const monthBranch = monthPillar.ganZhi[1];
  const monthMainElement = BRANCH_MAIN_ELEMENT[monthBranch] ?? "土";

  const spouseStarHits = pillars.filter((p) => spouseStars.includes(p.tenGod));
  if (spouseStarHits.length > 0) {
    const spouseElement = STEM_ELEMENT[spouseStarHits[0].ganZhi[0]] ?? "土";
    const GENERATING: Record<string, string> = { "木": "火", "火": "土", "土": "金", "金": "水", "水": "木" };
    if (GENERATING[monthMainElement] === spouseElement) {
      parts.push(`配偶星得月令生扶（月令${monthMainElement}生配偶星${spouseElement}），配偶星有根有气，力量充沛。这意味着你在适婚年龄遇到的伴侣素质较高，缘分落地后对方能成为你生活中的有力支持。`);
    }
    const CONTROLLING: Record<string, string> = { "木": "土", "火": "金", "土": "水", "金": "木", "水": "火" };
    if (CONTROLLING[monthMainElement] === spouseElement) {
      parts.push(`配偶星被月令克制（月令${monthMainElement}克配偶星${spouseElement}），配偶星力量偏弱。传统视角下这意味着缘分落地需要更多时间和耐心，伴侣可能在事业或健康层面需要你的支持。但被克制的配偶星一旦遇到大运生扶，反而会产生更强的反弹效应——后期的缘分质量可能超出早期预期。`);
    }
  }

  // 日支十神分析
  const dayPillar = pillars[2];
  const dayBranchTenGods = dayPillar.hiddenTenGods;
  if (dayBranchTenGods.some((t) => spouseStars.includes(t))) {
    parts.push(`婚姻宫（日支${dayPillar.ganZhi[1]}）藏干中含配偶星${dayBranchTenGods.filter((t) => spouseStars.includes(t)).join("、")}，配偶星入婚姻宫是姻缘结构稳固的重要标志。你的伴侣和你的婚姻关系本身存在天然的契合——这不是'找对人'的运气，而是命盘结构决定的缘分基础。`);
  }

  // 比劫夺财/争官
  const bijie = ["比肩", "劫财"];
  const bijieInPillars = pillars.filter((p) => bijie.includes(p.tenGod));
  if (bijieInPillars.length >= 2 && spouseStars.some((s) => pillars.some((p) => p.tenGod === s))) {
    parts.push(`命局比劫较旺（${bijieInPillars.map((p) => `${p.label}${p.tenGod}`).join("、")}），且配偶星同时存在——传统视角下这称为'比劫争夫/争妻'，意味着感情中可能存在竞争（他人介入或自己内心犹豫）。但现代视角下这更指向：你需要足够自信、独立，且需要一个同样独立强大的伴侣来匹配你的能量。`);
  }

  // 食伤
  const shiShang = ["食神", "伤官"];
  const shiShangHits = pillars.filter((p) => shiShang.includes(p.tenGod));
  if (shiShangHits.length >= 2 && gender === "female") {
    parts.push(`命局食伤较旺（${shiShangHits.map((p) => `${p.label}${p.tenGod}`).join("、")}），食伤克制官星（配偶星）。传统视角下女命食伤旺可能对配偶要求较高或言辞犀利。但现代视角下，食伤代表才华和独立思考——你的高标准不是缺陷，而是你值得一个真正匹配你的人。核心课题在于表达方式而非标准本身。`);
  }

  if (parts.length === 0) {
    parts.push("十神格局整体平衡，无明显偏颇或混杂。感情模式以稳定为主，没有显著的格局层面的课题需要特别关注。这是一个良好的基础，意味着你的感情走向更多取决于个人选择而非命理结构层面的限制。");
  }

  return parts;
}

// ========== 配偶画像推导 ==========

function deriveSpousePortrait(
  spouseStars: string[],
  spouseHits: { label: string; ganZhi: string; tenGod: string }[],
  dayStem: string,
  dayBranch: string,
  dominantElement: string,
): string {
  const parts: string[] = [];
  const spouseElements = spouseHits.map((h) => STEM_ELEMENT[h.ganZhi[0]] ?? "土");
  const uniqueElements = [...new Set(spouseElements)];

  if (uniqueElements.length > 0) {
    parts.push(`配偶星落于${uniqueElements.join("、")}五行。此处五行只用于标记配偶星在命局中的属性与生克关系，不能据此确定伴侣的性格、职业、外貌或出生五行。`);
  }

  const positions = spouseHits.map((h) => h.label);
  if (positions.length > 0) {
    parts.push(`配偶星见于${[...new Set(positions)].join("、")}。传统上，年柱偏早年与外部环境，月柱偏现实环境，日柱与婚姻宫最直接，时柱偏后期走向；柱位仅说明观察层面，不足以单独判断相识渠道或婚期。`);
  }

  if (spouseHits.length === 0) {
    parts.push("配偶星未在四柱中明显显现。传统上需转看大运流年是否引动配偶星及婚姻宫；配偶星不显不等于没有婚姻。");
  }

  return parts.join("\n\n");
}

// ========== 用神与姻缘分析 ==========

function analyzeUsefulGodAndMarriage(usefulElements: string[], dayBranch: string, spouseStars: string[], pillars: { ganZhi: string; tenGod: string; element: string }[]): string {
  const parts: string[] = [];
  const dayBranchElement = BRANCH_MAIN_ELEMENT[dayBranch] ?? "土";

  // 婚姻宫是否为用神
  if (usefulElements.includes(dayBranchElement)) {
    parts.push(`婚姻宫（日支${dayBranch}）五行属${dayBranchElement}，与本报告所取用神一致。传统上可视为婚姻宫对命局平衡具有正向作用，但不能据此单独判断婚姻质量，仍需结合配偶星、合冲刑害与大运流年。`);
  } else {
    const CONTROLLING: Record<string, string> = { "木": "土", "火": "金", "土": "水", "金": "木", "水": "火" };
    const isControlledByUseful = usefulElements.some((e) => CONTROLLING[e] === dayBranchElement);
    if (isControlledByUseful) {
      parts.push(`婚姻宫（日支${dayBranch}）五行属${dayBranchElement}，与用神形成相克关系。传统上提示婚姻宫与命局平衡之间存在制约关系，具体吉凶需结合日主强弱及全局配置，不宜单独下结论。`);
    } else {
      parts.push(`婚姻宫（日支${dayBranch}）五行属${dayBranchElement}，不在本报告所取用神之列。这不代表婚姻不佳，只表示“婚姻宫为用神”这一项正面条件未成立。`);
    }
  }

  // 配偶星是否与用神同五行
  const spouseHits = pillars.filter((p) => spouseStars.includes(p.tenGod));
  const spouseUseful = spouseHits.filter((p) => usefulElements.includes(p.element));
  if (spouseUseful.length > 0) {
    parts.push(`配偶星所在柱位五行（${spouseUseful.map((p) => p.element).join("、")}）与用神一致。传统上视为配偶星对命局平衡具有正向条件，但仍需结合配偶星旺衰、位置与受制情况判断。`);
  }

  if (parts.length === 0) {
    parts.push("用神与婚姻宫/配偶星无直接重合，这是最常见的情况。但这为你的婚姻提供了一种自由——你不是因为'命理需要'而结婚，而是因为真正的感情选择。从用神角度看，你需要通过其他方面（事业、健康、社交）来平衡命局，而不需要依赖婚姻来完成这种平衡。");
  }

  return parts.join("\n\n");
}

// ========== 神煞联动分析 ==========

function synthesizeShenSha(
  ji: ShenShaItem[],
  xiong: ShenShaItem[],
  neutral: ShenShaItem[],
  dayBranch: string,
  spouseHits: { label: string; ganZhi: string }[],
): string {
  const parts: string[] = [];

  // 吉星在婚姻宫
  const jiInDay = ji.filter((s) => s.position === "日柱");
  if (jiInDay.length >= 2) {
    parts.push(`婚姻宫${jiInDay.map((s) => s.name).join("、")}双星汇聚，日柱作为婚姻的落点有双重吉星加持。传统视角下这代表婚姻质量有较高的保底——即使其他维度存在需要留意的地方，婚姻宫本身的吉星也能提供缓冲和保护。`);
  } else if (jiInDay.length === 1) {
    parts.push(`婚姻宫坐${jiInDay[0].name}，这是直接作用于婚姻关系的正向信号。${jiInDay[0].name}在日柱时权重最高，对婚姻质量的提升最为直接。`);
  }

  // 凶星在婚姻宫
  const xiongInDay = xiong.filter((s) => s.position === "日柱");
  if (xiongInDay.length > 0) {
    parts.push(`需留意${xiongInDay.map((s) => s.name).join("、")}同落日柱（婚姻宫）。这是解读中需要认真对待的信号——婚姻宫被这些标记占据，意味着婚姻关系中确实存在需要主动经营的课题。但结合全盘（婚姻宫五行、配偶星配置）来看，这些标记指向的是'需要经营的领域'而非'必然的结果'。${xiongInDay.map((s) => s.name).join("、")}提供的不是宿命论断而是一份'婚姻注意事项清单'。`);
  }

  // 红鸾/天喜 + 配偶星同位
  const hongLuan = ji.find((s) => s.name === "红鸾");
  const tianXi = ji.find((s) => s.name === "天喜");
  const spousePosition = spouseHits.map((h) => h.label);
  if ((hongLuan || tianXi) && spousePosition.some((p) => p === hongLuan?.position || p === tianXi?.position)) {
    parts.push(`红鸾/天喜与配偶星同位——信号叠加，该柱位代表的人生阶段出现重要感情事件的概率较高。这是专业视角下的'婚期信号'，结合大运引动可以进一步缩小时间窗口。`);
  }

  // 桃花 + 无配偶星
  const xianChi = neutral.find((s) => s.name === "咸池");
  if (xianChi && spouseHits.length === 0) {
    parts.push("命带桃花但配偶星不显——桃花提供的是机会和吸引力，但缺少配偶星的'锚定'可能导致感情中经历较多但落实较少。建议在桃花旺盛的大运中提高辨别力，不要被短暂的好感冲昏判断。");
  }

  // 孤寡 + 日柱
  const guChen = xiong.find((s) => s.name === "孤辰");
  const guaSu = xiong.find((s) => s.name === "寡宿");
  if ((guChen || guaSu) && (guChen?.position === "日柱" || guaSu?.position === "日柱")) {
    parts.push("孤辰/寡宿落在日柱，在关系中需要特别注意保持情感交流的频率和质量。你们可能天然倾向于'各自独立'的相处模式——这本身不是问题，但需要双方确认这种模式是共识而非疏远。");
  }

  if (parts.length === 0 && (ji.length > 0 || xiong.length > 0)) {
    parts.push("综合来看，神煞信号的分布较为均衡，没有集中在婚姻宫的极强或极弱信号。这意味着神煞层面没有给你的姻缘设置特别的'捷径'也没有设置特别的'障碍'——感情走向更多取决于婚姻宫、配偶星和大运的配置。");
  }

  return parts.join("\n\n");
}

// ========== 综合研判（由 buildSoloSection7_Synthesis 替代）==========

// ========== 十二长生 mode 映射 ==========

const changShengMode: Record<string, string> = {
  "长生": "主动型", "沐浴": "魅力型", "冠带": "稳重型", "临官": "进取型",
  "帝旺": "主导型", "衰": "慢热型", "病": "敏感型", "死": "内敛型",
  "墓": "谨慎型", "绝": "突破型", "胎": "包容型", "养": "滋养型",
};

// ========== 五行感情特质（已移除模板内容，由配偶星全维分析替代）==========

// ========== 神煞专业知识库 ==========

interface ShenShaProfile { name: string; basis: string; positionWeight: Record<string, string>; relationMeaning: string; strengthNote?: string; }

const shenShaProfiles: Record<string, ShenShaProfile> = {
  "天乙贵人": { name: "天乙贵人", basis: "以日干查四柱地支。甲戊庚见丑未，乙己见子申，丙丁见亥酉，壬癸见卯巳，辛见午寅。为子平法中最尊贵之神煞，主逢凶化吉、得贵人扶助。", positionWeight: { "年柱": "落年柱则祖荫深厚，从小成长环境中有长辈贵人照拂。姻缘层面，伴侣家庭背景通常不差，或通过长辈渠道认识伴侣的可能性大。", "月柱": "落月柱则事业社交圈中贵人多，成年后的现实环境对你友善。姻缘层面，容易通过工作、社交或朋友介绍认识条件不错的对象。月柱天乙贵人代表你在25-45岁这个婚恋黄金期有贵人加持。", "日柱": "落日柱最为直接——婚姻宫坐贵人，伴侣本人就是你的贵人。婚后生活质量和人生层次往往因婚姻而提升。这是最理想的位置，传统子平法中'日坐天乙'被视为上等配置。但需结合日支是否被冲合来综合判断——贵人虽在，若日支被冲则贵人助力有所折扣。", "时柱": "落时柱则晚年有福，子女或晚辈会成为你的贵人。姻缘层面，感情后期稳定，即使前期波折后期也能安享。时柱天乙贵人代表你的婚姻有'后福'。" }, relationMeaning: "天乙贵人是命中最吉之神。姻缘中遇到困难容易化解，伴侣往往在关键时刻能给予实质性帮助。若落日柱且日支无冲，婚姻质量有较高的保底保障。", strengthNote: "天乙贵人若与孤辰、寡宿同柱，贵人的助力会被部分抵消——不是贵人不存在，而是你需要更主动地去接收贵人的帮助。" },
  "红鸾": { name: "红鸾", basis: "以出生年支起红鸾位。子见卯、丑见寅、寅见丑、卯见子、辰见亥、巳见戌、午见酉、未见申、申见未、酉见午、戌见巳、亥见辰。红鸾为最直接的姻缘信号星。", positionWeight: { "年柱": "早年桃花初现，青春期开始就有异性缘。年柱红鸾代表感情启蒙较早，但年柱主早年，此位红鸾多代表初恋或早期感情经历而非婚姻。", "月柱": "成年后社交圈中容易遇到缘分，适婚年龄机会较多。月柱红鸾是最实用的位置——它在适婚年龄的社交和工作环境中发挥作用，同事、朋友介绍的成功率高。", "日柱": "婚姻宫坐红鸾是极为理想的位置——婚姻关系本身就是幸福感的来源，婚后感情持续升温。日柱红鸾意味着你对伴侣有持续的吸引力，婚姻不会因为时间而变得乏味。但需留意：若日支同时被冲，红鸾的正面效应会被削弱。", "时柱": "后期感情运势佳，即使早年感情经历不多，中晚年后也会有不错的缘分出现。时柱红鸾也代表子女婚事顺利，或通过子女认识新的社交圈。" }, relationMeaning: "红鸾是正姻缘星，命带红鸾之人感情不会落空。所在柱位对应的人生阶段容易出现重要的婚恋事件。红鸾与天喜同现时，婚期信号最为强烈。红鸾与配偶星同柱时，'对的人'出现的概率显著提升。" },
  "天喜": { name: "天喜", basis: "以出生年支起天喜位，为红鸾对宫。卯见酉、寅见申、丑见未、子见午、亥见巳、戌见辰、酉见卯、申见寅、未见丑、午见子、巳见亥、辰见戌。天喜主喜事、庆典。", positionWeight: { "年柱": "家庭氛围欢乐，成长环境中婚恋观念开放积极。年柱天喜代表家庭对你的婚姻持支持和祝福态度。", "月柱": "适婚年龄容易遇到喜事，可能在工作环境中遇到伴侣。月柱天喜意味着你的婚礼或婚姻大事会受到社交圈的广泛祝福。", "日柱": "婚姻宫带天喜，婚后家庭生活充满欢乐和仪式感。日柱天喜的人适合通过正式的婚嫁仪式进入婚姻——仪式感对你们很重要。", "时柱": "后期生活喜事连连，子女婚事也会给你带来快乐。时柱天喜代表晚年生活热闹温馨。" }, relationMeaning: "天喜与红鸾双星同现时，婚恋信号最强。单独出现时偏向喜事氛围而非直接桃花，说明婚姻过程会比较顺利愉快。天喜所在之柱若同时有配偶星，婚期信号极为强烈。" },
  "咸池": { name: "咸池", basis: "以年支所属三合局查桃花位。申子辰在酉，寅午戌在卯，亥卯未在子，巳酉丑在午。咸池即桃花星，主异性缘、人缘和感情机遇。", positionWeight: { "年柱": "早年桃花重，青春期异性缘好。年柱桃花偏外缘——你的吸引力是'被人看到'的，而非你主动释放的。", "月柱": "社交圈中桃花旺盛，工作环境中容易产生感情。月柱桃花最需辨别——是缘分还是短暂吸引？桃花逢合（地支六合）则缘分易落实，桃花逢冲则缘分易散。", "日柱": "婚姻宫坐桃花，伴侣往往外貌或气质出众。日柱桃花意味着婚后仍保持异性吸引力——这不是坏事，但需要双方都有适当的边界意识。日柱桃花若同时坐配偶星，代表'正缘即桃花'，是上佳信号。", "时柱": "晚年桃花，即使年龄增长仍保持魅力和吸引力。时柱桃花代表你的个人魅力是持久的。" }, relationMeaning: "桃花星本身不定吉凶，关键在于是否与配偶星同柱、是否被冲合。桃花逢合则缘分易落实，桃花逢冲则缘分易散。桃花过旺（两个以上柱位出现）需注意感情中的诱惑与边界，避免多线发展。", strengthNote: "桃花所在柱位若无配偶星，此桃花为'虚桃花'——有吸引力但难以转化为长期稳定关系，需等待大运配偶星引动来'实化'。" },
  "孤辰": { name: "孤辰", basis: "以出生年支查孤辰位。亥子丑见寅，寅卯辰见巳，巳午未见申，申酉戌见亥。孤辰主独立、独处倾向，感情节奏偏慢。", positionWeight: { "年柱": "从小性格独立，不习惯依赖他人。年柱孤辰代表感情节奏从源头就偏慢——你不需要通过恋爱来证明什么。", "月柱": "成年后社交圈偏小或偏精，圈子内的潜在对象有限。月柱孤辰的人往往'宁缺毋滥'，不擅长泛泛之交。", "日柱": "婚姻宫犯孤辰最需留意——婚后容易产生疏离感，需要双方都有意识地保持情感交流和共同活动。但不代表婚姻不好，只是需要更多主动经营。日柱孤辰若同时有禄神或天乙贵人，可显著缓解孤辰的负面影响。", "时柱": "晚年倾向独处或清静生活，对伴侣的陪伴需求低于平均水平。" }, relationMeaning: "孤辰不是无缘，而是缘分节奏偏慢偏晚。命带孤辰者适合找一个同样独立、能给彼此空间的伴侣。早婚需谨慎，晚婚往往更稳定。孤辰与桃花同现时，代表'慢热的吸引力'——别人需要时间来发现你的好。" },
  "寡宿": { name: "寡宿", basis: "以出生年支查寡宿位。亥子丑见戌，寅卯辰见丑，巳午未见辰，申酉戌见未。寡宿主对伴侣要求较高，容易宁缺毋滥。", positionWeight: { "年柱": "从小对感情的标准就高于同龄人，不太容易被普通的追求打动。年柱寡宿代表你在感情中是'高门槛'类型。", "月柱": "择偶标准在成年后进一步提高，对伴侣的精神层面和价值观匹配度要求高。月柱寡宿的人对'凑合'的容忍度极低。", "日柱": "婚姻宫犯寡宿，对伴侣的期望值高。但一旦找到满意的人，忠诚度极高——你的高标准是为了找到一个'值得'的人。日柱寡宿若与禄神同柱，代表你宁缺毋滥的选择最终会得到回报。", "时柱": "晚年对感情生活的品质要求高，不愿将就。" }, relationMeaning: "寡宿不等于孤独终老，而是你不会在感情中降低标准。对于婚姻质量这是好事——你不会因为社会压力随便结婚。但需要注意理想与现实之间的平衡，以及给对方成长的时间。" },
  "禄神": { name: "禄神", basis: "以日干查禄位。甲禄寅、乙禄卯、丙戊禄巳、丁己禄午、庚禄申、辛禄酉、壬禄亥、癸禄子。禄神代表自身根基和现实稳定性。", positionWeight: { "年柱": "家庭根基稳固，从小生活环境稳定。年柱禄神代表家庭为你的婚姻提供了坚实的物质和情感基础。", "月柱": "事业发展顺利，经济独立能力强。月柱禄神意味着你在感情中有底气不依附于对方——这是健康婚姻的前提。", "日柱": "婚姻宫坐禄神是最佳位置之一——你在婚姻中不会失去自我，能保持独立人格和经济能力。日柱禄神也代表伴侣本人稳重可靠，婚姻关系具有实质性的稳定基础。禄神在日柱时，孤辰/寡宿的负面影响会被显著削弱。", "时柱": "晚年生活自给自足，不给伴侣或子女添负担。时柱禄神代表你的婚姻有'善终'的基础。" }, relationMeaning: "禄神在婚姻中的意义是'不失自我'。禄神所在之柱若同时有配偶星，代表伴侣能实质性地支持你的人生根基。禄神与孤寡同柱时，代表'独而不孤'——你独立但充实。" },
  "羊刃": { name: "羊刃", basis: "以日干查羊刃位。甲刃卯、乙刃寅、丙戊刃午、丁己刃巳、庚刃酉、辛刃申、壬刃子、癸刃亥。羊刃为日干最旺之地，过旺则刚。", positionWeight: { "年柱": "性格从小就好强有主见。年柱羊刃代表你在感情中从不受人摆布——这是优势也是挑战。", "月柱": "工作和社交中气场强，可能让对方一开始觉得有距离感。月柱羊刃的人需要伴侣有一定的'抗压能力'。", "日柱": "婚姻宫坐羊刃最需留意——情绪上来时容易说伤人的话，争执时倾向于压过对方。日柱羊刃需要你有意识地控制冲突时的表达方式。但羊刃也代表强大的自我修复力——你不容易被婚姻中的挫折打倒。", "时柱": "晚年性格依然刚强，关系中需要对方适应你的节奏。" }, relationMeaning: "羊刃不是凶神本身，而是情绪放大器。在婚姻中最大的课题是控制冲突时的语言和行为。羊刃所在之柱若有天乙贵人，贵人的调和效应可以显著缓解羊刃的刚烈。", strengthNote: "羊刃之人适合找一个情绪稳定、包容度高的伴侣。两羊刃相逢则冲突升级，需避免。羊刃与禄神同柱时，为'禄刃相随'，力量加倍但管理难度也加倍。" },
  "驿马": { name: "驿马", basis: "以年支所属三合局查驿马位。申子辰在寅、寅午戌在申、亥卯未在巳、巳酉丑在亥。驿马主动、迁移、变化。", positionWeight: { "年柱": "早年可能经历搬家或转学。年柱驿马代表你的感情观受不同环境影响较大，异地恋的可能性高。", "月柱": "成年后工作或生活地点可能变动。月柱驿马意味着缘分可能在出差、旅行或搬迁中出现——你的正缘可能不在你'当前'的城市。", "日柱": "婚姻宫坐驿马，婚姻关系中需要保持新鲜感和一定的空间感。日柱驿马不代表婚姻不稳定，而是说你们的婚姻需要适度的'动'——共同的旅行、搬家、新的生活阶段都能让关系保持活力。", "时柱": "晚年仍保持活跃的生活方式，可能随子女或伴侣迁移。时柱驿马代表你的婚姻有'走走停停'的弹性。" }, relationMeaning: "驿马在姻缘中的核心含义是'动中求缘'——你的缘分不是在原地等来的，而是在前行路上遇到的。异地恋、旅行中的邂逅、不同城市的人都是驿马带来的可能性。驿马与桃花同现时，代表'远方的桃花'——缘分可能来自异地。" },
  "华盖": { name: "华盖", basis: "以年支所属三合局查华盖位。申子辰见辰、寅午戌见戌、亥卯未见未、巳酉丑见丑。华盖主智慧、孤独、精神追求。", positionWeight: { "年柱": "从小思想比同龄人成熟。年柱华盖代表你对肤浅的社交和感情形式不太感兴趣——你需要的是有深度的连接。", "月柱": "社交圈偏小众。月柱华盖意味着你的兴趣爱好可能不是大众化的，因此缘分池偏小但更精准——小众但高匹配。", "日柱": "婚姻宫坐华盖，对伴侣的精神层面要求高于物质层面。日柱华盖的人需要伴侣能理解你的内心世界——不是读过多少书，而是能和你进行有意义的对话。华盖在日柱的人往往在婚姻中保持一定的精神独立性，这不是疏远而是你的本能需求。", "时柱": "晚年追求精神生活，可能对宗教、哲学或艺术产生浓厚兴趣。时柱华盖代表你晚年的感情质量取决于精神契合度。" }, relationMeaning: "华盖之人的感情不走流量路线。华盖与文昌贵人同现时，代表你容易被'聪明的人'吸引。华盖在日柱且无配偶星时，需要在精神契合和现实婚姻之间找到平衡。" },
};

// getShenShaProfile 已移除，神煞信息提取在 buildSoloSection4_ShenSha 中内联处理

// ========== 配偶星质量评估 ==========

function evaluateSpouseStarQuality(
  pillars: { ganZhi: string; tenGod: string; hiddenTenGods: string[]; label: string; element: string }[],
  spouseStars: string[],
): { totalCount: number; surfaceCount: number; hiddenCount: number; positions: string[]; spouseHits: { label: string; ganZhi: string; tenGod: string; element: string }[]; quality: string; analysis: string } {
  let surfaceCount = 0, hiddenCount = 0;
  const positions: string[] = [];
  const spouseHits: { label: string; ganZhi: string; tenGod: string; element: string }[] = [];

  pillars.forEach((p) => {
    if (spouseStars.includes(p.tenGod)) {
      surfaceCount++;
      positions.push(p.label);
      spouseHits.push({ label: p.label, ganZhi: p.ganZhi, tenGod: p.tenGod, element: p.element });
    }
    const hiddenHits = p.hiddenTenGods.filter((t) => spouseStars.includes(t));
    if (hiddenHits.length > 0) {
      hiddenCount += hiddenHits.length;
      if (!positions.includes(p.label)) positions.push(p.label);
      hiddenHits.forEach((t) => {
        spouseHits.push({ label: p.label, ganZhi: p.ganZhi, tenGod: t, element: p.element });
      });
    }
  });

  const totalCount = surfaceCount + hiddenCount;
  let quality: string, analysis: string;

  if (totalCount >= 3 && surfaceCount >= 1) {
    quality = "有力";
    analysis = "配偶星天干透出且多次出现——在适婚年龄容易识别和把握，缘分信号清晰。天干透出代表你的正缘在社交层面容易被你注意到，不是那种'藏在人群中'的类型。传统视角下这是缘分信号较强的配置。";
  } else if (totalCount >= 2) {
    quality = "中等";
    analysis = "配偶星有一定显现，缘分基础存在。配偶星出现了不止一次，代表你的感情生活中不会缺少'候选者'。但需要关注大运流年对配偶星的引动时机——有时候不是人不对，是时机不对。";
  } else if (totalCount === 1) {
    quality = "偏弱";
    analysis = "配偶星仅出现一次，缘分信号偏弱偏隐。这在专业八字中不代表没有姻缘，而是代表你的正缘是'少数派'——数量少但质量可能很高。单一配偶星的缘分往往更专注和深入，只是需要更多耐心等待正确时机。";
  } else {
    quality = "隐伏";
    analysis = "配偶星未在四柱中明显显现。这在专业八字中称为'配偶星不显'——你的缘分更多依赖大运流年的引动和个人的主动选择。很多配偶星不显的人最终婚姻美满，只是路径与他人不同。配偶星不显的人往往在'不经意间'遇到正缘——不是通过刻意寻找。";
  }

  // 附加分析
  if (positions.includes("日柱")) {
    analysis += " 配偶星落在日柱（婚姻宫）附近，这是最直接的位置——你的伴侣和婚姻关系本身存在天然的契合。传统子平法中'配偶星入主位'被视为重要正面指标。";
  }
  if (surfaceCount >= 2) {
    analysis += " 配偶星天干多次透出，你的正缘在社交层面'可见度'高——在人群中容易被你识别。";
  }
  if (hiddenCount >= 2 && surfaceCount === 0) {
    analysis += " 但配偶星全藏于地支而无天干透出，缘分偏隐性——你可能需要通过深度社交而非泛泛之交来触发缘分。天干无配偶星代表你不会'一眼看到对的人'，需要相处之后才能确认。";
  }

  return { totalCount, surfaceCount, hiddenCount, positions, spouseHits, quality, analysis };
}

// ========== 婚姻宫详解 ==========

function analyzeMarriagePalace(
  dayBranch: string, dayStem: string, hiddenTenGods: string[], nayin: string, element: string,
  interactions: InteractionResult[],
): string {
  const parts: string[] = [];
  const branchElement = BRANCH_MAIN_ELEMENT[dayBranch] ?? "土";
  const dayElement = STEM_ELEMENT[dayStem] ?? "土";

  parts.push(`婚姻宫（日支）为「${dayBranch}」，五行属${branchElement}。`);

  // 日干与日支的生克关系
  const GENERATING: Record<string, string> = { "木": "火", "火": "土", "土": "金", "金": "水", "水": "木" };
  const CONTROLLING: Record<string, string> = { "木": "土", "火": "金", "土": "水", "金": "木", "水": "火" };

  if (dayElement === branchElement) {
    parts.push(`日主五行与婚姻宫五行同为${dayElement}，同气相求。这在专业八字中意味着：你与伴侣在核心价值观和生活方式上天然趋同，双方默契度高。但同气过强时可能缺少互补的张力——关系中偶尔需要一些'不同'来保持活力。同气婚姻宫的优势是稳定，劣势是可能变成'平淡'。`);
  } else if (GENERATING[dayElement] === branchElement) {
      parts.push(`日主${dayElement}生婚姻宫${branchElement}，传统术语称“日主生婚姻宫”。取象上常用于观察命主对关系的投入倾向；是否表现为实际付出，仍需结合十神与全局强弱。`);
  } else if (GENERATING[branchElement] === dayElement) {
    parts.push(`婚姻宫${branchElement}生日主${dayElement}，传统术语称“婚姻宫生身”。取象上可视为婚姻宫对日主有生扶关系，但不能直接等同于伴侣一定照顾或支持命主。`);
  } else if (CONTROLLING[dayElement] === branchElement) {
    parts.push(`日主${dayElement}克婚姻宫${branchElement}，传统术语称“日主克婚姻宫”。取象上提示日主与婚姻宫存在制约关系，需结合日主强弱判断是主动管理还是关系压力。`);
  } else if (CONTROLLING[branchElement] === dayElement) {
    parts.push(`婚姻宫${branchElement}克日主${dayElement}，传统术语称“婚姻宫克身”。取象上提示婚姻宫对日主形成制约，需结合日主强弱、配偶星及合冲情况判断其实际影响。`);
  }

  // 合冲刑害
  if (interactions.length > 0) {
    parts.push("");
    parts.push("【日支与其他柱位的互动】：");
    interactions.forEach((inter) => parts.push(`  ▸ ${inter.description}`));
  } else {
    parts.push("");
    parts.push("日支与其他柱位无明显的合冲刑害关系，婚姻宫处于相对独立的稳定状态。这意味着外部环境对婚姻的干扰较小，婚姻关系更多由你和伴侣的内在动力决定。");
  }

  // 藏干
  if (hiddenTenGods.length > 0) {
    parts.push("");
    parts.push(`婚姻宫藏干为${hiddenTenGods.join("、")}，这些是婚姻关系中'隐藏的变量'——代表你和伴侣之间潜在的互动模式、共同的隐秘需求和关系中不常被言说但确实存在的力量。藏干中如有配偶星（${hiddenTenGods.filter((t) => ["正官", "七杀", "正财", "偏财"].includes(t)).join("、") || "无"}），配偶星入婚姻宫藏干是姻缘结构稳固的重要标志。`);
  }

  parts.push("");
  parts.push(`婚姻宫纳音为「${nayin}」，代表婚姻关系的气场底色。纳音不直接看吉凶，而是描述婚姻的'氛围感'——${nayin}的婚姻气场偏${nayin[nayin.length - 1] === "金" ? "刚健明快" : nayin[nayin.length - 1] === "木" ? "生长向上" : nayin[nayin.length - 1] === "水" ? "流动包容" : nayin[nayin.length - 1] === "火" ? "热烈外放" : "稳定踏实"}。`);

  return parts.join("\n");
}

// ========== 新辅助函数 ==========

/** 筛选高权重姻缘神煞（只保留日柱/月柱 + 必列神煞类型） */
function filterPriorityShenSha(items: ShenShaItem[]): {
  primary: ShenShaItem[];   // 落在日柱的神煞（权重最高）
  secondary: ShenShaItem[]; // 落在月柱的神煞
  other: ShenShaItem[];     // 其他柱位但属于必列神煞类型
} {
  const alwaysShow = new Set(["天乙贵人", "红鸾", "天喜", "咸池", "孤辰", "寡宿", "孤鸾煞", "阴差阳错", "羊刃"]);

  const primary = items.filter(s => s.position === "日柱" && alwaysShow.has(s.name));
  const secondary = items.filter(s => s.position === "月柱" && alwaysShow.has(s.name));
  const other = items.filter(s =>
    s.position !== "日柱" && s.position !== "月柱" && alwaysShow.has(s.name)
  );

  // 补充：日柱/月柱上的非必列但仍有参考价值的神煞
  const extraOnDay = items.filter(s => s.position === "日柱" && !alwaysShow.has(s.name));
  const extraOnMonth = items.filter(s => s.position === "月柱" && !alwaysShow.has(s.name));

  return {
    primary: [...primary, ...extraOnDay],
    secondary: [...secondary, ...extraOnMonth],
    other,
  };
}

/** 为单个引动年份生成详细解读 */
function analyzeYearlyDetail(
  year: number,
  ganZhi: string,
  dayStem: string,
  dayBranch: string,
  spouseStars: string[],
  peachBranch: string,
): { type: string; detail: string; advice: string } | null {
  const yearStem = ganZhi[0];
  const yearBranch = ganZhi[1];
  const triggers: string[] = [];
  const details: string[] = [];

  // 桃花星引动
  if (yearBranch === peachBranch) {
    triggers.push("桃花到位");
    details.push(`流年地支${yearBranch}落桃花位，这一年人际关系温度升高，容易被关注和靠近。`);
  }

  // 日支六合
  if (LIU_HE[yearBranch] === dayBranch) {
    triggers.push("合婚姻宫");
    details.push(`流年${yearBranch}与日支${dayBranch}六合，婚姻宫被引动，关系容易在此年趋于稳定和深化。`);
  }

  // 日支六冲
  if (LIU_CHONG[yearBranch] === dayBranch) {
    triggers.push("冲婚姻宫");
    details.push(`流年${yearBranch}与日支${dayBranch}六冲，婚姻宫被冲动，关系中可能出现重要变动或重新定义。`);
  }

  // 天干五合
  const TIAN_GAN_HE: Record<string, string> = {
    "甲": "己", "己": "甲", "乙": "庚", "庚": "乙", "丙": "辛", "辛": "丙",
    "丁": "壬", "壬": "丁", "戊": "癸", "癸": "戊",
  };
  if (TIAN_GAN_HE[yearStem] === dayStem) {
    triggers.push("天干五合");
    details.push(`流年天干${yearStem}与日主${dayStem}五合，这一年人际吸引力自然提升，适合主动沟通。`);
  }

  // 三合
  const SAN_HE: Record<string, string[]> = {
    "申": ["子", "辰"], "子": ["申", "辰"], "辰": ["申", "子"],
    "亥": ["卯", "未"], "卯": ["亥", "未"], "未": ["亥", "卯"],
    "寅": ["午", "戌"], "午": ["寅", "戌"], "戌": ["寅", "午"],
    "巳": ["酉", "丑"], "酉": ["巳", "丑"], "丑": ["巳", "酉"],
  };
  if (SAN_HE[yearBranch]?.includes(dayBranch)) {
    triggers.push("三合日支");
    details.push(`流年${yearBranch}与日支${dayBranch}成三合关系，感情中长期走向趋于明朗。`);
  }

  if (triggers.length === 0) return null;

  const type = triggers.join("+");
  const detail = details.join(" ");

  // 基于引动类型生成建议
  let advice = "";
  if (triggers.includes("合婚姻宫")) {
    advice = "适合推进关系承诺、讨论长期规划";
  } else if (triggers.includes("冲婚姻宫")) {
    advice = "变动中保持冷静，重大决定多给自己一些时间";
  } else if (triggers.includes("桃花到位")) {
    advice = "扩大社交圈，出现在对的场合，但不要急于下结论";
  } else if (triggers.includes("天干五合")) {
    advice = "适合主动沟通、修复或加深重要关系";
  } else {
    advice = "保持开放心态，顺势而为";
  }

  return { type, detail, advice };
}

/** 生成命理依据附录 */
function buildAppendixBody(): string {
  const rules = [
    { rule: "天干五合", source: "《三命通会·论合》", note: "甲己合土、乙庚合金、丙辛合水、丁壬合木、戊癸合火" },
    { rule: "地支六合", source: "《渊海子平》", note: "子丑合土、寅亥合木、卯戌合火、辰酉合金、巳申合水、午未合土" },
    { rule: "地支六冲", source: "《渊海子平》", note: "子午冲、丑未冲、寅申冲、卯酉冲、辰戌冲、巳亥冲" },
    { rule: "地支六害", source: "《三命通会》", note: "子未害、丑午害、寅巳害、卯辰害、申亥害、酉戌害" },
    { rule: "十二长生", source: "《五行大义》", note: "长生、沐浴、冠带、临官、帝旺、衰、病、死、墓、绝、胎、养" },
    { rule: "十神", source: "《子平真诠》", note: "正官、七杀、正财、偏财、正印、偏印、食神、伤官、比肩、劫财" },
    { rule: "天乙贵人", source: "《三命通会》", note: "甲戊庚见丑未，乙己见子申，丙丁见亥酉，壬癸见卯巳，辛见午寅" },
    { rule: "红鸾天喜", source: "《星平会海》", note: "以年支起红鸾，对宫为天喜" },
    { rule: "咸池（桃花）", source: "《三命通会》", note: "申子辰在酉，寅午戌在卯，亥卯未在子，巳酉丑在午" },
  ];

  return [
    "本报告基于以下传统命理规则进行推导，所有分析均有经典出处：",
    "",
    ...rules.map((r, i) => `${String(i + 1)}. **${r.rule}**（${r.source}）：${r.note}`),
    "",
    "---",
    "",
    "**免责声明**：八字命理分析属于传统文化范畴，报告内容仅供参考和反思，不构成对未来的确定性预测。",
    "任何命理维度的好与不好，都不能替代个人在现实中的选择和经营。",
    "每一段关系都是独一无二的——你们的经历、选择和努力比任何命理维度都重要。",
  ].join("\n");
}

// ========== Main Build: Solo ==========

export function buildSoloDeepReport(
  result: SingleMarriageResult,
  input: { birthDate: string; birthHour: number; gender: "male" | "female" },
): MarriageDeepReport {
  const id = nextId("ms");
  const bazi = calculateBazi(input);
  const pillars = bazi.pillars;
  const spouseStars = input.gender === "male" ? ["正财", "偏财"] : ["正官", "七杀"];

  // ---- 八字总览 ----
  const baziOverview = {
    pillars: pillars.map((p) => ({ label: p.label, ganZhi: p.ganZhi, nayin: p.nayin, tenGod: p.tenGod, hiddenTenGods: p.hiddenTenGods, element: p.element, xunKong: p.xunKong })),
    dayMaster: bazi.dayMaster, dominantElement: bazi.dominantElement, zodiac: bazi.zodiac,
    elements: bazi.elements, strength: bazi.strength, shenGong: bazi.shenGong, mingGong: bazi.mingGong,
  };

  const dayStem = pillars[2].ganZhi[0];
  const dayBranch = pillars[2].ganZhi[1];
  const dayChangSheng = getChangShengStage(dayStem, dayBranch);
  const csMode = changShengMode[dayChangSheng] ?? "稳重型";

  // ---- 合冲刑害 ----
  const branchInteractions = analyzeDayBranchInteractions(dayBranch, [
    { label: "年柱", branch: pillars[0].ganZhi[1] },
    { label: "月柱", branch: pillars[1].ganZhi[1] },
    { label: "时柱", branch: pillars[3].ganZhi[1] },
  ]);
  const stemInteractions = analyzeDayStemInteractions(dayStem, [
    { label: "年柱", stem: pillars[0].ganZhi[0] },
    { label: "月柱", stem: pillars[1].ganZhi[0] },
    { label: "时柱", stem: pillars[3].ganZhi[0] },
  ]);

  // ---- 神煞 ----
  const shenShaItems = computeShenSha(bazi.dayMaster, pillars[0].ganZhi[1], pillars);
  const { ji, neutral, xiong } = shenShaSummary(shenShaItems);

  // ---- 配偶星 ----
  const spouseAnalysis = evaluateSpouseStarQuality(baziOverview.pillars, spouseStars);

  // ---- 婚姻宫 ----
  const marriagePalaceAnalysis = analyzeMarriagePalace(
    dayBranch, dayStem, pillars[2].hiddenTenGods, pillars[2].nayin, pillars[2].element, branchInteractions,
  );

  // ---- 十神格局 ----
  const tenGodFindings = analyzeTenGodPattern(baziOverview.pillars, dayStem, input.gender);

  // ---- 配偶画像 ----
  const spousePortrait = deriveSpousePortrait(spouseStars, spouseAnalysis.spouseHits, dayStem, dayBranch, bazi.dominantElement);

  // ---- 用神与姻缘 ----
  const usefulGodAnalysis = analyzeUsefulGodAndMarriage(bazi.usefulElements, dayBranch, spouseStars, baziOverview.pillars);

  // ---- 神煞联动 ----
  const shenShaSynthesis = synthesizeShenSha(ji, xiong, neutral, dayBranch, spouseAnalysis.spouseHits);

  // ---- 大运 ----
  const luckLines: { ganZhi: string; ages: string; impact: string; isCurrent: boolean; details: string }[] = [];
  bazi.luck.cycles.forEach((cycle) => {
    const cBranch = cycle.ganZhi[1], cStem = cycle.ganZhi[0];
    const impacts: string[] = [], impactDetails: string[] = [];

    if (cBranch === dayBranch) { impacts.push("引动婚姻宫"); impactDetails.push(`大运支${cBranch}与日支${dayBranch}相同，构成伏吟，传统上视为婚姻宫相关议题更容易被反复触发；具体表现仍需结合流年与现实关系状态。`); }
    const xianChiBranch = ["申", "子", "辰"].includes(pillars[0].ganZhi[1]) ? "酉" : ["寅", "午", "戌"].includes(pillars[0].ganZhi[1]) ? "卯" : ["亥", "卯", "未"].includes(pillars[0].ganZhi[1]) ? "子" : "午";
    if (cBranch === xianChiBranch) { impacts.push("桃花到位"); impactDetails.push(`大运支${cBranch}落桃花位，传统上主社交与感情机会增加；桃花只代表机会和关注度，不等同于稳定关系。`); }
    if (spouseStars.includes(cStem)) { impacts.push("配偶星透干"); impactDetails.push(`大运干${cStem}为配偶星，传统上视为伴侣议题在此运更容易显现；能否形成稳定关系仍需结合配偶宫、流年与双方选择。`); }
    if (LIU_HE[cBranch] === dayBranch) { impacts.push("合婚姻宫"); impactDetails.push(`大运支${cBranch}与日支${dayBranch}六合，传统上主婚姻宫关系趋向联结与稳定；是否落实为确定关系或婚姻，仍需流年配合。`); }
    if (LIU_CHONG[cBranch] === dayBranch) { impacts.push("冲婚姻宫"); impactDetails.push(`大运支${cBranch}与日支${dayBranch}六冲，传统上主婚姻宫相关状态容易变化；冲不等同于分离，应结合流年判断变化性质。`); }

    const luckStemElement = STEM_ELEMENT[cStem] ?? "土";
    const dayMasterElement = STEM_ELEMENT[dayStem] ?? "土";
    const luckBranchElement = BRANCH_MAIN_ELEMENT[cBranch] ?? "土";
    const dayBranchElement = BRANCH_MAIN_ELEMENT[dayBranch] ?? "土";
    const indirectDetail = `大运干${cStem}属${luckStemElement}，与日主${dayStem}${dayMasterElement}为${describeElementRelation(luckStemElement, dayMasterElement)}；大运支${cBranch}属${luckBranchElement}，与婚姻宫${dayBranch}${dayBranchElement}未见伏吟、六合或六冲。此运缺少可单独指向婚恋事件的直接信号，不据此单断婚期。`;

    luckLines.push({
      ganZhi: cycle.ganZhi, ages: `${cycle.startAge}-${cycle.endAge}岁`,
      impact: impacts.length > 0 ? impacts.join(" · ") : "无直接引动",
      isCurrent: cycle === bazi.luck.currentCycle,
      details: impactDetails.length > 0 ? impactDetails.join("\n") : indirectDetail,
    });
  });

  // ====== Build Sections ======
  const sections: DeepReportSection[] = [];

  // 01: 神煞全盘
  const shenShaEntries = [...ji, ...neutral, ...xiong].map((item) => {
    const profile = shenShaProfiles[item.name];
    return { name: item.name, category: item.category, position: item.position, meaning: profile?.relationMeaning ?? item.meaning, basis: profile?.basis ?? "依传统神煞口诀推导。", positionAnalysis: profile?.positionWeight?.[item.position] ?? "", strengthNote: profile?.strengthNote ?? null };
  });

  sections.push({
    title: "神煞全盘",
    subtitle: `共${shenShaItems.length}颗 · 吉神${ji.length} · 中性神煞${neutral.length} · 凶煞${xiong.length}`,
    body: [
      `命盘中出现${shenShaItems.length}颗姻缘相关神煞。以下逐颗展开：取法依据、柱位权重、姻缘研判。`,
      shenShaItems.length === 0 ? "无显著姻缘神煞。神煞为辅助参考，婚姻宫和配偶星配置更为重要。" : "",
      "",
      shenShaSynthesis,
    ].filter(Boolean).join("\n"),
    highlights: [...ji.map((s) => s.name), ...xiong.map((s) => s.name)],
    data: { entries: shenShaEntries, jiCount: ji.length, neutralCount: neutral.length, xiongCount: xiong.length },
  });

  // 02: 日柱互动 · 合冲刑害
  const allInteractions = [...branchInteractions, ...stemInteractions];
  sections.push({
    title: "日柱互动 · 合冲刑害",
    subtitle: `日支「${dayBranch}」与各柱关系`,
    body: [
      "日柱（尤其是日支婚姻宫）与年、月、时三柱的地支互动，是专业八字合婚中评判婚姻稳定性的核心维度。合则和谐稳定，冲则变动挑战，害则慢性不协调。以下逐项分析：",
      "",
      allInteractions.length > 0 ? allInteractions.map((inter) => `${inter.type === "合" || inter.type === "三合" ? "⊕" : inter.type === "冲" ? "⚡" : inter.type === "害" ? "⚠" : "○"} ${inter.target}${inter.type}：${inter.description}`).join("\n\n") : "日柱与其他柱位无明显的合冲刑害，婚姻宫处于相对独立的状态。这在专业视角下是好事——外部环境对婚姻的干扰较小，稳定性较高。",
      "",
      "合冲刑害的分析需要结合大运流年——静态的合冲提供的是'基本盘'，动态的大运合冲提供的是'变化节点'。详见大运章节。",
    ].join("\n"),
    highlights: allInteractions.length > 0 ? allInteractions.map((i) => `${i.target}${i.type}`) : ["婚姻宫独立无冲合"],
  });

  // 03: 婚姻宫详解
  sections.push({
    title: "婚姻宫详解",
    subtitle: `日支「${dayBranch}」为配偶宫`,
    body: marriagePalaceAnalysis,
    highlights: [dayBranch, pillars[2].nayin, ...pillars[2].hiddenTenGods.slice(0, 2)],
  });

  // 04: 十神格局 · 感情模式
  sections.push({
    title: "十神格局 · 感情模式",
    subtitle: `${tenGodFindings.length}项格局特征`,
    body: [
      "十神是八字命理中描述人际关系和性格特质的核心语言。以下基于四柱十神配置，分析你的感情行为模式和格局特征：",
      "",
      ...tenGodFindings.map((f, i) => `${String(i + 1)}. ${f}`),
    ].join("\n"),
    highlights: tenGodFindings.slice(0, 3).map((f) => f.slice(0, 30) + "…"),
  });

  // 05: 配偶星全维分析
  sections.push({
    title: "配偶星全维分析",
    subtitle: `配偶星：${spouseStars.join("、")} · 评级：${spouseAnalysis.quality}`,
    body: [
      `你的配偶星为「${spouseStars.join("」和「")}」。在传统子平法中，${input.gender === "male" ? "男命以财星为配偶星——正财代表稳定的伴侣/妻子，偏财代表恋爱对象或非传统关系" : "女命以官星为配偶星——正官代表稳定的伴侣/丈夫，七杀代表恋爱对象或非传统关系"}。`,
      "",
      `配偶星在四柱中出现${spouseAnalysis.totalCount}次（天干透出${spouseAnalysis.surfaceCount}次，地支藏干${spouseAnalysis.hiddenCount}次），综合评级：「${spouseAnalysis.quality}」。`,
      "",
      spouseAnalysis.analysis,
      "",
      "【配偶星取象】",
      spousePortrait,
      "",
      "以上仅为配偶星五行与柱位的传统取象，不用于断定伴侣的具体性格、职业、外貌、相识方式或婚期。",
    ].join("\n"),
    highlights: [`${spouseAnalysis.totalCount}次`, spouseAnalysis.quality, ...spouseAnalysis.positions.slice(0, 2)],
  });

  // 06: 十二长生 · 感情节奏
  const spouseChangSheng = spouseAnalysis.spouseHits.map((h) => {
    const stage = getChangShengStage(h.ganZhi[0], h.ganZhi[1]);
    return { pillar: h.label, star: h.tenGod, stage };
  });

  sections.push({
    title: "十二长生 · 感情节奏",
    subtitle: `日主「${dayStem}」在婚姻宫：${dayChangSheng}（${csMode}）`,
    body: [
      `日主「${dayStem}」在日支（婚姻宫）「${dayBranch}」上的十二长生状态为「${dayChangSheng}」。十二长生描述天干在地支上的能量阶段，日主在婚姻宫的长生状态直接反映——`,
      "",
      `【感情模式】${csMode}`,
      "十二长生状态的具体解读基于传统命理规则推导，本部分将在完整版中展开。",
      "",
      `【时机判断】时机判断基于十二长生在婚姻宫的状态推导。`,
      "",
      `【建议】建议基于日主在婚姻宫的能量阶段制定。`,
      "",
      spouseChangSheng.length > 0 ? [
        "【配偶星长生状态】",
        ...spouseChangSheng.map((s) => `  ▸ ${s.pillar}：配偶星「${s.star}」处于「${s.stage}」`),
        "",
        "配偶星的长生状态反映其能量阶段。长生/冠带/临官/帝旺代表配偶星有力和活跃，衰/病/死/墓代表配偶星能量偏收敛。配偶星长生在'上升阶段'时缘分主动，在'收敛阶段'时需要大运流年来激活。",
      ].join("\n") : "",
    ].join("\n"),
    highlights: [`模式：${csMode}`, `日主：${dayChangSheng}`, ...spouseChangSheng.slice(0, 2).map((s) => `${s.star}：${s.stage}`)],
  });

  // 08: 用神与姻缘
  sections.push({
    title: "用神与姻缘",
    subtitle: `用神：${bazi.usefulElements.join("、") || "无显著偏颇"}`,
    body: [
      "用神是本报告依据日主强弱与五行分布选取的平衡参考。婚姻宫或配偶星与用神一致时，可作为一项正面条件；但用神取法因流派而异，不能据此单独判断婚姻质量。",
      "",
      usefulGodAnalysis,
      "",
      `命局用神为${bazi.usefulElements.join("、") || "无显著偏颇"}。日主强弱：${bazi.strength}。用神在命理中的作用是'雪中送炭'——当婚姻宫或配偶星为用神时，婚姻对你的帮助是实质性的；当婚姻宫或配偶星非用神时，你需要从其他方面获取平衡，婚姻更多是'锦上添花'而非'雪中送炭'。`,
    ].join("\n"),
    highlights: [...bazi.usefulElements.slice(0, 2)],
  });

  // 09: 大运婚姻走势
  const keyLuckLines = luckLines.filter((l) => l.impact !== "无直接引动");
  sections.push({
    title: "大运婚姻走势",
    subtitle: `${bazi.luck.cycles.length}步大运 · ${keyLuckLines.length}步有直接姻缘信号`,
    body: [
      "每一步大运约十年，以下逐运分析对婚姻宫（日支）和配偶星的影响。'当前'标记指引你目前所处的阶段：",
      "",
      ...luckLines.map((l) => `${l.isCurrent ? "▶" : " "} ${l.ganZhi}（${l.ages}）${l.impact !== "平稳期" ? "：" + l.impact : ""}\n   ${l.details}`),
      "",
      "大运分析基于八字起运推算（以月柱顺逆排定）。伏吟主变动，桃花主机遇，配偶星透干主缘分触发，合婚姻宫主稳定和深化，冲婚姻宫主变动和重新定义。",
    ].join("\n"),
    highlights: keyLuckLines.slice(0, 4).map((l) => `${l.ganZhi}：${l.impact}`),
    data: { luckLines, keyCount: keyLuckLines.length, currentIdx: luckLines.findIndex((l) => l.isCurrent) },
  });

  // ---- Headline ----
  const headlineMap: Record<string, string> = {
    "正缘明朗": "配偶星透干有力，姻缘结构清晰",
    "佳期可期": "配偶星有所显现，缘分基础良好",
    "缘待时机": "配偶星偏隐，等待大运引动",
    "水到渠成": "顺其自然，缘分在日常中浮现",
  };

  return {
    id, mode: "solo",
    headline: headlineMap[result.yuanType] ?? "姻缘深度解读",
    summary: (() => {
      const lines: string[] = [];
      lines.push(`${result.person.dayMaster}日主，坐${dayBranch}，${dayChangSheng}在婚姻宫。`);
      if (spouseAnalysis.totalCount > 0) {
        lines.push(`配偶星${spouseAnalysis.quality}，出现${spouseAnalysis.totalCount}次（天干${spouseAnalysis.surfaceCount}、地支${spouseAnalysis.hiddenCount}），缘分信号${spouseAnalysis.totalCount >= 2 ? "清晰" : "可辨"}。`);
      } else {
        lines.push("配偶星不显，缘分待大运流年引动。");
      }
      if (allInteractions.length > 0) {
        const he = allInteractions.filter((i) => i.type === "合" || i.type === "三合" || i.type === "半合");
        const chong = allInteractions.filter((i) => i.type === "冲");
        const parts: string[] = [];
        if (he.length > 0) parts.push(`日支与${he.map((i) => i.target).join("、")}相合`);
        if (chong.length > 0) parts.push(`与${chong.map((i) => i.target).join("、")}相冲`);
        lines.push(`${parts.join("，")}，${chong.length > 0 ? "感情生活中需要应对外部变动。" : "婚姻宫有和谐基础。"}`);
      }
      const timingSummary = "缘分节奏由日主在婚姻宫的能量阶段决定";
      lines.push(`感情模式偏${csMode}，${timingSummary}。`);
      return lines.join("");
    })(),
    createdAt: new Date().toISOString(),
    baziOverview, sections,
  };
}

// ========== Main Build: Pair ==========

export function buildPairDeepReport(
  result: MarriageResult,
  inputs: { personA: { birthDate: string; birthHour: number; gender: string }; personB: { birthDate: string; birthHour: number; gender: string } },
): MarriageDeepReport {
  const id = nextId("mp");
  const sections: DeepReportSection[] = [];
  const a = calculateBazi({ ...inputs.personA, gender: inputs.personA.gender as "male" | "female" });
  const b = calculateBazi({ ...inputs.personB, gender: inputs.personB.gender as "male" | "female" });
  const aPillars = a.pillars, bPillars = b.pillars;

  // ---- 神煞对照 ----
  const shenA = computeShenSha(a.dayMaster, aPillars[0].ganZhi[1], aPillars);
  const shenB = computeShenSha(b.dayMaster, bPillars[0].ganZhi[1], bPillars);
  const { ji: jiA, xiong: xiongA } = shenShaSummary(shenA);
  const { ji: jiB, xiong: xiongB } = shenShaSummary(shenB);
  const mutualJi = jiA.filter((sa) => jiB.some((sb) => sb.name === sa.name));
  const mutualXiong = xiongA.filter((sa) => xiongB.some((sb) => sb.name === sa.name));

  sections.push({
    title: "神煞对照",
    subtitle: `甲方${shenA.length}颗 · 乙方${shenB.length}颗`,
    body: [
      `甲方吉星：${jiA.length > 0 ? jiA.map((s) => `${s.name}（${s.position}）`).join("、") : "无显著吉星"}`,
      `甲方留意：${xiongA.length > 0 ? xiongA.map((s) => `${s.name}（${s.position}）`).join("、") : "无显著凶煞"}`,
      `乙方吉星：${jiB.length > 0 ? jiB.map((s) => `${s.name}（${s.position}）`).join("、") : "无显著吉星"}`,
      `乙方留意：${xiongB.length > 0 ? xiongB.map((s) => `${s.name}（${s.position}）`).join("、") : "无显著凶煞"}`,
      "",
      mutualJi.length > 0 ? `双方共有吉星：${mutualJi.map((s) => s.name).join("、")}。双方共有同一吉星时会产生共振效应——对应领域的正面影响加倍。` : "",
      mutualXiong.length > 0 ? `双方共有需留意标记：${mutualXiong.map((s) => s.name).join("、")}。当双方都有同一信号时需更认真对待——但共同面对也意味着可以一起解决。` : "",
      "",
      "神煞对照看的是双方各自盘中的信号是否同步。一方吉多一方凶多时，吉方需注意不被消耗，凶方需有意识调整。双方皆有吉星时关系更易顺畅推进。",
    ].filter(Boolean).join("\n"),
    highlights: [...new Set([...jiA.map((s) => s.name), ...jiB.map((s) => s.name)])].slice(0, 4),
  });

  // ---- 十二长生交互 ----
  const aDayStem = aPillars[2].ganZhi[0], bDayStem = bPillars[2].ganZhi[0];
  const aDayBranch = aPillars[2].ganZhi[1], bDayBranch = bPillars[2].ganZhi[1];
  const aDayCs = getChangShengStage(aDayStem, aDayBranch), bDayCs = getChangShengStage(bDayStem, bDayBranch);
  const aInB = getChangShengStage(aDayStem, bDayBranch), bInA = getChangShengStage(bDayStem, aDayBranch);
  const positiveStages = ["长生", "沐浴", "冠带", "临官", "帝旺"];

  sections.push({
    title: "十二长生交互",
    subtitle: "双方能量在对方婚姻宫的状态",
    body: [
      `甲方日主${aDayStem}在自身婚姻宫：${aDayCs}　|　在乙方日支：${aInB}${positiveStages.includes(aInB) ? "（正向）" : "（收敛）"}`,
      `乙方日主${bDayStem}在自身婚姻宫：${bDayCs}　|　在甲方日支：${bInA}${positiveStages.includes(bInA) ? "（正向）" : "（收敛）"}`,
      "",
      positiveStages.includes(aInB) && positiveStages.includes(bInA) ? "双方在对方婚姻宫都处于上升阶段——相处时能量互相支持、彼此滋养，是较为理想的互动模式。" : `双方在对方婚姻宫的状态不完全同步（甲方→${aInB}，乙方→${bInA}），关系中存在能量感受的差异。${positiveStages.includes(aInB) ? "甲方在关系中感受更舒适" : "甲方在关系中需要更多调适"}；${positiveStages.includes(bInA) ? "乙方在关系中感受更舒适" : "乙方在关系中需要更多调适"}。` + " 这不代表关系不好，而是需要双方认识到彼此的感受可能不同，并有意识地照顾对方的感受。",
    ].join("\n"),
    highlights: [`甲方→乙方：${aInB}`, `乙方→甲方：${bInA}`],
  });

  // ---- 纳音配对 ----
  const nayinA = aPillars[2].nayin, nayinB = bPillars[2].nayin;
  const nLastA = nayinA[nayinA.length - 1], nLastB = nayinB[nayinB.length - 1];
  const nayinMatch = nLastA === nLastB ? "同气共振" : ["金水", "水金", "木火", "火木", "火土", "土火", "土金", "金土"].includes(nLastA + nLastB) ? "相生滋养" : "各具其韵";
  const nayinExp: Record<string, string> = {
    "同气共振": "双方纳音同气，在精神层面有天然的默契和共鸣。你们的生活节奏、审美趣味趋同——很多事情不需要解释就互相理解。潜在的课题是同质化过高时可能缺少互补的张力。",
    "相生滋养": `甲方日柱纳音${nLastA}气与乙方${nLastB}气形成了生序关系，一方天然倾向于滋养另一方。这种模式在长期关系中非常舒适——被滋养的一方感到安全，滋养的一方感到有意义。需要注意保持滋养与被滋养的动态平衡。`,
    "各具其韵": "双方纳音五行各异，各有各的节奏和韵味。需要更多时间磨合和互相理解，但磨合之后的关系往往比天然契合的关系更加稳固——因为你们是在一起成长而非依赖天然的默契。",
  };

  sections.push({
    title: "纳音深度配对",
    subtitle: `${nayinA} · ${nayinB}`,
    body: [`甲方日柱纳音：${nayinA}（${nLastA}气）`, `乙方日柱纳音：${nayinB}（${nLastB}气）`, "", `配对结果：${nayinMatch}`, "", nayinExp[nayinMatch] ?? "", "", "纳音是八字中更底层的'气场'维度——不直接看吉凶，而看两人在精神气质层面的向性。纳音同气意味着不必言说的默契，纳音相生意味着自然的舒适感，纳音各异意味着需要更多理解对方节奏的时间和耐心。"].join("\n"),
    highlights: [`${nayinA} · ${nayinB}`, nayinMatch],
  });

  // ---- 十神交叉 ----
  const aSS = inputs.personA.gender === "male" ? ["正财", "偏财"] : ["正官", "七杀"];
  const bSS = inputs.personB.gender === "male" ? ["正财", "偏财"] : ["正官", "七杀"];
  const tenLabels = ["年柱", "月柱", "日柱", "时柱"];
  const aInBStars: string[] = [], bInAStars: string[] = [];

  bPillars.forEach((p, i) => {
    if (aSS.includes(p.tenGod)) aInBStars.push(`乙方${tenLabels[i]}天干${p.tenGod}为甲方配偶星`);
    p.hiddenTenGods.filter((t) => aSS.includes(t)).forEach((t) => aInBStars.push(`乙方${tenLabels[i]}藏干${t}为甲方配偶星`));
  });
  aPillars.forEach((p, i) => {
    if (bSS.includes(p.tenGod)) bInAStars.push(`甲方${tenLabels[i]}天干${p.tenGod}为乙方配偶星`);
    p.hiddenTenGods.filter((t) => bSS.includes(t)).forEach((t) => bInAStars.push(`甲方${tenLabels[i]}藏干${t}为乙方配偶星`));
  });

  const crossTotal = aInBStars.length + bInAStars.length;

  sections.push({
    title: "十神交叉配对",
    subtitle: "配偶星在对方盘中的呼应程度",
    body: [
      crossTotal >= 4 ? `配偶星在对方盘中出现${crossTotal}次——信号非常强。传统合婚中这是'天造地设'级别的高分指标：彼此的异性吸引力强烈，第一眼往往就有'对了'的感觉。但强烈的吸引力不等于自动的好相处——后续的日支互动和五行匹配同样重要。` :
        crossTotal >= 2 ? `配偶星在对方盘中有${crossTotal}次呼应——缘分牵引力明显，彼此之间存在真实的吸引力。` :
          crossTotal >= 1 ? `配偶星在对方盘中有${crossTotal}次呼应——有一定缘分牵引但强度偏弱。吸引力存在但不够直接，可能需要更多相处时间才能确认感觉。` :
            "配偶星未在对方盘中明显显现——吸引更多依赖五行和日柱关系而非十神层面。这种关系往往不是'一见钟情'型，而是在相处中逐渐发现对方的可贵。日久生情型的关系往往比一见钟情型更经得起时间考验。",
      "", ...aInBStars, ...bInAStars, "",
      "十神交叉配对是传统合婚中最重要的指标之一。但强烈的吸引力只是关系的起点——后续的日支互动（合冲刑害）和五行匹配决定了这段关系能否从'吸引'走到'长久'。",
    ].join("\n"),
    highlights: crossTotal >= 3 ? [`${crossTotal}次呼应`, "信号强"] : crossTotal >= 1 ? [`${crossTotal}次`, "有呼应"] : ["未见明显互动"],
  });

  // ---- 综合建议 ----
  const allFindings = (result.dimensions ?? []).flatMap((d) => d.findings);
  const jiCount = allFindings.filter((f) => f.level === "合" || f.level === "吉").length;
  const cautionCount = allFindings.filter((f) => f.level === "慎" || f.level === "冲").length;

  sections.push({
    title: "综合建议",
    subtitle: `${jiCount}项匹配 · ${cautionCount}项需留意`,
    body: [
      jiCount >= 3 ? "双方在多个维度上匹配度较高，先天结构适合长期发展。但高匹配度提供的是好的起点——关系的长期质量取决于双方的投入和共同成长。关键是要在'命中注定'的舒适感之外，仍然保持主动经营关系的意识。" :
        cautionCount >= 2 ? "部分维度存在需要留意的信号。很多长期稳定的关系正是在磨合中建立的——提前知道哪里有张力，才能有针对性地经营。专业合婚的目的不是'打分'而是'提供经营地图'。" :
          "整体匹配度中等偏上。关系的走向更多取决于双方的经营而非命理结构。命理分析提供的是底层模式和潜在课题——你们的实际经历和选择才是最终的决定性变量。",
      crossTotal >= 3 ? " 十神交叉互动强，彼此的吸引力是真实且强烈的。建议在享受这种吸引力的同时，也关注日常相处中的磨合和共同目标的建立——吸引力是关系的'发动机'，但相处是关系的'底盘'。" : "",
      mutualJi.length > 0 ? ` 双方共有吉星${mutualJi.map((s) => s.name).join("、")}，在对应领域的运势共振会加强关系的正面体验。` : "",
      "",
      "以上合盘分析基于八字命理传统算法推导，提供的是双方能量互动的底层模式。每段关系都是独一无二的——你们的经历、选择和努力比任何命理维度都重要。",
    ].filter(Boolean).join("\n"),
    highlights: jiCount >= 3 ? ["多维匹配", "适合长期发展"] : ["需要经营", "关注沟通"],
  });

  const headlineMap: Record<string, string> = {
    "天赐良缘": "多维度高度契合", "互补良缘": "五行相生，关键维度和谐", "契合之缘": "多数维度协调", "成长之缘": "磨合中建立更深连结",
  };

  return {
    id, mode: "pair",
    headline: headlineMap[result.yuanType] ?? "合盘深度解读",
    summary: `${a.dayMaster}日主（${a.dominantElement}·${a.zodiac}）与 ${b.dayMaster}日主（${b.dominantElement}·${b.zodiac}），十神交叉${crossTotal}次呼应。`,
    createdAt: new Date().toISOString(),
    sections,
  };
}
