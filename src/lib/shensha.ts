/**
 * 姻缘神煞系统
 * 基于标准八字口诀计算，结合 lunar-javascript 的十二长生
 */

import type { Pillar } from "@/lib/types";

// ========== 十二长生 ==========

export const changSheng = ["长生", "沐浴", "冠带", "临官", "帝旺", "衰", "病", "死", "墓", "绝", "胎", "养"];

/** 天干在地支上的十二长生位置表（阳干顺行，阴干逆行） */
const changShengStart: Record<string, string> = {
  "甲": "亥", "乙": "午", "丙": "寅", "丁": "酉",
  "戊": "寅", "己": "酉", "庚": "巳", "辛": "子",
  "壬": "申", "癸": "卯",
};

const branchOrder = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

/** 获取天干在地支上的十二长生状态 */
export function getChangShengStage(stem: string, branch: string): string {
  const start = changShengStart[stem];
  if (!start) return "养";
  const startIdx = branchOrder.indexOf(start);
  const branchIdx = branchOrder.indexOf(branch);
  const offset = (branchIdx - startIdx + 12) % 12;
  // 阴干逆行
  const isYin = ["乙", "丁", "己", "辛", "癸"].includes(stem);
  const idx = isYin ? (12 - offset) % 12 : offset;
  return changSheng[idx];
}

// ========== 神煞 ==========

export type ShenShaItem = {
  name: string;
  category: "吉" | "凶" | "中性";
  position: string; // 所在的柱位
  detail: string; // 具体说明
  meaning: string; // 姻缘含义
};

/** 天乙贵人 — 最大吉星 */
const tianYiMap: Record<string, string[]> = {
  "甲": ["丑", "未"], "戊": ["丑", "未"], "庚": ["丑", "未"],
  "乙": ["子", "申"], "己": ["子", "申"],
  "丙": ["亥", "酉"], "丁": ["亥", "酉"],
  "壬": ["卯", "巳"], "癸": ["卯", "巳"],
  "辛": ["午", "寅"],
};

/** 红鸾 — 正姻缘星 */
const hongLuanMap: Record<string, string> = {
  "子": "卯", "丑": "寅", "寅": "丑", "卯": "子",
  "辰": "亥", "巳": "戌", "午": "酉", "未": "申",
  "申": "未", "酉": "午", "戌": "巳", "亥": "辰",
};

/** 天喜 — 红鸾的对宫 */
const tianXiMap: Record<string, string> = {
  "卯": "酉", "寅": "申", "丑": "未", "子": "午",
  "亥": "巳", "戌": "辰", "酉": "卯", "申": "寅",
  "未": "丑", "午": "子", "巳": "亥", "辰": "戌",
};

/** 咸池（桃花）— 申子辰在酉，寅午戌在卯，亥卯未在子，巳酉丑在午 */
const xianChiBranch: Record<string, string> = {
  "申": "酉", "子": "酉", "辰": "酉",
  "寅": "卯", "午": "卯", "戌": "卯",
  "亥": "子", "卯": "子", "未": "子",
  "巳": "午", "酉": "午", "丑": "午",
};

/** 孤辰 — 姻缘偏晚 */
const guChenBranch: Record<string, string> = {
  "亥": "寅", "子": "寅", "丑": "寅",
  "寅": "巳", "卯": "巳", "辰": "巳",
  "巳": "申", "午": "申", "未": "申",
  "申": "亥", "酉": "亥", "戌": "亥",
};

/** 寡宿 — 姻缘偏晚 */
const guaSuBranch: Record<string, string> = {
  "亥": "戌", "子": "戌", "丑": "戌",
  "寅": "丑", "卯": "丑", "辰": "丑",
  "巳": "辰", "午": "辰", "未": "辰",
  "申": "未", "酉": "未", "戌": "未",
};

/** 孤鸾煞日柱 — 甲寅/乙卯/丙午/丁巳/戊午/己巳/庚申/辛亥/壬子/癸亥 */
const guLuanDayPillars = new Set([
  "甲寅", "乙卯", "丙午", "丁巳", "戊午",
  "己巳", "庚申", "辛亥", "壬子", "癸亥",
]);

/** 阴差阳错日柱 — 丙子/丙午/丁丑/丁未/戊寅/戊申/辛卯/辛酉/壬辰/壬戌/癸巳/癸亥 */
const yinChaYangCuo = new Set([
  "丙子", "丙午", "丁丑", "丁未", "戊寅", "戊申",
  "辛卯", "辛酉", "壬辰", "壬戌", "癸巳", "癸亥",
]);

