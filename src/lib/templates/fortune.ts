import type { FortuneResult } from "@/lib/types";
import { getLunarDate } from "@/lib/calendar";

const summaries = [
  "宜稳中求进，先处理已经承诺的事，再开启新计划。",
  "今日贵在收束杂念，把复杂问题拆小，会比硬冲更顺。",
  "人际互动有回暖迹象，主动表达善意容易得到回应。",
  "适合复盘与整理，越清晰的边界越能带来好运。",
];
const colors = ["米白", "松墨", "浅金", "青灰", "茶褐"];
const directions = ["东南", "正南", "西北", "正东", "西南"];

export function getDailyFortune(date = new Date()): FortuneResult {
  const lunar = getLunarDate(date);
  const seed = date.getFullYear() + date.getMonth() * 17 + date.getDate() * 31;
  const score = 68 + (seed % 27);

  return {
    date: date.toISOString().slice(0, 10),
    level: score >= 86 ? "大吉" : score >= 76 ? "小吉" : "平稳",
    score,
    summary: summaries[seed % summaries.length],
    yi: lunar.dayYi.slice(0, 4),
    ji: lunar.dayJi.slice(0, 3),
    luckyHours: ["辰时", "午时", "申时"].filter((_, index) => (seed + index) % 2 === 0),
    luckyColor: colors[seed % colors.length],
    luckyDirection: directions[seed % directions.length],
    details: [
      { label: "事业", value: 70 + (seed % 22), text: "适合推进目标清楚、边界明确的任务。" },
      { label: "财运", value: 64 + (seed % 19), text: "保守评估支出，避免临时冲动。" },
      { label: "感情", value: 72 + (seed % 18), text: "多一句解释，少一次误会。" },
      { label: "健康", value: 66 + (seed % 21), text: "注意睡眠节奏和肩颈放松。" },
    ],
  };
}
