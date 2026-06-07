import type { FortuneResult } from "@/lib/types";
import { getLunarDate } from "@/lib/calendar";

// ── 天干五行 ──
const GAN_ELEMENT: Record<string, string> = {
  甲: "木", 乙: "木", 丙: "火", 丁: "火", 戊: "土",
  己: "土", 庚: "金", 辛: "金", 壬: "水", 癸: "水",
};

// ── 地支五行 ──
const ZHI_ELEMENT: Record<string, string> = {
  子: "水", 丑: "土", 寅: "木", 卯: "木", 辰: "土", 巳: "火",
  午: "火", 未: "土", 申: "金", 酉: "金", 戌: "土", 亥: "水",
};

// ── 地支 → 生肖 ──
const ZHI_ANIMAL: Record<string, string> = {
  子: "鼠", 丑: "牛", 寅: "虎", 卯: "兔", 辰: "龙", 巳: "蛇",
  午: "马", 未: "羊", 申: "猴", 酉: "鸡", 戌: "狗", 亥: "猪",
};

// ── 六冲 ──
const LIU_CHONG: Record<string, string> = {
  子: "午", 午: "子", 丑: "未", 未: "丑",
  寅: "申", 申: "寅", 卯: "酉", 酉: "卯",
  辰: "戌", 戌: "辰", 巳: "亥", 亥: "巳",
};

// ── 六合 ──
const LIU_HE: Record<string, string> = {
  子: "丑", 丑: "子", 寅: "亥", 亥: "寅",
  卯: "戌", 戌: "卯", 辰: "酉", 酉: "辰",
  巳: "申", 申: "巳", 午: "未", 未: "午",
};

// ── 三合 ──
const SAN_HE: Record<string, string[]> = {
  子: ["申", "辰"], 申: ["子", "辰"], 辰: ["申", "子"],
  丑: ["巳", "酉"], 巳: ["丑", "酉"], 酉: ["巳", "丑"],
  寅: ["午", "戌"], 午: ["寅", "戌"], 戌: ["寅", "午"],
  卯: ["亥", "未"], 亥: ["卯", "未"], 未: ["亥", "卯"],
};

// ── 贵人时（日干）──
const GUI_REN_HOURS: Record<string, string[]> = {
  甲: ["丑时", "未时"], 乙: ["子时", "申时"],
  丙: ["亥时", "酉时"], 丁: ["亥时", "酉时"],
  戊: ["丑时", "未时"], 己: ["子时", "申时"],
  庚: ["丑时", "未时"], 辛: ["午时", "寅时"],
  壬: ["卯时", "巳时"], 癸: ["卯时", "巳时"],
};

// ── 五行色 ──
const ELEMENT_COLORS: Record<string, string[]> = {
  木: ["青绿", "翠绿", "竹青"],
  火: ["朱红", "赤霞", "绯红"],
  土: ["驼色", "琥珀", "棕黄"],
  金: ["银灰", "月白", "鎏金"],
  水: ["墨蓝", "玄黑", "黛青"],
};

// ── 喜神方位（日干）──
const XI_SHEN: Record<string, string> = {
  甲: "东北", 乙: "西北", 丙: "西南", 丁: "正南", 戊: "东南",
  己: "东北", 庚: "西北", 辛: "西南", 壬: "正南", 癸: "东南",
};