/** 文昌贵人 */
const wenChangMap: Record<string, string> = {
  "甲": "巳", "乙": "午", "丙": "申", "丁": "酉", "戊": "申",
  "己": "酉", "庚": "亥", "辛": "子", "壬": "寅", "癸": "卯",
};

/** 学堂 */
const xueTangMap: Record<string, string> = {
  "甲": "亥", "乙": "午", "丙": "寅", "丁": "酉",
  "戊": "寅", "己": "酉", "庚": "巳", "辛": "子",
  "壬": "申", "癸": "卯",
};

/** 华盖：申子辰见辰，寅午戌见戌，亥卯未见未，巳酉丑见丑 */
const huaGaiBranch: Record<string, string> = {
  "申": "辰", "子": "辰", "辰": "辰",
  "寅": "戌", "午": "戌", "戌": "戌",
  "亥": "未", "卯": "未", "未": "未",
  "巳": "丑", "酉": "丑", "丑": "丑",
};

/** 驿马：申子辰在寅，寅午戌在申，亥卯未在巳，巳酉丑在亥 */
const yiMaBranch: Record<string, string> = {
  "申": "寅", "子": "寅", "辰": "寅",
  "寅": "申", "午": "申", "戌": "申",
  "亥": "巳", "卯": "巳", "未": "巳",
  "巳": "亥", "酉": "亥", "丑": "亥",
};

/** 禄神：甲禄寅，乙禄卯，丙戊禄巳，丁己禄午，庚禄申，辛禄酉，壬禄亥，癸禄子 */
const luShenMap: Record<string, string> = {
  "甲": "寅", "乙": "卯", "丙": "巳", "丁": "午", "戊": "巳",
  "己": "午", "庚": "申", "辛": "酉", "壬": "亥", "癸": "子",
};

/** 羊刃：甲刃卯，乙刃寅，丙戊刃午，丁己刃巳，庚刃酉，辛刃申，壬刃子，癸刃亥 */
const yangRenMap: Record<string, string> = {
  "甲": "卯", "乙": "寅", "丙": "午", "丁": "巳", "戊": "午",
  "己": "巳", "庚": "酉", "辛": "申", "壬": "子", "癸": "亥",
};

/** 劫煞：申子辰在巳，寅午戌在亥，亥卯未在申，巳酉丑在寅 */
const jieShaBranch: Record<string, string> = {
  "申": "巳", "子": "巳", "辰": "巳",
  "寅": "亥", "午": "亥", "戌": "亥",
  "亥": "申", "卯": "申", "未": "申",
  "巳": "寅", "酉": "寅", "丑": "寅",
};

/** 亡神：申子辰在亥，寅午戌在巳，亥卯未在寅，巳酉丑在申 */
const wangShenBranch: Record<string, string> = {
  "申": "亥", "子": "亥", "辰": "亥",
  "寅": "巳", "午": "巳", "戌": "巳",
  "亥": "寅", "卯": "寅", "未": "寅",
  "巳": "申", "酉": "申", "丑": "申",
};

/** 金舆：甲龙乙蛇丙戊羊，丁己猴庚犬辛虎壬猪 */
const jinYuMap: Record<string, string> = {
  "甲": "辰", "乙": "巳", "丙": "未", "丁": "申", "戊": "未",
  "己": "申", "庚": "戌", "辛": "亥", "壬": "丑", "癸": "寅",
};

/** 红艳煞：甲乙见午，丙见寅，丁见未，戊己见辰，庚见戌，辛见酉，壬见子，癸见申 */
const hongYanMap: Record<string, string[]> = {
  "甲": ["午"], "乙": ["午"],
  "丙": ["寅"], "丁": ["未"],
  "戊": ["辰"], "己": ["辰"],
  "庚": ["戌"], "辛": ["酉"],
  "壬": ["子"], "癸": ["申"],
};

/** 魁罡日柱：庚辰/庚戌/壬辰/戊戌 */
const kuiGangPillars = new Set(["庚辰", "庚戌", "壬辰", "戊戌"]);

