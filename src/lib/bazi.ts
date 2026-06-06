import type { BaziResult, ElementName, Pillar } from "@/lib/types";
import { elements } from "@/lib/stems";
import { Solar } from "lunar-javascript";
import type { EightChar } from "lunar-javascript";

const stemElements: Record<string, ElementName> = {
  甲: "木",
  乙: "木",
  丙: "火",
  丁: "火",
  戊: "土",
  己: "土",
  庚: "金",
  辛: "金",
  壬: "水",
  癸: "水",
};
const branchElements: Record<string, ElementName[]> = {
  子: ["水"],
  丑: ["土", "水", "金"],
  寅: ["木", "火", "土"],
  卯: ["木"],
  辰: ["土", "木", "水"],
  巳: ["火", "土", "金"],
  午: ["火", "土"],
  未: ["土", "火", "木"],
  申: ["金", "水", "土"],
  酉: ["金"],
  戌: ["土", "金", "火"],
  亥: ["水", "木"],
};
const generating: Record<ElementName, ElementName> = { 木: "火", 火: "土", 土: "金", 金: "水", 水: "木" };
const controlling: Record<ElementName, ElementName> = { 木: "土", 土: "水", 水: "火", 火: "金", 金: "木" };

function addElement(counts: Record<ElementName, number>, element: ElementName, value: number) {
  counts[element] += value;
}

function pillarElement(ganZhi: string): ElementName {
  return stemElements[ganZhi[0]] ?? branchElements[ganZhi[1]]?.[0] ?? "土";
}

function analyzeStrength(dayMaster: ElementName, counts: Record<ElementName, number>) {
  const support = counts[dayMaster] + counts[Object.entries(generating).find(([, to]) => to === dayMaster)?.[0] as ElementName] * 0.65;
  const drain = counts[generating[dayMaster]] + counts[controlling[dayMaster]] * 0.75;
  if (support - drain > 18) return "偏旺";
  if (drain - support > 18) return "偏弱";
  return "中和";
}

function relationText(dayMaster: ElementName, element: ElementName) {
  if (element === dayMaster) return "同气相扶，利于建立稳定节奏，也要避免固执与内耗。";
  if (generating[element] === dayMaster) return "生扶日主，利于学习、资源、人脉与恢复元气。";
  if (generating[dayMaster] === element) return "日主泄秀，利于表达、创作、输出与把想法落到作品。";
  if (controlling[dayMaster] === element) return "日主所克，主财务、资源调度与现实责任，宜稳健经营。";
  return "外部约束较强，利于规则、职位与压力下成长，也需留意身心负荷。";
}

function buildProfessionalReport({
  dayMaster,
  strength,
  dominantElement,
  usefulElements,
  missingElements,
}: {
  dayMaster: ElementName;
  strength: BaziResult["strength"];
  dominantElement: ElementName;
  usefulElements: ElementName[];
  missingElements: ElementName[];
}) {
  const useful = usefulElements.join("、");
  const missing = missingElements.length > 0 ? missingElements.join("、") : "无明显缺项";
  const balanceAdvice =
    strength === "偏旺"
      ? "宜取泄耗与制衡之法，做事不必一味加码，关键在输出、规则和边界。"
      : strength === "偏弱"
        ? "宜重视生扶与蓄势，先稳根基，再谈扩张，避免过早承担过多压力。"
        : "格局较重平衡，取用不宜偏执，顺势调整比单点猛进更重要。";

  return {
    structure: `此盘日主属${dayMaster}，五行以${dominantElement}气最显，缺口为${missing}。整体呈${strength}，${balanceAdvice}`,
    dayMaster: `${dayMaster}日主重承载与转化。判断命盘时，以月令、透干、通根为纲，再看十神是否成局。此盘参考调候可先看${useful}。`,
    career: `事业上宜选择能体现${useful}之性的路径：一方面要有清晰规则，另一方面要允许持续输出与沉淀。遇到压力时，先拆结构，再定优先级。`,
    wealth: `财运不宜只看进账速度，更要看资源调度能力。${relationText(dayMaster, usefulElements[0])} 大额决策适合先做周期评估。`,
    relationship: `感情关系看日支与整体五行互动。此盘适合在稳定节奏里建立信任，表达上要少用判断，多给对方可执行的回应。`,
    health: `健康侧重五行偏性带来的作息提醒。${dominantElement}气偏显时，需注意劳逸节律、脾胃代谢和长期压力的累积。`,
  };
}

