import { describe, expect, it } from "vitest";
import { calculateSingleMarriage } from "@/lib/marriage";

describe("calculateSingleMarriage spouse portrait", () => {
  it("derives the spouse element from the spouse star instead of the day branch generating cycle", () => {
    const result = calculateSingleMarriage({
      name: "测试",
      birthDate: "1994-06-12",
      birthHour: 8,
      gender: "male",
    });

    expect(result.person.dayMaster).toBe("土");
    expect(result.spousePortrait.element).toBe("水");
    expect(result.spousePortrait.starLabel).toBe("财星");
    expect(result.spousePortrait.text).toContain("男命以财星为配偶星");
    expect(result.spousePortrait.text).toContain("不代表适合与水命人配对");
    expect(result.spousePortrait.text).not.toContain("未来伴侣五行偏");
  });

  it("reports observable spouse-star evidence without asserting a fixed personality or meeting scene", () => {
    const result = calculateSingleMarriage({
      name: "测试",
      birthDate: "1994-06-12",
      birthHour: 8,
      gender: "male",
    });

    expect(result.spousePortrait.surfaceCount).toBeGreaterThanOrEqual(0);
    expect(result.spousePortrait.hiddenCount).toBeGreaterThanOrEqual(0);
    expect(result.spousePortrait.text).toContain("四柱中");
    expect(result.spousePortrait.text).not.toMatch(/温和包容|热情主动|常见背景|容易在.+出现/);
  });
});