// ── 日柱解读 ──
const DAY_PILLAR_NOTES: Record<string, string> = {
  甲子: "甲木坐子水，印星生身，利学习思考。",
  乙丑: "乙木坐丑土，财星入库，务实经营为宜。",
  丙寅: "丙火坐寅木，木火通明，创造力旺盛。",
  丁卯: "丁火坐卯木，柔木生火，温和而有韧性。",
  戊辰: "戊土坐辰土，比肩帮身，稳扎稳打。",
  己巳: "己土坐巳火，印星生扶，贵人暗助。",
  庚午: "庚金坐午火，火炼真金，压力即动力。",
  辛未: "辛金坐未土，印星护身，谨言慎行。",
  壬申: "壬水坐申金，金水相生，思路清晰。",
  癸酉: "癸水坐酉金，金生水旺，灵感充沛。",
  甲戌: "甲木坐戌土，燥土培根，行动力强。",
  乙亥: "乙木坐亥水，水润柔木，柔中带刚。",
  丙子: "丙火坐子水，水火既济，保持平衡。",
  丁丑: "丁火坐丑土，火土相生，耐心耕耘。",
  戊寅: "戊土坐寅木，土木交错，遇阻则变。",
  己卯: "己土坐卯木，土木相克，寻人合作。",
  庚辰: "庚金坐辰土，湿土生金，厚积薄发。",
  辛巳: "辛金坐巳火，火炼精金，精益求精。",
  壬午: "壬水坐午火，水火相激，把控情绪。",
  癸未: "癸水坐未土，水土混杂，去芜存菁。",
  甲申: "甲木坐申金，金雕良木，经历成长。",
  乙酉: "乙木坐酉金，金克柔木，守住根本。",
  丙戌: "丙火坐戌土，火库藏光，等待时机。",
  丁亥: "丁火坐亥水，水济灯花，内外和谐。",
  戊子: "戊土坐子水，水润燥土，开源节流。",
  己丑: "己土坐丑土，湿土养物，积累成果。",
  庚寅: "庚金坐寅木，金木交锋，锐意进取。",
  辛卯: "辛金坐卯木，柔木藏金，细处见功。",
  壬辰: "壬水坐辰土，水库蓄势，顺势而为。",
  癸巳: "癸水坐巳火，水火相济，进退有度。",
  甲午: "甲木坐午火，木火相生，热情高涨。",
  乙未: "乙木坐未土，木克燥土，量力而行。",
  丙申: "丙火坐申金，火金相制，以柔克刚。",
  丁酉: "丁火坐酉金，火金交辉，贵气暗藏。",
  戊戌: "戊土坐戌土，比肩厚重，自信前行。",
  己亥: "己土坐亥水，水土交战，稳健为上。",
  庚子: "庚金坐子水，金沉水底，守心自持。",
  辛丑: "辛金坐丑土，金入金库，自省复盘。",
  壬寅: "壬水坐寅木，水润青木，新机萌发。",
  癸卯: "癸水坐卯木，雨露润物，和气生财。",
  甲辰: "甲木坐辰土，湿土培木，向上生长。",
  乙巳: "乙木坐巳火，木火通明，展现才华。",
  丙午: "丙火坐午火，烈日当空，光芒尽显。",
  丁未: "丁火坐未土，余烬温土，细水长流。",
  戊申: "戊土坐申金，土生金泄，分享共赢。",
  己酉: "己土坐酉金，土生金旺，借力成事。",
  庚戌: "庚金坐戌土，燥土埋金，去除杂念。",
  辛亥: "辛金坐亥水，水净金明，智慧通透。",
  壬子: "壬水坐子水，汪洋之水，气度恢弘。",
  癸丑: "癸水坐丑土，水土相蓄，内敛沉静。",
  甲寅: "甲木坐寅木，纯木参天，独立自主。",
  乙卯: "乙木坐卯木，柔木成林，合作共赢。",
  丙辰: "丙火坐辰土，火被土晦，养精蓄锐。",
  丁巳: "丁火坐巳火，灯烛通明，贵人提携。",
  戊午: "戊土坐午火，燥土得火，谨防火燥。",
  己未: "己土坐未土，厚土载物，稳中有进。",
  庚申: "庚金坐申金，纯金坚刚，决断力强。",
  辛酉: "辛金坐酉金，精金纯粹，细致入微。",
  壬戌: "壬水坐戌土，水为土制，自我约束。",
  癸亥: "癸水坐亥水，纯水至柔，顺势而为。",
};

// ── 箴言库（按五行分类）──
const PROVERBS: Record<string, string[]> = {
  木: [
    "「木欣欣以向荣，泉涓涓而始流。」— 陶渊明",
    "「合抱之木，生于毫末。」— 《道德经》",
    "「岁寒，然后知松柏之后凋也。」— 《论语》",
  ],
  火: [
    "「星星之火，可以燎原。」— 《尚书》",
    "「日就月将，学有缉熙于光明。」— 《诗经》",
    "「明入地中，明夷。君子以莅众，用晦而明。」— 《周易》",
  ],
  土: [
    "「地势坤，君子以厚德载物。」— 《周易》",
    "「泰山不让土壤，故能成其大。」— 李斯",
    "「安土敦乎仁，故能爱。」— 《周易》",
  ],
  金: [
    "「它山之石，可以攻玉。」— 《诗经》",
    "「玉不琢，不成器。」— 《礼记》",
    "「锲而不舍，金石可镂。」— 《荀子》",
  ],
  水: [
    "「上善若水，水善利万物而不争。」— 《道德经》",
    "「逝者如斯夫，不舍昼夜。」— 《论语》",
    "「海纳百川，有容乃大。」— 林则徐",
  ],
};