function buildLuckCycles(eight: EightChar, gender: "male" | "female") {
  const yun = eight.getYun(gender === "male" ? 1 : 0);
  const cycles = yun
    .getDaYun(10)
    .filter((cycle) => cycle.getGanZhi())
    .slice(0, 8)
    .map((cycle) => {
      const ganZhi = cycle.getGanZhi();
      const element = pillarElement(ganZhi);
      return {
        index: cycle.getIndex(),
        ganZhi,
        startYear: cycle.getStartYear(),
        endYear: cycle.getEndYear(),
        startAge: cycle.getStartAge(),
        endAge: cycle.getEndAge(),
        element,
        theme: relationText(stemElements[eight.getDay()[0]] ?? "土", element),
        years: cycle.getLiuNian(10).map((year) => ({
          year: year.getYear(),
          age: year.getAge(),
          ganZhi: year.getGanZhi(),
        })),
      };
    });
  const currentYear = new Date().getFullYear();

  return {
    startText: `起运：出生后${yun.getStartYear()}年${yun.getStartMonth()}个月${yun.getStartDay()}天${yun.getStartHour()}小时，约 ${yun.getStartSolar().toYmd()} 起运。`,
    currentCycle: cycles.find((cycle) => cycle.startYear <= currentYear && cycle.endYear >= currentYear),
    cycles,
  };
}

export function calculateBazi({
  birthDate,
  birthHour,
  gender,
}: {
  birthDate: string;
  birthHour: number;
  gender: "male" | "female";
}): BaziResult {
  const [year, month, day] = birthDate.split("-").map(Number);
  const lunar = Solar.fromYmdHms(year, month, day, birthHour, 0, 0).getLunar();
  const eight = lunar.getEightChar();
  const ganZhi = [eight.getYear(), eight.getMonth(), eight.getDay(), eight.getTime()];
  const nayin = [eight.getYearNaYin(), eight.getMonthNaYin(), eight.getDayNaYin(), eight.getTimeNaYin()];
  const tenGods = [eight.getYearShiShenGan(), eight.getMonthShiShenGan(), eight.getDayShiShenGan(), eight.getTimeShiShenGan()];
  const hiddenTenGods = [eight.getYearShiShenZhi(), eight.getMonthShiShenZhi(), eight.getDayShiShenZhi(), eight.getTimeShiShenZhi()];
  const xunKong = [eight.getYearXunKong(), eight.getMonthXunKong(), eight.getDayXunKong(), eight.getTimeXunKong()];

  const pillars: Pillar[] = ["年柱", "月柱", "日柱", "时柱"].map((label, index) => ({
    label,
    ganZhi: ganZhi[index],
    nayin: nayin[index],
    element: pillarElement(ganZhi[index]),
    tenGod: tenGods[index],
    hiddenTenGods: hiddenTenGods[index],
    xunKong: xunKong[index],
  }));

  const counts = Object.fromEntries(elements.map((element) => [element, 0])) as Record<ElementName, number>;
  pillars.forEach((pillar) => {
    addElement(counts, stemElements[pillar.ganZhi[0]] ?? "土", 18);
    branchElements[pillar.ganZhi[1]]?.forEach((element, index) => addElement(counts, element, index === 0 ? 12 : 5));
  });

  const dominantElement = elements.reduce((best, element) => (counts[element] > counts[best] ? element : best), "木");
  const missingElements = elements.filter((element) => counts[element] < 12);
  const dayMaster = stemElements[eight.getDay()[0]] ?? "土";
  const strength = analyzeStrength(dayMaster, counts);
  const usefulElements =
    strength === "偏旺"
      ? [generating[dayMaster], controlling[dayMaster]]
      : strength === "偏弱"
        ? [dayMaster, Object.entries(generating).find(([, to]) => to === dayMaster)?.[0] as ElementName]
        : [dominantElement, generating[dominantElement]];
  const professionalReport = buildProfessionalReport({
    dayMaster,
    strength,
    dominantElement,
    usefulElements,
    missingElements,
  });
  const luck = buildLuckCycles(eight, gender);

  return {
    birthDate,
    birthHour,
    gender,
    lunarText: lunar.toString(),
    zodiac: lunar.getYearShengXiao(),
    solarTerm: lunar.getJieQi() || "非节气日",
    prevSolarTerm: lunar.getPrevJieQi().toString(),
    nextSolarTerm: lunar.getNextJieQi().toString(),
    dayMaster,
    pillars,
    elements: counts,
    dominantElement,
    missingElements,
    strength,
    usefulElements,
    taiYuan: eight.getTaiYuan(),
    mingGong: eight.getMingGong(),
    shenGong: eight.getShenGong(),
    professionalReport,
    luck,
    summary:
      missingElements.length > 0
        ? `此盘日主为${dayMaster}，整体呈${strength}之象，五行以${dominantElement}气较显，${missingElements.join("、")}相对不彰。`
        : `此盘日主为${dayMaster}，整体呈${strength}之象，五行流转较齐，以${dominantElement}气最为明显。`,
  };
}
