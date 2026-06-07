import hexagrams from "@/lib/iching-data";
import type { HexagramData } from "@/lib/iching-data";

export type IchingResult = {
  hexagramNumber: number;
  hexagramChar: string;
  chineseName: string;
  upperTrigram: string;
  lowerTrigram: string;
  judgment: string;
  image: string;
  changingLine: number;
  changingLineText?: string;
  changedHexagram?: { number: number; name: string; char: string; judgment: string };
};

function getHexagram(index: number): HexagramData {
  // index is 0-63
  return hexagrams[index] ?? hexagrams[0];
}

/** 三爻 → 八卦名（bit0=初爻, true=阴爻, false=阳爻） */
function trigramName(yao3: boolean[]): string {
  const [b0, b1, b2] = yao3;
  if (!b0 && !b1 && !b2) return "乾"; // ☰
  if ( b0 && !b1 && !b2) return "兑"; // ☱
  if (!b0 &&  b1 && !b2) return "离"; // ☲
  if ( b0 &&  b1 && !b2) return "震"; // ☳
  if (!b0 && !b1 &&  b2) return "巽"; // ☴
  if ( b0 && !b1 &&  b2) return "坎"; // ☵
  if (!b0 &&  b1 &&  b2) return "艮"; // ☶
  return "坤"; // ☷
}

/** 六爻 → 在 hexagrams 数组中的位置（匹配上下卦） */
function yaoToIndex(yao: boolean[]): number {
  const lower = trigramName([yao[0], yao[1], yao[2]]); // 下卦 = 初爻+二爻+三爻
  const upper = trigramName([yao[3], yao[4], yao[5]]); // 上卦 = 四爻+五爻+上爻
  const found = hexagrams.findIndex(
    (h) => h.lowerTrigram === lower && h.upperTrigram === upper,
  );
  return found >= 0 ? found : 0;
}

export function castIching(question = "", yao?: boolean[]): IchingResult {
  let index: number;
  let seed: number;
  if (yao && yao.length === 6) {
    index = yaoToIndex(yao);
    seed = index + [...question].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  } else {
    seed = Date.now() + [...question].reduce((sum, char) => sum + char.charCodeAt(0), 0);
    index = ((seed % 64) + 64) % 64;
  }
  const hexagram = getHexagram(index);
  const changingLine = (seed % 6) + 1;
  const changedIndex = ((index + changingLine * 7) % 64 + 64) % 64;
  const changedHexagram = getHexagram(changedIndex);

  return {
    hexagramNumber: hexagram.index,
    hexagramChar: hexagram.char,
    chineseName: hexagram.name,
    upperTrigram: hexagram.upperTrigram,
    lowerTrigram: hexagram.lowerTrigram,
    judgment: hexagram.judgment,
    image: hexagram.image,
    changingLine,
    changingLineText: `第${changingLine}爻动：${hexagram.lines[changingLine - 1]}`,
    changedHexagram: {
      number: changedHexagram.index,
      name: changedHexagram.name,
      char: changedHexagram.char,
      judgment: changedHexagram.judgment,
    },
  };
}

export function getIchingFreeReading(result: IchingResult) {
  return [
    `${result.chineseName}（${result.hexagramChar}）：${result.judgment}`,
    result.image
      ? `象曰：${result.image}`
      : "",
    result.changingLineText ?? "无动爻时，以本卦为主，宜静观其变。",
    result.changedHexagram
      ? `变卦为${result.changedHexagram.name}（${result.changedHexagram.char}），${result.changedHexagram.judgment}`
      : "",
    "免费解卦提供方向性参考；深度解读会结合所问事项拆分成行动建议。",
  ].filter(Boolean).join("\n\n");
}