type ElementKey = "木" | "火" | "土" | "金" | "水";

// ── 关键词库（按评分+五行）──
function pickKeywords(score: number, dayElement: string): string[] {
  const high: Record<ElementKey, string[]> = {
    木: ["生长", "开创", "拓展"],
    火: ["热情", "表达", "行动"],
    土: ["厚实", "积累", "稳定"],
    金: ["决断", "精进", "收获"],
    水: ["智慧", "变通", "沉淀"],
  };
  const mid: Record<ElementKey, string[]> = {
    木: ["耐心", "扎根", "磨合"],
    火: ["克制", "内观", "调适"],
    土: ["守成", "梳理", "等待"],
    金: ["雕琢", "反思", "收敛"],
    水: ["顺势", "柔韧", "观察"],
  };
  const low: Record<ElementKey, string[]> = {
    木: ["蛰伏", "修整", "退守"],
    火: ["静心", "休养", "回避"],
    土: ["从简", "守静", "不求"],
    金: ["藏锋", "忍耐", "退一步"],
    水: ["潜渊", "待时", "简朴"],
  };

  const key = dayElement as ElementKey;
  const pool = score >= 72 ? high[key] : score >= 50 ? mid[key] : low[key];
  return pool;
}

/**
 * 基于真实黄历数据生成每日运势解读。
 */
export function getDailyFortune(date = new Date()): FortuneResult {
  const lunar = getLunarDate(date);
  const dayPillar = lunar.dayInGanZhi;
  const dayGan = dayPillar[0];
  const dayZhi = dayPillar[1];
  const dayElement = GAN_ELEMENT[dayGan] || "土";

  // ── 评分 ──
  const jiShenCount = lunar.dayJiShen.length;
  const xiongShaCount = lunar.dayXiongSha.length;
  const rawScore = 62 + jiShenCount * 5 - xiongShaCount * 6;
  const score = Math.max(25, Math.min(98, rawScore));

  // ── 等级 ──
  const level =
    score >= 88 ? "大吉" :
    score >= 72 ? "小吉" :
    score >= 56 ? "平稳" :
    score >= 42 ? "欠佳" : "谨慎";

  // ── 幸运色/吉方/贵人时 ──
  const colors = ELEMENT_COLORS[dayElement];
  const luckyColor = colors[(date.getFullYear() + date.getMonth() + date.getDate()) % colors.length];
  const luckyDirection = XI_SHEN[dayGan] || lunar.dayPosition.xi;
  const luckyHours = GUI_REN_HOURS[dayGan] || ["午时"];

  // ── 生肖日运 ──
  const chongZhi = LIU_CHONG[dayZhi] || "";
  const heZhi = LIU_HE[dayZhi] || "";
  const sanHeZhi = SAN_HE[dayZhi] || [];
  const zodiacGuide = {
    clash: ZHI_ANIMAL[chongZhi] || "",
    harmony: ZHI_ANIMAL[heZhi] || "",
    tripleHarmony: sanHeZhi.map((z) => ZHI_ANIMAL[z] || "").join("、"),
  };

  // ── 关键词 + 箴言 ──
  const keywords = pickKeywords(score, dayElement);
  const proverbList = PROVERBS[dayElement];
  const proverb = proverbList[seedFromDate(date) % proverbList.length];

  // ── 综合描述 ──
  const summary = buildSummary(lunar, dayPillar, score);

  // ── 四项走势 ──
  const details = buildDetails(dayPillar, dayElement, score);

  return {
    date: date.toISOString().slice(0, 10),
    lunarDate: `${lunar.yearInGanZhi}年 ${lunar.lunarMonthName}${lunar.lunarDayName}`,
    dayPillar,
    dayElement,
    dayNayin: lunar.dayNaYin,
    dayLu: lunar.dayLu,
    level,
    score,
    summary,
    keywords,
    proverb,
    luckyHours,
    luckyColor,
    luckyDirection,
    zodiacGuide,
    details,
  };
}

