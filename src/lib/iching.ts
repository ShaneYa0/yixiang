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
  const lines: string[] = [];

  // 本卦总论
  lines.push(`本卦为${result.chineseName}（${result.hexagramChar}），${result.upperTrigram}上${result.lowerTrigram}下。`);
  lines.push(`卦辞曰：「${result.judgment}」`);

  // 大象传
  if (result.image) {
    lines.push(`《象》曰：「${result.image}」大象揭示本卦所象之自然格局与君子取法之道，是解读整体趋势的核心依据。`);
  }

  // 动爻分析
  if (result.changingLineText) {
    lines.push(`\n动在${result.changingLine}爻。`);
    lines.push(`爻辞：「${result.changingLineText.replace(/^第\d+爻动：/, "")}」`);
    lines.push(
      `此爻为全卦机变所在。所占之事若处${result.changingLine}爻之位，当以本爻爻辞为主，结合上下爻位关系判断进退时机。`,
    );
  }

  // 变卦
  if (result.changedHexagram) {
    lines.push(
      `\n本卦动而之${result.changedHexagram.name}（${result.changedHexagram.char}）。`,
    );
    lines.push(
      `之卦辞曰：「${result.changedHexagram.judgment}」`,
    );
    lines.push(
      `之卦代表事态发展的可能走向。本卦为体、之卦为用：观本卦以明当前所处，察之卦以知演变趋势。`,
    );
  }

  // 解卦要点
  lines.push(`\n【解卦要点】`);
  lines.push(
    `一、先定体用：以本卦为体（现状、自身），之卦为用（发展、环境），动爻为机（转变关键）。`,
  );
  lines.push(
    `二、次看爻位：动爻所处之位（初、二、三、四、五、上）对应事态发展的阶段——初为事始、二为初成、三为小成、四为转折、五为鼎盛、上为终极。`,
  );
  lines.push(
    `三、再察卦德：${result.upperTrigram}为${trigramVirtue(result.upperTrigram)}，${result.lowerTrigram}为${trigramVirtue(result.lowerTrigram)}，上下卦德之关系是判断吉凶顺逆的深层依据。`,
  );
  lines.push(
    `四、综合裁断：以上三者合参，不可执一废百。卦辞定大方向，爻辞断具体事，之卦推演变势。`,
  );

  return lines.join("\n");
}

function trigramVirtue(name: string): string {
  const map: Record<string, string> = {
    "乾": "健（刚健不息）",
    "坤": "顺（柔顺承载）",
    "震": "动（雷厉风行）",
    "巽": "入（渗透深入）",
    "坎": "陷（险中求进）",
    "离": "丽（依附光明）",
    "艮": "止（适可而止）",
    "兑": "说（和悦沟通）",
  };
  return map[name] ?? name;
}