export function computeShenSha(dayStem: string, yearBranch: string, pillars: Pillar[]): ShenShaItem[] {
  const result: ShenShaItem[] = [];
  const labels = ["年柱", "月柱", "日柱", "时柱"];
  const dayPillarGanZhi = pillars[2].ganZhi;

  // 天乙贵人
  const tianYi = tianYiMap[dayStem] ?? [];
  pillars.forEach((p, i) => {
    if (tianYi.includes(p.ganZhi[1])) {
      result.push({
        name: "天乙贵人",
        category: "吉",
        position: labels[i],
        detail: `${p.ganZhi}坐天乙贵人`,
        meaning: "最大吉星，逢凶化吉，感情中遇到困难容易有贵人相助",
      });
    }
  });

  // 红鸾
  if (hongLuanMap[yearBranch]) {
    const hl = hongLuanMap[yearBranch];
    pillars.forEach((p, i) => {
      if (p.ganZhi[1] === hl) {
        result.push({
          name: "红鸾",
          category: "吉",
          position: labels[i],
          detail: `${p.ganZhi}坐红鸾星`,
          meaning: "正姻缘星，命带红鸾感情层面不容易落空，适婚年龄遇之常有婚恋事件",
        });
      }
    });
  }

  // 天喜
  if (tianXiMap[yearBranch]) {
    const tx = tianXiMap[yearBranch];
    pillars.forEach((p, i) => {
      if (p.ganZhi[1] === tx) {
        result.push({
          name: "天喜",
          category: "吉",
          position: labels[i],
          detail: `${p.ganZhi}坐天喜星`,
          meaning: "喜事星，与红鸾相辅相成，主婚恋喜庆之事",
        });
      }
    });
  }

  // 咸池（桃花）
  if (xianChiBranch[yearBranch]) {
    const xc = xianChiBranch[yearBranch];
    pillars.forEach((p, i) => {
      if (p.ganZhi[1] === xc) {
        result.push({
          name: "咸池",
          category: "中性",
          position: labels[i],
          detail: `${p.ganZhi}坐咸池桃花`,
          meaning: "桃花星，主异性缘和感情机遇。旺则机会多需筛选，弱则需主动创造社交场景",
        });
      }
    });
  }

  // 孤辰
  if (guChenBranch[yearBranch]) {
    const gc = guChenBranch[yearBranch];
    pillars.forEach((p, i) => {
      if (p.ganZhi[1] === gc) {
        result.push({
          name: "孤辰",
          category: "凶",
          position: labels[i],
          detail: `${p.ganZhi}犯孤辰`,
          meaning: "姻缘中的减速信号，倾向独立自主，感情节奏偏慢偏晚",
        });
      }
    });
  }

  // 寡宿
  if (guaSuBranch[yearBranch]) {
    const gs = guaSuBranch[yearBranch];
    pillars.forEach((p, i) => {
      if (p.ganZhi[1] === gs) {
        result.push({
          name: "寡宿",
          category: "凶",
          position: labels[i],
          detail: `${p.ganZhi}犯寡宿`,
          meaning: "倾向独处或对伴侣要求较高，感情中容易宁缺毋滥",
        });
      }
    });
  }

  // 孤鸾煞
  if (guLuanDayPillars.has(dayPillarGanZhi)) {
    result.push({
      name: "孤鸾煞",
      category: "凶",
      position: "日柱",
      detail: `日柱${dayPillarGanZhi}为孤鸾日`,
      meaning: "传统合婚中较为重视的配置，主婚姻中需要更多沟通和包容",
    });
  }

  // 阴差阳错
  if (yinChaYangCuo.has(dayPillarGanZhi)) {
    result.push({
      name: "阴差阳错",
      category: "凶",
      position: "日柱",
      detail: `日柱${dayPillarGanZhi}为阴差阳错日`,
      meaning: "夫妻关系容易出现摩擦和误会，需要更多有意识的经营和沟通",
    });
  }

  // 禄神
  const luBranch = luShenMap[dayStem];
  if (luBranch) {
    pillars.forEach((p, i) => {
      if (p.ganZhi[1] === luBranch) {
        result.push({
          name: "禄神",
          category: "吉",
          position: labels[i],
          detail: `${p.ganZhi}坐禄神`,
          meaning: "自我根基稳固，感情中不容易失去自我，有独立而稳定的人格吸引力",
        });
      }
    });
  }

  // 羊刃
  const yangRenBranch = yangRenMap[dayStem];
  if (yangRenBranch) {
    pillars.forEach((p, i) => {
      if (p.ganZhi[1] === yangRenBranch) {
        result.push({
          name: "羊刃",
          category: "凶",
          position: labels[i],
          detail: `${p.ganZhi}坐羊刃`,
          meaning: "性格刚烈，感情中容易出现情绪化冲突，需注意控制脾气和给对方空间",
        });
      }
    });
  }

  // 驿马
  const yiMaB = yiMaBranch[yearBranch];
  if (yiMaB) {
    pillars.forEach((p, i) => {
      if (p.ganZhi[1] === yiMaB) {
        result.push({
          name: "驿马",
          category: "中性",
          position: labels[i],
          detail: `${p.ganZhi}坐驿马`,
          meaning: "动中求缘，感情机会可能在出行、迁移或环境变化中出现",
        });
      }
    });
  }

  // 华盖
  const hg = huaGaiBranch[yearBranch];
  if (hg) {
    pillars.forEach((p, i) => {
      if (p.ganZhi[1] === hg) {
        result.push({
          name: "华盖",
          category: "中性",
          position: labels[i],
          detail: `${p.ganZhi}坐华盖`,
          meaning: "气质清高，对伴侣要求偏精神层面，宁缺毋滥的倾向明显",
        });
      }
    });
  }

  // 文昌贵人
  const wenB = wenChangMap[dayStem];
  if (wenB) {
    pillars.forEach((p, i) => {
      if (p.ganZhi[1] === wenB) {
        result.push({
          name: "文昌贵人",
          category: "吉",
          position: labels[i],
          detail: `${p.ganZhi}坐文昌贵人`,
          meaning: "聪明有才情，容易通过学习、文化场合或共同兴趣结识伴侣",
        });
      }
    });
  }

  // 学堂
  const xt = xueTangMap[dayStem];
  if (xt) {
    pillars.forEach((p, i) => {
      if (p.ganZhi[1] === xt && i === 2) {
        result.push({
          name: "学堂",
          category: "吉",
          position: labels[i],
          detail: `${p.ganZhi}坐学堂`,
          meaning: "学习能力和成长意识强，关系中愿意反思和调整自己",
        });
      }
    });
  }

  // 劫煞
  const js = jieShaBranch[yearBranch];
  if (js) {
    pillars.forEach((p, i) => {
      if (p.ganZhi[1] === js) {
        result.push({
          name: "劫煞",
          category: "凶",
          position: labels[i],
          detail: `${p.ganZhi}犯劫煞`,
          meaning: "感情中需注意第三方干扰，或对方身边出现竞争者",
        });
      }
    });
  }

  // 亡神
  const ws = wangShenBranch[yearBranch];
  if (ws) {
    pillars.forEach((p, i) => {
      if (p.ganZhi[1] === ws) {
        result.push({
          name: "亡神",
          category: "凶",
          position: labels[i],
          detail: `${p.ganZhi}犯亡神`,
          meaning: "情绪波动较大，感情中容易因小事产生不必要的消耗",
        });
      }
    });
  }

  // 金舆
  const jy = jinYuMap[dayStem];
  if (jy) {
    pillars.forEach((p, i) => {
      if (p.ganZhi[1] === jy) {
        result.push({
          name: "金舆",
          category: "吉",
          position: labels[i],
          detail: `${p.ganZhi}坐金舆`,
          meaning: "有贵人运，伴侣往往条件不错，或在关键时刻能得到外界帮助",
        });
      }
    });
  }

  // 红艳煞
  const hy = hongYanMap[dayStem];
  if (hy) {
    pillars.forEach((p, i) => {
      if (hy.includes(p.ganZhi[1])) {
        result.push({
          name: "红艳煞",
          category: "中性",
          position: labels[i],
          detail: `${p.ganZhi}坐红艳`,
          meaning: "异性吸引力强，桃花旺盛但需注意感情中避免过于浪漫主义",
        });
      }
    });
  }

  // 魁罡
  if (kuiGangPillars.has(dayPillarGanZhi)) {
    result.push({
      name: "魁罡",
      category: "中性",
      position: "日柱",
      detail: `日柱${dayPillarGanZhi}为魁罡日`,
      meaning: "性格强势独立，感情中不容被轻视，需要对方有足够的包容和尊重",
    });
  }

  return result;
}

/** 汇总神煞，返回按类别分组的文本 */
export function shenShaSummary(items: ShenShaItem[]): {
  ji: ShenShaItem[];
  neutral: ShenShaItem[];
  xiong: ShenShaItem[];
} {
  return {
    ji: items.filter((s) => s.category === "吉"),
    neutral: items.filter((s) => s.category === "中性"),
    xiong: items.filter((s) => s.category === "凶"),
  };
}