function seedFromDate(date: Date): number {
  return date.getFullYear() + date.getMonth() * 31 + date.getDate() * 7;
}

function buildSummary(lunar: ReturnType<typeof getLunarDate>, dayPillar: string, score: number): string {
  const parts: string[] = [];
  const note = DAY_PILLAR_NOTES[dayPillar];
  if (note) parts.push(note);
  if (lunar.solarTerm) parts.push(`今日${lunar.solarTerm}，节气交替之际，宜顺应天时。`);
  if (score >= 88) parts.push("今日气运通达，宜积极行动。");
  else if (score >= 72) parts.push("整体运势向好，顺势而为可成。");
  else if (score >= 56) parts.push("平稳之日，不宜冒进，守成为上。");
  else if (score >= 42) parts.push("今日宜静不宜动，小事可行大事暂缓。");
  else parts.push("诸事不宜强求，韬光养晦方为上策。");
  return parts.join("");
}

function buildDetails(
  dayPillar: string,
  dayElement: string,
  score: number,
): { label: string; value: number; text: string }[] {
  const zhiElement = ZHI_ELEMENT[dayPillar[1]] || dayElement;
  const career = clamp(score + (dayElement === "火" || dayElement === "金" ? 5 : -3), 35, 95);
  const wealth = clamp(score + (dayElement === "土" || dayElement === "水" ? 7 : -5), 30, 95);
  const love = clamp(score + (dayElement === "木" || dayElement === "水" ? 5 : -2), 35, 95);
  const health = clamp(score + (dayElement === "火" ? -3 : 3), 35, 95);

  return [
    { label: "事业", value: career, text: buildCareerText(career) },
    { label: "财运", value: wealth, text: buildWealthText(wealth) },
    { label: "感情", value: love, text: buildLoveText(love) },
    { label: "健康", value: health, text: buildHealthText(health, zhiElement) },
  ];
}

function buildCareerText(v: number): string {
  if (v >= 80) return "贵人运旺，适合谈判、签约与推进关键项目。";
  if (v >= 65) return "按部就班推进计划，稳扎稳打即有收获。";
  if (v >= 50) return "宜处理常规事务，大决策暂时搁置。";
  return "阻力较大，建议以学习、整理、准备为主。";
}
function buildWealthText(v: number): string {
  if (v >= 80) return "正偏财皆旺，适合理财规划和适度投资。";
  if (v >= 65) return "正财稳定，控制不必要的开支即可。";
  if (v >= 50) return "财运平淡，避免冲动消费和借贷。";
  return "财星受制，守住现金为上，不宜有大额支出。";
}
function buildLoveText(v: number): string {
  if (v >= 80) return "桃花运旺，单身者有机会结识心仪对象，有伴者感情升温。";
  if (v >= 65) return "关系和谐，多沟通多倾听，小惊喜能增温。";
  if (v >= 50) return "感情平淡，保持耐心，忌翻旧账。";
  return "易生误会，话说三分留余地，多一事不如少一事。";
}
function buildHealthText(v: number, zhiElement: string): string {
  if (zhiElement === "火") return v >= 70 ? "精力充沛，适合运动锻炼，注意补水降火。" : "心火易旺，注意情绪管理和睡眠质量。";
  if (zhiElement === "水") return v >= 70 ? "状态良好，适合温和运动，注意腰部保暖。" : "肾水易耗，避免熬夜，多休息养神。";
  if (zhiElement === "木") return v >= 70 ? "身体轻快，适合户外活动，注意肝胆保养。" : "肝气易郁，少饮酒，保持心情舒畅。";
  if (zhiElement === "金") return v >= 70 ? "体质稳健，注意呼吸道保养，多通风。" : "肺气偏弱，注意保暖防寒，少吸烟。";
  return v >= 70 ? "脾胃调和，适合规律饮食，注意控制甜食。" : "脾胃易滞，饮食清淡规律，少吃生冷。";
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
