import { describe, expect, it } from "vitest";
import { calculateBazi } from "@/lib/bazi";
import { buildBaziDeepReport } from "@/lib/bazi-deep-report";

describe("buildBaziDeepReport", () => {
  it("builds a saveable paid report with sections and luck timeline", () => {
    const bazi = calculateBazi({
      birthDate: "1994-06-12",
      birthHour: 8,
      gender: "male",
    });

    const report = buildBaziDeepReport(bazi, {
      ownerEmail: "user@example.com",
      source: "free-credit",
    });

    expect(report.id).toMatch(/^bazi-/);
    expect(report.ownerEmail).toBe("user@example.com");
    expect(report.priceLabel).toBe("首份免费");
    expect(report.sections).toHaveLength(6);
    expect(report.keyFindings).toHaveLength(4);
    expect(report.dashboard.pillars).toHaveLength(4);
    expect(report.dashboard.elements).toHaveLength(5);
    expect(report.dashboard.tenGods.length).toBeGreaterThan(0);
    expect(report.dashboard.strengths).toHaveLength(3);
    expect(report.dashboard.risks).toHaveLength(3);
    expect(report.dashboard.currentLuck).toEqual(
      expect.objectContaining({
        ganZhi: expect.any(String),
        years: expect.any(String),
      }),
    );
    expect(report.actionPlan).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: expect.any(String),
          items: expect.arrayContaining([expect.any(String)]),
        }),
      ]),
    );
    expect(report.deliverables).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "详批项目", value: "6" }),
        expect.objectContaining({ label: "大运阶段", value: "8" }),
      ]),
    );
    expect(report.sections.map((section) => section.title)).toEqual([
      "命盘格局详解",
      "十神组合分析",
      "事业与财运",
      "感情与婚姻",
      "健康与性格倾向",
      "大运流年详解",
    ]);
    expect(report.sections[5].body).toContain("当前大运");
    expect(report.sections[5].highlights.length).toBeGreaterThan(0);
    expect(report.luckTimeline).toHaveLength(8);
    expect(report.luckTimeline[0].years).toHaveLength(10);
    expect(report.luckTimeline[0]).toEqual(expect.objectContaining({ ganZhi: expect.any(String) }));
  });
});
