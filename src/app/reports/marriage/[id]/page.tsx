"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { MarriageDeepReport } from "@/lib/marriage-deep-report";

// ========== Scroll reveal ==========
function useReveal(thresh = 0.02) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const o = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setSeen(true); o.disconnect(); } },
      { threshold: thresh },
    );
    o.observe(el);
    return () => o.disconnect();
  }, [thresh]);
  return { ref, seen };
}

function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, seen } = useReveal();
  return (
    <div
      ref={ref}
      className={`transition-all duration-500 ease-out ${seen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function DragScroll({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const drag = useRef({ active: false, startX: 0, scrollLeft: 0 });

  return (
    <div
      ref={ref}
      className="flex cursor-grab snap-x snap-mandatory gap-4 overflow-x-auto pb-4 active:cursor-grabbing"
      onPointerDown={(event) => {
        const el = ref.current;
        if (!el) return;
        drag.current = { active: true, startX: event.clientX, scrollLeft: el.scrollLeft };
        el.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        const el = ref.current;
        if (!el || !drag.current.active) return;
        el.scrollLeft = drag.current.scrollLeft - (event.clientX - drag.current.startX);
      }}
      onPointerUp={(event) => {
        drag.current.active = false;
        ref.current?.releasePointerCapture(event.pointerId);
      }}
      onPointerCancel={() => { drag.current.active = false; }}
    >
      {children}
    </div>
  );
}

const generatingElement: Record<string, string> = { 木: "火", 火: "土", 土: "金", 金: "水", 水: "木" };
const controllingElement: Record<string, string> = { 木: "土", 火: "金", 土: "水", 金: "木", 水: "火" };
const stemElement: Record<string, string> = { 甲: "木", 乙: "木", 丙: "火", 丁: "火", 戊: "土", 己: "土", 庚: "金", 辛: "金", 壬: "水", 癸: "水" };
const branchElement: Record<string, string> = { 子: "水", 丑: "土", 寅: "木", 卯: "木", 辰: "土", 巳: "火", 午: "火", 未: "土", 申: "金", 酉: "金", 戌: "土", 亥: "水" };

function elementRelation(from: string, to: string) {
  if (from === to) return "同气";
  if (generatingElement[from] === to) return "生";
  if (generatingElement[to] === from) return "受生";
  if (controllingElement[from] === to) return "克";
  if (controllingElement[to] === from) return "受克";
  return "关系中性";
}

function luckCardContent(
  line: { ganZhi: string; impact: string; details: string },
  dayMaster: string,
  dayBranch: string,
) {
  const isDirect = line.impact !== "平稳期" && line.impact !== "无直接引动";
  if (isDirect) {
    const evidence = line.impact
      .split(" · ")
      .map((tag) => {
        if (tag === "引动婚姻宫") return `大运支${line.ganZhi[1]}与日支${dayBranch}相同（伏吟）`;
        if (tag === "合婚姻宫") return `大运支${line.ganZhi[1]}与日支${dayBranch}六合`;
        if (tag === "冲婚姻宫") return `大运支${line.ganZhi[1]}与日支${dayBranch}六冲`;
        if (tag === "桃花到位") return `大运支${line.ganZhi[1]}落桃花位`;
        if (tag === "配偶星透干") return `大运干${line.ganZhi[0]}为配偶星`;
        return tag;
      })
      .join("；");
    const judgment = line.details.split(/[。！？\n]/).find(Boolean)?.trim() || line.details;
    return { label: line.impact, evidence, judgment: `${judgment}。` };
  }

  const masterElement = stemElement[dayMaster] ?? "土";
  const luckStemElement = stemElement[line.ganZhi[0]] ?? "土";
  const palaceElement = branchElement[dayBranch] ?? "土";
  const luckBranchElement = branchElement[line.ganZhi[1]] ?? "土";
  return {
    label: "无直接姻缘引动",
    evidence: `大运干${line.ganZhi[0]}属${luckStemElement}，与日主${dayMaster}${masterElement}为${elementRelation(luckStemElement, masterElement)}；大运支${line.ganZhi[1]}属${luckBranchElement}，与婚姻宫${dayBranch}${palaceElement}未见伏吟、六合或六冲`,
    judgment: "此运缺少可单独指向婚恋事件的直接信号，需结合流年、配偶星与现实关系状态判断，不据此单断婚期。",
  };
}

function NarrativeBody({ body }: { body: string }) {
  const lines = body.split("\n").map((line) => line.trim()).filter(Boolean);
  let proseIndex = 0;

  return (
    <div className="space-y-4">
      {lines.map((line, index) => {
        const sectionMatch = line.match(/^【(.+?)】\s*[：:]?\s*(.*)$/);
        const interactionMatch = line.match(/^([⊕⚡⚠○])\s*(.+?)[：:]\s*(.*)$/);
        const numberedMatch = line.match(/^(\d+)[.、]\s*(.*)$/);
        const bulletMatch = line.match(/^[▸•·]\s*(.*)$/);
        const isMeta = line.startsWith("以上分析基于")
          || line.startsWith("十二长生源自")
          || line.startsWith("大运分析依据")
          || line.startsWith("数据来源")
          || line.startsWith("神煞来源")
          || line.startsWith("五行分析是")
          || line.startsWith("以上研判基于")
          || line.startsWith("以上画像基于");

        if (sectionMatch) {
          const heading = sectionMatch[1];
          const content = sectionMatch[2];
          return (
            <section key={index} className="mt-7 border-t border-divider pt-4 first:mt-0 first:border-t-0 first:pt-0">
              <p className="text-[11px] font-semibold tracking-[0.14em] text-ink">{heading}</p>
              {content && (
                <p className="mt-2 max-w-[62ch] text-[13px] font-medium leading-7 text-ink-light">{content}</p>
              )}
            </section>
          );
        }

        if (interactionMatch) {
          const label = interactionMatch[2];
          const relation = label.match(/(三合|半合|六合|六冲|六害|相刑|相合|冲|害|合|刑)$/)?.[0] ?? "互动";
          const target = label.slice(0, Math.max(0, label.length - relation.length)) || label;
          const caution = relation.includes("冲") || relation.includes("害") || relation.includes("刑");
          return (
            <section key={index} className="grid gap-4 border-t border-divider py-5 first:border-t-0 sm:grid-cols-[120px_1fr]">
              <div className="flex items-start gap-2">
                <span className={`mt-1 inline-block h-2 w-2 shrink-0 rounded-full ${caution ? "bg-rose-950/45" : "bg-ink/35"}`} />
                <div>
                  <p className="text-[12px] font-semibold tracking-[0.08em] text-ink">{target}</p>
                  <p className="mt-1 text-[10px] tracking-[0.12em] text-ink-fade">{relation}</p>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-semibold tracking-[0.12em] text-ink-fade">判断依据与含义</p>
                <p className="mt-2 text-[12px] leading-7 text-ink-light">{interactionMatch[3]}</p>
              </div>
            </section>
          );
        }

        if (numberedMatch) {
          return (
            <section key={index} className="grid gap-3 border-t border-divider py-5 first:border-t-0 sm:grid-cols-[32px_1fr]">
              <span className="text-[11px] font-semibold tabular-nums text-ink-fade">{numberedMatch[1].padStart(2, "0")}</span>
              <p className="text-[12px] leading-7 text-ink-light">{numberedMatch[2]}</p>
            </section>
          );
        }

        if (bulletMatch) {
          return (
            <div key={index} className="flex gap-3 py-1">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-fade" />
              <p className="text-[12px] leading-7 text-ink-light">{bulletMatch[1]}</p>
            </div>
          );
        }

        if (isMeta) {
          return (
            <aside key={index} className="border-l-2 border-divider pl-4 text-[11px] leading-6 text-ink-fade">
              {line}
            </aside>
          );
        }

        const isLead = proseIndex++ === 0;
        return isLead ? (
          <div key={index} className="border-l-2 border-ink/20 pl-5">
            <p className="text-[13px] leading-8 text-ink-light">{line}</p>
          </div>
        ) : (
          <p key={index} className="text-[12px] leading-7 text-ink-light">
            {line}
          </p>
        );
      })}
    </div>
  );
}

// ========== Element color map ==========
const elColor: Record<string, string> = {
  "木": "#6B8C5C", "火": "#C4664A", "土": "#C4A24A", "金": "#B8A070", "水": "#5C7A9A",
};
const elBg: Record<string, string> = {
  "木": "rgba(107,140,92,0.08)", "火": "rgba(196,102,74,0.07)", "土": "rgba(196,162,74,0.08)", "金": "rgba(184,160,112,0.08)", "水": "rgba(92,122,154,0.07)",
};
const elBorder: Record<string, string> = {
  "木": "rgba(107,140,92,0.2)", "火": "rgba(196,102,74,0.18)", "土": "rgba(196,162,74,0.2)", "金": "rgba(184,160,112,0.2)", "水": "rgba(92,122,154,0.18)",
};

// ========== Shensha category style ==========
const shenShaStyle = {
  "吉": { dot: "#8B6C4E", accent: "rgba(139,108,78,0.06)", border: "rgba(139,108,78,0.15)", label: "吉神" },
  "中性": { dot: "#B8A88A", accent: "rgba(184,168,138,0.05)", border: "rgba(184,168,138,0.15)", label: "中性神煞" },
  "凶": { dot: "#8B5E5E", accent: "rgba(139,94,94,0.05)", border: "rgba(139,94,94,0.15)", label: "凶煞" },
};

// ========== Page ==========
export default function MarriageReportPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [id, setId] = useState("");
  const [report, setReport] = useState<MarriageDeepReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { params.then(({ id }) => setId(id)); }, [params]);

  useEffect(() => {
    if (!id) return;
    const cached = window.sessionStorage.getItem(`yixiang:marriage-report:${id}`);
    if (cached) {
      try { setReport(JSON.parse(cached)); setLoading(false); return; } catch { /* fall through */ }
    }
    fetch(`/api/reports/marriage/${id}`).then(async (r) => {
      if (!r.ok) throw new Error("");
      setReport((await r.json()).report);
    }).catch(() => setReport(null)).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-px w-16 bg-divider animate-pulse" />
          <p className="text-[11px] tracking-[0.2em] text-ink-fade">深度解读加载中</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="mx-auto max-w-lg py-24 text-center">
        <h1 className="mb-3 text-2xl font-light tracking-[0.12em] text-ink">解读未载入</h1>
        <p className="mb-8 text-[13px] leading-7 text-ink-light">
          请从姻缘页重新测算后解锁深度解读。
        </p>
        <Link
          href="/marriage"
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-ink px-7 py-3 text-sm font-medium tracking-[0.1em] text-paper transition-opacity hover:opacity-90"
        >
          返回姻缘页
        </Link>
      </div>
    );
  }

  const ov = report.baziOverview;
  const isSolo = report.mode === "solo";

  // Extract shensha data
  const shenShaSec = report.sections[0];
  const shenShaData = shenShaSec?.data as {
    entries?: { name: string; category: string; position: string; meaning: string; basis: string; positionAnalysis: string; strengthNote?: string | null }[];
    jiCount?: number; neutralCount?: number; xiongCount?: number;
  } | undefined;
  const shenShaEntries = shenShaData?.entries ?? [];

  // Extract luck data
  const luckSec = report.sections.find((s) => s.title.includes("大运"));
  const luckData = luckSec?.data as {
    luckLines?: { ganZhi: string; ages: string; impact: string; isCurrent: boolean; details: string }[];
    currentIdx?: number;
  } | undefined;
  const luckLines = luckData?.luckLines ?? [];
  const currentLuckIdx = luckData?.currentIdx ?? -1;
  const dayPillar = report?.baziOverview?.pillars.find((pillar) => pillar.label === "日柱");
  const reportDayMaster = report?.baziOverview?.dayMaster ?? "";
  const reportDayBranch = dayPillar?.ganZhi[1] ?? "";

  // Separate shensha section from other narrative sections
  const narrativeSections = report.sections.slice(1);

  return (
    <article className="mx-auto max-w-3xl space-y-16 pb-24 pt-6">
      {/* ====== Back link ====== */}
      <button
        onClick={() => router.push("/marriage?from=report")}
        className="group inline-flex items-center gap-2 text-[11px] tracking-[0.12em] text-ink-fade transition-colors hover:text-ink"
      >
        <span className="inline-block transition-transform duration-300 group-hover:-translate-x-1">←</span>
        返回基础测算
      </button>

      {/* ====== 1. Hero ====== */}
      <Reveal>
        <header className="relative overflow-hidden rounded-sm border border-divider bg-card px-8 py-14 sm:px-12 sm:py-20">
          {/* Watermark */}
          <span
            className="pointer-events-none absolute -right-4 -top-4 select-none font-serif text-[180px] leading-none text-ink-fade/5 sm:text-[220px]"
            aria-hidden
          >
            缘
          </span>

          <div className="relative">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-ink-fade">
              {isSolo ? "姻缘深度解读" : "合盘深度解读"}
            </p>
            <h1 className="mt-6 max-w-xl text-[36px] font-light leading-[1.25] tracking-[0.06em] text-ink sm:text-[44px]">
              {report.headline}
            </h1>

            {/* Divider */}
            <div className="mt-8 h-px w-16 bg-divider origin-left animate-[marriage-line-draw_1s_0.3s_cubic-bezier(0.2,0.75,0.25,1)_both]" />

            <p className="mt-8 max-w-xl text-[13px] leading-8 text-ink-light">
              {report.summary}
            </p>
          </div>
        </header>
      </Reveal>

      {/* ====== 2. 命盘底稿 ====== */}
      {ov && (
        <Reveal delay={50}>
          <section className="rounded-sm border border-divider bg-card">
            {/* Header */}
            <div className="border-b border-divider px-8 py-5 sm:px-10">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-ink-fade">
                命盘底稿
              </p>
            </div>

            <div className="px-6 py-8 sm:px-10">
              {/* Four Pillars */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {ov.pillars.map((p, i) => {
                  const isDay = p.label === "日柱";
                  const ec = elColor[p.element] ?? elColor["土"];
                  const ebg = elBg[p.element] ?? elBg["土"];
                  const eb = elBorder[p.element] ?? elBorder["土"];
                  return (
                    <div
                      key={p.label}
                      className={`group relative overflow-hidden rounded-sm border transition-all duration-500 ${
                        isDay
                          ? "border-ink/20 ring-1 ring-ink/5 bg-ink/[0.02] lg:scale-105"
                          : "border-divider bg-card hover:border-ink/15"
                      }`}
                      style={{
                        animation: `yx-rise 520ms ease both`,
                        animationDelay: `${i * 50 + 80}ms`,
                      }}
                    >
                      {/* Element color strip */}
                      <div
                        className="absolute inset-x-0 top-0 h-0.5 opacity-50 transition-all duration-500 group-hover:opacity-80"
                        style={{ backgroundColor: ec }}
                      />

                      <div className="px-4 py-5">
                        {/* Label */}
                        <div className="flex items-center justify-between">
                          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-ink-fade">
                            {p.label}
                          </p>
                          {isDay && (
                            <span className="rounded-full bg-ink/[0.06] px-2 py-0.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-ink-fade">
                              婚姻宫
                            </span>
                          )}
                        </div>

                        {/* Big chars */}
                        <div className="mt-3 flex items-end gap-3">
                          <span className="text-4xl font-light tracking-[0.04em] text-ink">
                            {p.ganZhi}
                          </span>
                          <span
                            className="mb-1 rounded-full px-2 py-0.5 text-[9px] tracking-[0.1em]"
                            style={{ backgroundColor: ebg, color: ec }}
                          >
                            {p.element}
                          </span>
                        </div>

                        {/* Details */}
                        <div className="mt-4 space-y-1.5 border-t border-divider pt-3">
                          <div className="flex justify-between text-[10px]">
                            <span className="text-ink-fade">十神</span>
                            <span className="font-medium text-ink">{p.tenGod}</span>
                          </div>
                          <div className="flex justify-between text-[10px]">
                            <span className="text-ink-fade">纳音</span>
                            <span className="text-ink-light">{p.nayin}</span>
                          </div>
                          <div className="flex justify-between text-[10px]">
                            <span className="text-ink-fade">藏干</span>
                            <span className="text-ink-light">{p.hiddenTenGods.join(" · ") || "—"}</span>
                          </div>
                          {p.xunKong && (
                            <div className="flex justify-between text-[10px]">
                              <span className="text-ink-fade">旬空</span>
                              <span className="text-ink-light">{p.xunKong}</span>
                            </div>
                          )}
                        </div>

                        {/* Day pillar glow */}
                        {isDay && (
                          <div
                            className="absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-700 group-hover:opacity-100"
                            style={{
                              background: `radial-gradient(circle at 50% 30%, ${ec}08 0%, transparent 70%)`,
                            }}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Stats + Elements inline */}
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-divider pt-4 text-[11px]">
                <span className="text-ink-fade">
                  日主 <span className="ml-1 font-medium text-ink">{ov.dayMaster}</span>
                  <span className="ml-1 text-[10px] text-ink-fade">({ov.strength})</span>
                </span>
                <span className="text-ink-fade">
                  生肖 <span className="ml-1 font-medium text-ink">{ov.zodiac}</span>
                </span>
                <span className="text-ink-fade">
                  命宫 <span className="ml-1 font-medium text-ink">{ov.mingGong}</span>
                </span>
                <span className="text-ink-fade">
                  身宫 <span className="ml-1 font-medium text-ink">{ov.shenGong}</span>
                </span>
                <span className="flex items-center gap-2.5 ml-auto">
                  {Object.entries(ov.elements)
                    .sort((a, b) => b[1] - a[1])
                    .map(([el, val]) => (
                      <span key={el} className="flex items-center gap-0.5">
                        <span className="text-[12px] font-medium" style={{ color: elColor[el] ?? elColor["土"] }}>{el}</span>
                        <span className="text-[10px] tabular-nums text-ink-light">{val}</span>
                      </span>
                    ))}
                </span>
              </div>
            </div>
          </section>
        </Reveal>
      )}

      {/* ====== 3. 神煞全盘 ====== */}
      {shenShaEntries.length > 0 && (
        <Reveal delay={75}>
          <section className="rounded-sm border border-divider bg-card">
            <div className="border-b border-divider px-8 py-7 sm:px-12">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-ink-fade">
                01 / CHAPTER
              </p>
              <h2 className="mt-2 text-xl font-light tracking-[0.08em] text-ink">
                神煞全盘
              </h2>
              <p className="mt-3 max-w-xl text-[11px] leading-6 text-ink-fade">
                神煞只作辅助观察，不能脱离婚姻宫、配偶星与大运单独下结论。
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {[
                  ["全部", shenShaEntries.length],
                  ["吉神", shenShaData?.jiCount ?? 0],
                  ["中性神煞", shenShaData?.neutralCount ?? 0],
                  ["凶煞", shenShaData?.xiongCount ?? 0],
                ].map(([label, count]) => (
                  <span key={label} className="rounded-full border border-divider bg-paper/40 px-3 py-1.5 text-[10px] tracking-[0.08em] text-ink-light">
                    {label} <span className="ml-1 font-semibold text-ink">{count}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-5 px-5 py-6 sm:px-8 sm:py-8">
              {shenShaEntries.map((entry, i) => {
                const style = shenShaStyle[entry.category as keyof typeof shenShaStyle] ?? shenShaStyle["中性"];
                return (
                  <article
                    key={`${entry.name}-${entry.position}-${i}`}
                    className="group overflow-hidden rounded-sm border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(44,36,22,0.06)]"
                    style={{
                      borderColor: style.border,
                      backgroundColor: style.accent,
                      animation: `yx-fade-up 0.5s ease both`,
                      animationDelay: `${i * 30}ms`,
                    }}
                  >
                    {/* Name, category and position */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-divider bg-card/70 px-5 py-5 sm:px-7">
                      <div className="flex items-center gap-2 rounded-full border px-3 py-1.5" style={{ borderColor: style.border }}>
                        <span
                          className="inline-block h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: style.dot }}
                        />
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: style.dot }}>
                          {style.label}
                        </p>
                      </div>
                      <h3 className="text-2xl font-medium tracking-[0.12em] text-ink">
                        {entry.name}
                      </h3>
                      <p className="ml-auto text-[11px] tracking-[0.12em] text-ink-fade">
                        落于 <span className="font-semibold text-ink-light">{entry.position}</span>
                      </p>
                    </div>

                    <div className="px-5 py-6 sm:px-7">
                      {/* Meaning first */}
                      <div className="border-l-2 pl-4 sm:pl-5" style={{ borderColor: style.dot }}>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: style.dot }}>
                          姻缘含义
                        </p>
                        <p className="mt-2 text-[14px] leading-8 text-ink">
                          {entry.meaning}
                        </p>
                      </div>

                      <div className="mt-6 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-sm border border-divider bg-card/70 px-4 py-4">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-fade">
                            取法依据
                          </p>
                          <p className="mt-2 text-[11px] leading-6 text-ink-light">
                            {entry.basis}
                          </p>
                        </div>
                        <div className="rounded-sm border border-divider bg-card/70 px-4 py-4">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-fade">
                            落柱说明
                          </p>
                          <p className="mt-2 text-[11px] leading-6 text-ink-light">
                            {entry.positionAnalysis}
                          </p>
                        </div>
                      </div>

                      {/* 补充说明 */}
                      {entry.strengthNote && (
                        <div className="mt-3 rounded-sm border border-divider bg-card/70 px-4 py-3">
                          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-ink-fade">补充说明</p>
                          <p className="text-[11px] leading-6 text-ink-light">
                            {entry.strengthNote}
                          </p>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Method note */}
            <div className="border-t border-divider px-8 py-6 sm:px-12">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.16em] text-ink-fade">判读顺序</p>
                  <p className="mt-2 text-[11px] leading-6 text-ink-light">
                    先看婚姻宫与配偶星，再看大运是否引动。吉神、中性神煞与凶煞均只用于补充观察。
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.16em] text-ink-fade">权重说明</p>
                  <p className="mt-2 text-[11px] leading-6 text-ink-light">
                    日柱落位与婚恋关系最直接，月柱偏现实环境，年柱偏早年与外缘，时柱偏未来走向。单颗神煞不作独立结论。
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.16em] text-ink-fade">传统依据</p>
                  <p className="mt-2 text-[11px] leading-6 text-ink-light">
                    依据《渊海子平》《三命通会》所载口诀，以日干、年支和四柱地支推导。不同流派取法可能略有差异，本报告采用统一口径。
                  </p>
                </div>
              </div>
            </div>
          </section>
        </Reveal>
      )}

      {/* ====== 4. Narrative Chapters ====== */}
      {narrativeSections.map((sec, si) => {
        // Luck timeline special render
        if (sec.title.includes("大运") && luckLines.length > 0) {
          return (
            <Reveal key={sec.title} delay={(si + 1) * 40}>
              <section className="rounded-sm border border-divider bg-card">
                <div className="border-b border-divider px-8 py-7 sm:px-12">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-ink-fade">
                    {String(si + 2).padStart(2, "0")} / CHAPTER
                  </p>
                  <h2 className="mt-2 text-xl font-light tracking-[0.08em] text-ink">
                    {sec.title}
                  </h2>
                  {sec.subtitle && (
                    <p className="mt-1 text-[12px] text-ink-light">{sec.subtitle}</p>
                  )}
                </div>

                <div className="px-6 py-8 sm:px-10">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <p className="text-[10px] tracking-[0.12em] text-ink-fade">按住卡片左右拖动查看全部大运</p>
                    <p className="shrink-0 text-[10px] tabular-nums text-ink-fade">{luckLines.length} 步大运</p>
                  </div>

                  <DragScroll>
                    {luckLines.map((l, i) => {
                      const card = luckCardContent(l, reportDayMaster, reportDayBranch);
                      return (
                        <article
                          key={i}
                          className={`relative min-h-64 w-[82vw] max-w-[330px] shrink-0 snap-start rounded-sm border px-5 py-5 select-none transition-all sm:w-[310px] ${
                            l.isCurrent
                              ? "border-ink/25 bg-ink/[0.025]"
                              : "border-divider bg-card"
                          } ${i < currentLuckIdx ? "opacity-55" : ""}`}
                          style={{
                            animation: `yx-rise 400ms ease both`,
                            animationDelay: `${i * 30 + 60}ms`,
                          }}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <span className="text-xl font-medium tracking-[0.12em] text-ink">{l.ganZhi}</span>
                              <span className="ml-2 text-[11px] text-ink-fade">{l.ages}</span>
                            </div>
                            {l.isCurrent && (
                              <span className="shrink-0 rounded-full bg-ink px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-paper">
                                当前
                              </span>
                            )}
                          </div>
                          <div className="mt-4 flex flex-wrap gap-1.5">
                            {card.label.split(" · ").map((tag) => (
                              <span key={tag} className="rounded-full bg-divider/30 px-2.5 py-1 text-[10px] tracking-[0.06em] text-ink-light">
                                {tag}
                              </span>
                            ))}
                          </div>
                          <div className="mt-4 border-t border-divider pt-4">
                            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-ink-fade">判断依据</p>
                            <p className="mt-2 text-[11px] leading-6 text-ink-light">{card.evidence}。</p>
                          </div>
                          <div className="mt-4">
                            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-ink-fade">谨慎判断</p>
                            <p className="mt-2 text-[11px] leading-6 text-ink">{card.judgment}</p>
                          </div>
                        </article>
                      );
                    })}
                  </DragScroll>

                  <p className="mt-6 text-[11px] leading-relaxed text-ink-fade">
                    {sec.body.split("\n").filter((l) => l.startsWith("大运分析依据") || l.startsWith("数据来源")).join("")}
                  </p>
                </div>
              </section>
            </Reveal>
          );
        }

        // Regular narrative chapter
        return (
          <Reveal key={sec.title} delay={(si + 1) * 40}>
            <section className="rounded-sm border border-divider bg-card">
              <div className="border-b border-divider px-8 py-7 sm:px-12">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-ink-fade">
                  {String(si + 2).padStart(2, "0")} / CHAPTER
                </p>
                <h2 className="mt-2 text-xl font-light tracking-[0.08em] text-ink">
                  {sec.title}
                </h2>
                {sec.subtitle && (
                  <p className="mt-2 text-[12px] leading-relaxed text-ink-light">
                    {sec.subtitle}
                  </p>
                )}
                {sec.highlights.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-3">
                    {sec.highlights.map((h) => (
                      <span
                        key={h}
                        className="rounded-full border border-divider px-3 py-1 text-[11px] tracking-[0.06em] text-ink-light"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="px-8 py-8 sm:px-12">
                <div className="max-w-[68ch]">
                  <NarrativeBody body={sec.body} />
                </div>
              </div>
            </section>
          </Reveal>
        );
      })}

      {/* ====== 5. Coda ====== */}
      <Reveal delay={150}>
        <div className="text-center border-t border-divider pt-12">
          <p className="font-serif text-6xl text-ink-fade/10 select-none">缘</p>
          <p className="mt-4 text-[12px] leading-relaxed text-ink-fade">
            以上内容基于八字命理传统算法推导，仅供参考
          </p>
          <p className="mt-1 text-[12px] leading-relaxed text-ink-fade">
            命理提供概率和趋势，你的选择和经营才是决定性变量
          </p>
          <Link
            href="/marriage?from=report"
            className="mt-8 inline-flex min-h-10 items-center justify-center rounded-full border border-divider px-6 py-2.5 text-[11px] tracking-[0.12em] text-ink-fade transition-all hover:border-ink/30 hover:text-ink"
          >
            返回基础测算
          </Link>
        </div>
      </Reveal>
    </article>
  );
}
