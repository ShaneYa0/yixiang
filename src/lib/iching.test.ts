import { describe, expect, it } from "vitest";
import { castIching, getHexagramIndex, type LineValue } from "@/lib/iching";

describe("castIching", () => {
  it("preserves the six original line values from initial line to top line", () => {
    const lines: LineValue[] = [3, 2, 1, 0, 2, 1];

    const result = castIching(lines);

    expect(result.lineValues).toEqual(lines);
    expect(result.lineValues).not.toBe(lines);
    expect(result.changingLines).toEqual([1, 4]);
  });

  it("maps all eight trigrams from initial line to top line correctly", () => {
    const yin = true;
    const yang = false;
    const trigrams: Array<[string, boolean[]]> = [
      ["乾", [yang, yang, yang]],
      ["兑", [yang, yang, yin]],
      ["离", [yang, yin, yang]],
      ["震", [yang, yin, yin]],
      ["巽", [yin, yang, yang]],
      ["坎", [yin, yang, yin]],
      ["艮", [yin, yin, yang]],
      ["坤", [yin, yin, yin]],
    ];

    for (const [name, lower] of trigrams) {
      const result = castIching([...lower, yang, yang, yang].map((line) => line ? 1 : 2) as LineValue[]);
      expect(result.lowerTrigram).toBe(name);
      expect(getHexagramIndex([...lower, yang, yang, yang])).toBe(result.hexagramNumber - 1);
    }
  });
});
