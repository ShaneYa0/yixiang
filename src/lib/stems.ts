import type { ElementName } from "@/lib/types";

export const heavenlyStems = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
export const earthlyBranches = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
export const elements: ElementName[] = ["木", "火", "土", "金", "水"];

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

const branchElements: Record<string, ElementName> = {
  子: "水",
  丑: "土",
  寅: "木",
  卯: "木",
  辰: "土",
  巳: "火",
  午: "火",
  未: "土",
  申: "金",
  酉: "金",
  戌: "土",
  亥: "水",
};

const nayin = [
  "海中金",
  "炉中火",
  "大林木",
  "路旁土",
  "剑锋金",
  "山头火",
  "涧下水",
  "城头土",
  "白蜡金",
  "杨柳木",
  "泉中水",
  "屋上土",
  "霹雳火",
  "松柏木",
  "长流水",
  "砂石金",
  "山下火",
  "平地木",
  "壁上土",
  "金箔金",
  "覆灯火",
  "天河水",
  "大驿土",
  "钗钏金",
  "桑柘木",
  "大溪水",
  "沙中土",
  "天上火",
  "石榴木",
  "大海水",
];

export function ganZhiFromIndex(index: number) {
  const safe = ((index % 60) + 60) % 60;
  return heavenlyStems[safe % 10] + earthlyBranches[safe % 12];
}

export function elementOfGanZhi(ganZhi: string): ElementName {
  return stemElements[ganZhi[0]] ?? branchElements[ganZhi[1]] ?? "土";
}

export function branchElement(branch: string): ElementName {
  return branchElements[branch] ?? "土";
}

export function nayinFromIndex(index: number) {
  return nayin[Math.floor((((index % 60) + 60) % 60) / 2)] ?? "平衡土";
}

export function dayIndex(date: Date) {
  const start = Date.UTC(1984, 1, 2);
  const current = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor((current - start) / 86400000);
}

export function zodiacFromYear(year: number) {
  return ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"][((year - 4) % 12 + 12) % 12];
}
