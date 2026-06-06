import { describe, expect, it } from "vitest";
import { calculateBazi } from "@/lib/bazi";

describe("calculateBazi professional report", () => {
  it("returns structured professional report sections and luck cycles", () => {
    const result = calculateBazi({
      birthDate: "1994-06-12",
      birthHour: 8,
      gender: "male",
    });

    expect(result.pillars.map((pillar) => pillar.ganZhi)).toEqual(["甲戌", "庚午", "己巳", "戊辰"]);
    expect(result.professionalReport).toEqual(
      expect.objectContaining({
        structure: expect.any(String),
        dayMaster: expect.any(String),
        career: expect.any(String),
        wealth: expect.any(String),
        relationship: expect.any(String),
        health: expect.any(String),
      }),
    );
    expect(result.luck).toEqual(
      expect.objectContaining({
        startText: expect.stringContaining("起运"),
        cycles: expect.arrayContaining([
          expect.objectContaining({
            ganZhi: expect.any(String),
            startYear: expect.any(Number),
            endYear: expect.any(Number),
            startAge: expect.any(Number),
            endAge: expect.any(Number),
            theme: expect.any(String),
          }),
        ]),
      }),
    );
    expect(result.luck.cycles).toHaveLength(8);
  });
});
