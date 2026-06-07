import { describe, expect, it } from "vitest";
import { calculateBazi } from "@/lib/bazi";
import { buildBaziDeepReport } from "@/lib/bazi-deep-report";

describe("buildBaziDeepReport", () => {
  it("builds a saveable paid report with 7 structured sections", () => {
    const bazi = calculateBazi({
      birthDate: "1994-06-12",
      birthHour: 8,
      gender: "male",
    });

    const report = buildBaziDeepReport(bazi, {
      ownerEmail: "user@example.com",
      source: "free-credit",
    });

    // Basic metadata
    expect(report.id).toMatch(/^bazi-/);
    expect(report.ownerEmail).toBe("user@example.com");
    expect(report.priceLabel).toBe("首份免费");
    expect(report.headline).toContain("日主");
    expect(report.summary).toContain("详批");

    // Dashboard
    expect(report.dashboard.pillars).toHaveLength(4);
    expect(report.dashboard.elements).toHaveLength(5);
    expect(report.dashboard.tenGods.length).toBeGreaterThan(0);
    expect(report.dashboard.strengths).toHaveLength(3);
    expect(report.dashboard.risks).toHaveLength(3);

    // Pillar detail
    const dayPillar = report.dashboard.pillars.find((p) => p.label === "日柱");
    expect(dayPillar).toBeDefined();
    expect(dayPillar?.ganZhi).toEqual(expect.any(String));
    expect(dayPillar?.tenGod).toEqual(expect.any(String));
    expect(dayPillar?.hiddenTenGods).toBeInstanceOf(Array);
    expect(dayPillar?.nayin).toEqual(expect.any(String));
    expect(dayPillar?.element).toEqual(expect.any(String));

    // Sections: 7 total (6 content + 1 conclusion)
    expect(report.sections).toHaveLength(7);

    const kinds = report.sections.map((s) => s.kind);
    expect(kinds).toEqual([
      "structure",
      "tenGod",
      "careerWealth",
      "relationship",
      "health",
      "luck",
      "conclusion",
    ]);

    // Structure section
    const structure = report.sections.find((s) => s.kind === "structure")!;
    expect(structure.data.pattern).toEqual(expect.any(String));
    expect(structure.data.strengthLevel).toMatch(/偏弱|中和|偏旺/);
    expect(structure.data.usefulGods).toBeInstanceOf(Array);
    expect(structure.data.palaces.taiYuan.ganZhi).toEqual(expect.any(String));
    expect(structure.data.palaces.mingGong.ganZhi).toEqual(expect.any(String));
    expect(structure.data.palaces.shenGong.ganZhi).toEqual(expect.any(String));

    // TenGod section
    const tenGod = report.sections.find((s) => s.kind === "tenGod")!;
    expect(tenGod.data.pillarBreakdown).toHaveLength(4);
    expect(tenGod.data.frequency.length).toBeGreaterThan(0);
    expect(tenGod.data.frequency[0].meaning).toEqual(expect.any(String));
    expect(tenGod.data.combos).toBeInstanceOf(Array);

    // Career section
    const career = report.sections.find((s) => s.kind === "careerWealth")!;
    expect(career.data.industries.length).toBeGreaterThan(0);
    expect(career.data.wealthType).toEqual(expect.any(String));
    expect(career.data.careerRhythm).toEqual(expect.any(String));

    // Relationship section
    const relationship = report.sections.find((s) => s.kind === "relationship")!;
    expect(relationship.data.spouseStar.location).toEqual(expect.any(String));
    expect(relationship.data.marriagePalace.branch).toEqual(expect.any(String));
    expect(relationship.data.signals).toBeInstanceOf(Array);

    // Health section
    const health = report.sections.find((s) => s.kind === "health")!;
    expect(health.data.elementHealth).toHaveLength(5);
    expect(health.data.personalityTags.length).toBeGreaterThan(0);
    expect(health.data.lifestyleFlags.length).toBeGreaterThan(0);

    // Luck section
    const luck = report.sections.find((s) => s.kind === "luck")!;
    expect(luck.data.cycles.length).toBeGreaterThan(0);
    expect(luck.data.cycles[0].ganZhi).toEqual(expect.any(String));
    expect(luck.data.cycles[0].focusAreas).toBeInstanceOf(Array);
    expect(luck.data.cycles[0].keyYears.length).toBeGreaterThan(0);

    // Conclusion section
    const conclusion = report.sections.find((s) => s.kind === "conclusion")!;
    expect(conclusion.data.coreFindings.length).toBeGreaterThan(0);
    expect(conclusion.data.nearTerm.length).toBeGreaterThan(0);
    expect(conclusion.data.longTerm.length).toBeGreaterThan(0);
  });

  it("produces different reports for different charts", () => {
    const bazi1 = calculateBazi({ birthDate: "1994-06-12", birthHour: 8, gender: "male" });
    const bazi2 = calculateBazi({ birthDate: "2000-01-15", birthHour: 14, gender: "female" });

    const report1 = buildBaziDeepReport(bazi1, { ownerEmail: "a@b.com", source: "paid" });
    const report2 = buildBaziDeepReport(bazi2, { ownerEmail: "a@b.com", source: "paid" });

    // Different charts should produce meaningfully different content
    expect(report1.headline).not.toBe(report2.headline);
    expect(report1.summary).not.toBe(report2.summary);

    const s1 = report1.sections.find((s) => s.kind === "structure")!;
    const s2 = report2.sections.find((s) => s.kind === "structure")!;
    expect(s1.data.pattern).toEqual(expect.any(String));
    // Different birth dates may produce same pattern — that's fine,
    // but the basis text should differ
    expect(s1.data.strengthBasis).not.toBe(s2.data.strengthBasis);
  });

  it("returns paid price label for paid source", () => {
    const bazi = calculateBazi({ birthDate: "1994-06-12", birthHour: 8, gender: "male" });
    const report = buildBaziDeepReport(bazi, { ownerEmail: "vip@b.com", source: "paid" });
    expect(report.priceLabel).toBe("单次详批");
  });
});
