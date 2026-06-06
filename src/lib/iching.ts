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

export function castIching(question = ""): IchingResult {
  const seed = Date.now() + [...question].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const index = ((seed % 64) + 64) % 64;
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
