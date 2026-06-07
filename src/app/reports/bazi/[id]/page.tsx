"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { BaziDeepReport, BaziSection, StructureData, TenGodData, TenGodCombo, CareerWealthData, RelationshipData, HealthData, LuckData, LuckCycleDetail, ConclusionData } from "@/lib/bazi-deep-report";

// ========== Color tokens ==========
const elColor: Record<string, string> = {
  "木": "#6B8C5C", "火": "#C4664A", "土": "#C4A24A", "金": "#B8A070", "水": "#5C7A9A",
};
const elBg: Record<string, string> = {
  "木": "rgba(107,140,92,0.07)", "火": "rgba(196,102,74,0.06)", "土": "rgba(196,162,74,0.07)", "金": "rgba(184,160,112,0.07)", "水": "rgba(92,122,154,0.06)",
};
const elIcon: Record<string, string> = {
  "木": "/images/elements/wood.webp", "火": "/images/elements/fire.webp", "土": "/images/elements/earth.webp", "金": "/images/elements/metal.webp", "水": "/images/elements/water.webp",
};
const chapterTheme = {
  structure: { accent: "#C4A24A", soft: "rgba(196,162,74,0.07)" },
  tenGod: { accent: "#8B6C4E", soft: "rgba(139,108,78,0.07)" },
  career: { accent: "#6B8C5C", soft: "rgba(107,140,92,0.07)" },
  relationship: { accent: "#A66F78", soft: "rgba(166,111,120,0.07)" },
  health: { accent: "#5C7A9A", soft: "rgba(92,122,154,0.07)" },
  luck: { accent: "#637C92", soft: "rgba(99,124,146,0.07)" },
  conclusion: { accent: "#8B6C4E", soft: "rgba(139,108,78,0.07)" },
};
const tenGodColor: Record<string, string> = {
  "比肩": "#6B8C5C", "劫财": "#7A8B6B", "食神": "#C4A24A", "伤官": "#C4664A",
  "正财": "#B08A52", "偏财": "#9B7148", "正官": "#5C7A9A", "七杀": "#8B5E5E",
  "正印": "#7A6F9B", "偏印": "#8B779B", "日主": "#8B6C4E",
};

function ChapterAccent({ color }: { color: string }) {
  return <div className="absolute inset-x-0 top-0 h-1 origin-left" style={{ background: `linear-gradient(90deg, ${color}, ${color}35, transparent)`, animation: "marriage-line-draw 1s ease both" }} />;
}

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

// ========== Chapter header ==========
function ChapterHeader({ number, title, subtitle, highlights }: { number: string; title: string; subtitle?: string; highlights?: string[] }) {
  return (
    <div className="border-b border-divider px-7 py-5 sm:px-10">
      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-ink-fade">{number} / CHAPTER</p>
      <h2 className="mt-2 text-xl font-light tracking-[0.08em] text-ink dark:text-paper">{title}</h2>
      {subtitle && <p className="mt-2 text-[12px] leading-relaxed text-ink-light">{subtitle}</p>}
      {highlights && highlights.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {highlights.map((h) => (
            <span key={h} className="rounded-full border border-divider px-3 py-1 text-[10px] tracking-[0.06em] text-ink-light">{h}</span>
          ))}
        </div>
      )}
    </div>
  );
}

// ========== Pillar card grid ==========
function PillarGrid({ pillars }: { pillars: BaziDeepReport["dashboard"]["pillars"] }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
      {pillars.map((p, i) => {
        const ec = elColor[p.element] ?? elColor["土"];
        return (
          <div
            key={p.label}
            className="group relative overflow-hidden rounded-sm border transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(44,36,28,0.07)]"
            style={{ borderColor: `${ec}30`, background: `linear-gradient(160deg, ${ec}0D, rgba(255,255,255,0.8))`, animation: `yx-rise 520ms ease both`, animationDelay: `${i * 60 + 60}ms` }}
          >
            <div className="pointer-events-none absolute -right-5 -top-4 h-24 w-24 bg-contain bg-center bg-no-repeat opacity-[0.07] transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3" style={{ backgroundImage: `url(${elIcon[p.element] ?? elIcon["土"]})` }} />
            <div
              className="absolute inset-x-0 top-0 h-[3px] transition-all duration-500 group-hover:opacity-90"
              style={{ backgroundColor: ec, opacity: 0.6 }}
            />
            <div className="px-3 py-4 sm:px-4 sm:py-5">
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-ink-fade">{p.label}</p>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="font-serif text-[28px] leading-none tracking-[0.02em] text-ink dark:text-paper sm:text-[32px]">
                  {p.ganZhi[0]}
                </span>
                <span className="font-serif text-[28px] leading-none tracking-[0.02em] text-ink-light sm:text-[32px]">
                  {p.ganZhi[1]}
                </span>
              </div>
              <div
                className="mt-1.5 inline-flex rounded-sm px-1.5 py-0.5 text-[9px] tracking-[0.1em]"
                style={{ backgroundColor: ec + "18", color: ec }}
              >
                {p.element} · {p.tenGod}
              </div>
              <div className="mt-3 space-y-1 border-t border-divider pt-2.5">
                <div className="text-[10px] leading-5">
                  <span className="text-ink-fade">纳音 </span>
                  <span className="text-ink-light">{p.nayin}</span>
                </div>
                <div className="text-[10px] leading-5">
                  <span className="text-ink-fade">藏干 </span>
                  <span className="text-ink-light">{p.hiddenTenGods.join(" · ") || "—"}</span>
                </div>
                {p.xunKong && (
                  <div className="text-[10px] leading-5">
                    <span className="text-ink-fade">旬空 </span>
                    <span className="text-ink-light">{p.xunKong}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ========== Five-element relationship chart ==========
function ElementBars({ elements }: { elements: BaziDeepReport["dashboard"]["elements"] }) {
  const max = Math.max(...elements.map((e) => e.value), 1);
  const dominant = elements.reduce((top, e) => (e.value > top.value ? e : top), elements[0]);
  const order = ["木", "火", "土", "金", "水"];
  const arranged = order.map((name) => elements.find((element) => element.name === name)).filter((element): element is BaziDeepReport["dashboard"]["elements"][number] => Boolean(element));
  const points = [
    { left: "50%", top: "2%", transform: "translateX(-50%)" },
    { right: "2%", top: "28%" },
    { right: "17%", bottom: "0%" },
    { left: "17%", bottom: "0%" },
    { left: "2%", top: "28%" },
  ];

  return (
    <div className="grid items-center gap-7 lg:grid-cols-[19rem_1fr]">
      <div className="relative mx-auto aspect-square w-full max-w-[19rem]">
        <div className="absolute inset-[13%] rounded-full opacity-60 blur-2xl" style={{ background: `radial-gradient(circle, ${elBg[dominant.name]} 0%, transparent 70%)`, animation: "yx-element-pulse 3s ease-in-out infinite" }} />
        <div className="absolute left-1/2 top-1/2 z-10 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-divider bg-card/90 shadow-[0_12px_40px_rgba(44,36,28,0.08)] backdrop-blur-sm">
          <span className="text-[9px] tracking-[0.16em] text-ink-fade">命局主轴</span>
          <span className="mt-1 font-serif text-3xl" style={{ color: elColor[dominant.name] }}>{dominant.name}</span>
        </div>
        {arranged.map((element, index) => {
          const isDominant = element.name === dominant.name;
          const size = 64 + Math.round((element.value / max) * 26);
          return (
            <div
              key={element.name}
              className="absolute z-20 flex flex-col items-center"
              style={{ ...points[index], animation: `yx-element-float ${3.6 + index * 0.25}s ${index * 180}ms ease-in-out infinite` }}
            >
              <div
                className="bg-contain bg-center bg-no-repeat drop-shadow-[0_8px_10px_rgba(44,36,28,0.18)]"
                style={{ width: size, height: size, backgroundImage: `url(${elIcon[element.name]})`, filter: isDominant ? `drop-shadow(0 0 9px ${elColor[element.name]}80)` : undefined }}
                role="img"
                aria-label={`${element.name}元素`}
              />
              <div className="mt-1 rounded-full border border-divider bg-card/90 px-2.5 py-1 text-[9px] text-ink-fade shadow-sm backdrop-blur-sm">
                <span className="font-medium" style={{ color: elColor[element.name] }}>{element.name}</span>
                <span className="ml-1.5 tabular-nums">{element.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div>
        <div className="rounded-sm border border-divider px-5 py-5" style={{ backgroundColor: elBg[dominant.name], borderColor: `${elColor[dominant.name]}40` }}>
          <div className="text-[9px] font-semibold tracking-[0.16em]" style={{ color: elColor[dominant.name] }}>五行主轴 · {dominant.name}</div>
          <p className="mt-3 text-[12px] leading-7 text-ink-light">
            {dominant.name}气最显，代表{dominant.name === "木" ? "生发与规划" : dominant.name === "火" ? "表达与行动" : dominant.name === "土" ? "承载与稳定" : dominant.name === "金" ? "规则与判断" : "流动与应变"}更容易成为行事重心。
          </p>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5 lg:grid-cols-2">
          {arranged.map((element, index) => (
            <div
              key={element.name}
              className={`group relative overflow-hidden rounded-sm border px-4 py-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(44,36,28,0.07)] ${index === arranged.length - 1 ? "lg:col-span-2" : ""}`}
              style={{ borderColor: `${elColor[element.name]}35`, background: `linear-gradient(135deg, ${elBg[element.name]}, rgba(255,255,255,0.72))`, animation: `yx-fade-up 0.45s ease both`, animationDelay: `${300 + index * 70}ms` }}
            >
              <div className="pointer-events-none absolute -right-3 -top-4 h-20 w-20 bg-contain bg-center bg-no-repeat opacity-[0.11] transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3" style={{ backgroundImage: `url(${elIcon[element.name]})` }} />
              <div className="relative flex items-start justify-between gap-3">
                <div>
                  <span className="font-serif text-2xl" style={{ color: elColor[element.name] }}>{element.name}</span>
                  <div className="mt-1 inline-flex rounded-full px-2 py-0.5 text-[8px] font-semibold tracking-[0.1em]" style={{ color: elColor[element.name], backgroundColor: `${elColor[element.name]}12` }}>{element.role}</div>
                </div>
                <span className="text-xl font-light tabular-nums text-ink dark:text-paper">{element.value}</span>
              </div>
              <div className="relative mt-4 h-1.5 overflow-hidden rounded-full bg-card/80">
                <div className="h-full rounded-full" style={{ width: `${Math.max(6, element.value / max * 100)}%`, background: `linear-gradient(90deg, ${elColor[element.name]}90, ${elColor[element.name]})`, animation: `yx-fill 0.8s ${index * 90}ms ease both` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ========== Ten God grid ==========
function TenGodGrid({ tenGods }: { tenGods: BaziDeepReport["dashboard"]["tenGods"] }) {
  const visible = tenGods.slice(0, 8);
  const max = Math.max(...visible.map((t) => t.count), 1);

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {visible.map((tg, i) => (
        <div
          key={tg.name}
          className="group relative overflow-hidden rounded-sm border px-4 py-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(44,36,28,0.06)]"
          style={{ borderColor: `${tenGodColor[tg.name] ?? "#8B6C4E"}30`, background: `linear-gradient(135deg, ${tenGodColor[tg.name] ?? "#8B6C4E"}0D, rgba(255,255,255,0.72))`, animation: `yx-fade-up 0.4s ease both`, animationDelay: `${i * 60}ms` }}
        >
          <span className="pointer-events-none absolute -right-1 -top-5 font-serif text-7xl opacity-[0.045] transition-transform duration-500 group-hover:scale-110" style={{ color: tenGodColor[tg.name] ?? "#8B6C4E" }}>{tg.name.slice(-1)}</span>
          <div className="relative flex items-start justify-between gap-3">
            <div>
              <span className="text-lg font-light" style={{ color: tenGodColor[tg.name] ?? "#8B6C4E" }}>{tg.name}</span>
              <p className="mt-1 text-[10px] leading-5 text-ink-fade">{tg.meaning}</p>
            </div>
            <span className="shrink-0 text-2xl font-light tabular-nums text-ink dark:text-paper">{tg.count}</span>
          </div>
          <div className="relative mt-3 h-1.5 overflow-hidden rounded-full bg-card/80">
            <div className="h-full rounded-full animate-yx-fill" style={{ width: `${Math.max(4, (tg.count / max) * 100)}%`, backgroundColor: tenGodColor[tg.name] ?? "#8B6C4E", animationDelay: `${i * 80}ms` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ========== Chapter 1: 命盘格局详解 ==========
function StructureChapter({ sec }: { sec: BaziSection & { kind: "structure" } }) {
  const d = sec.data;

  return (
    <Reveal delay={80}>
      <section className="relative overflow-hidden rounded-sm border border-divider bg-card">
        <ChapterAccent color={chapterTheme.structure.accent} />
        <ChapterHeader number="01" title={sec.title} subtitle={sec.summary} highlights={sec.highlights} />

        <div className="px-6 py-8 sm:px-10 space-y-8">
          {/* Top stat cards */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-sm border px-5 py-5" style={{ borderColor: "rgba(107,140,92,0.2)", backgroundColor: "rgba(107,140,92,0.04)" }}>
              <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#6B8C5C]">日主强度</p>
              <p className="mt-3 text-3xl font-light tracking-[0.06em] text-ink dark:text-paper">{d.strengthLevel}</p>
              <p className="mt-2 text-[11px] leading-5 text-ink-light">{d.strengthBasis.slice(0, 60)}...</p>
            </div>
            <div className="rounded-sm border px-5 py-5" style={{ borderColor: "rgba(196,162,74,0.2)", backgroundColor: "rgba(196,162,74,0.04)" }}>
              <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#C4A24A]">格局类型</p>
              <p className="mt-3 text-3xl font-light tracking-[0.06em] text-ink dark:text-paper">{d.pattern}</p>
              <p className="mt-2 text-[11px] leading-5 text-ink-light">{d.patternBasis}</p>
            </div>
            <div className="rounded-sm border px-5 py-5" style={{ borderColor: "rgba(92,122,154,0.2)", backgroundColor: "rgba(92,122,154,0.04)" }}>
              <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#5C7A9A]">调候参考</p>
              <p className="mt-3 text-3xl font-light tracking-[0.06em] text-ink dark:text-paper">{d.tiaoHou.join(" · ")}</p>
              <p className="mt-2 text-[11px] leading-5 text-ink-light">用神取{d.usefulGods.join("、")}；忌神在{d.tabooGods.join("、")}</p>
            </div>
          </div>

          {/* Structure body */}
          <div className="max-w-[68ch]">
            <p className="whitespace-pre-line text-[13px] leading-8 text-ink-light">{sec.body}</p>
          </div>

          {/* Three palaces */}
          <div className="border-t border-divider pt-6">
            <h3 className="mb-4 text-[11px] font-semibold tracking-[0.14em] text-ink dark:text-paper">胎元 · 命宫 · 身宫</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              {([
                { label: "胎元", data: d.palaces.taiYuan },
                { label: "命宫", data: d.palaces.mingGong },
                { label: "身宫", data: d.palaces.shenGong },
              ]).map(({ label, data }) => (
                <div key={label} className="group relative overflow-hidden rounded-sm border border-divider bg-card px-4 py-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(44,36,28,0.06)]">
                  <span className="pointer-events-none absolute -right-2 -top-5 font-serif text-7xl text-ink-fade/[0.04] transition-transform duration-500 group-hover:scale-110">{data.ganZhi}</span>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-fade">{label}</p>
                    <span className="font-serif text-xl text-ink dark:text-paper">{data.ganZhi}</span>
                  </div>
                  <p className="mt-2 text-[11px] leading-5 text-ink-light">{data.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </Reveal>
  );
}

// ========== Chapter 2: 十神组合分析 ==========
function TenGodChapter({ sec }: { sec: BaziSection & { kind: "tenGod" } }) {
  const d = sec.data;

  return (
    <Reveal delay={90}>
      <section className="relative overflow-hidden rounded-sm border border-divider bg-card">
        <ChapterAccent color={chapterTheme.tenGod.accent} />
        <ChapterHeader number="02" title={sec.title} subtitle={sec.summary} highlights={sec.highlights} />

        <div className="px-6 py-8 sm:px-10 space-y-8">
          {/* Pillar ten god flow */}
          <div>
            <h3 className="mb-4 text-[11px] font-semibold tracking-[0.14em] text-ink dark:text-paper">四柱十神一览</h3>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
              {d.pillarBreakdown.map((p, i) => {
                const isDay = p.label === "日柱";
                return (
                  <div
                    key={p.label}
                    className="relative overflow-hidden rounded-sm border px-4 py-4 transition-all duration-300 hover:-translate-y-0.5"
                    style={{ borderColor: `${tenGodColor[p.stemTenGod] ?? chapterTheme.tenGod.accent}35`, backgroundColor: `${tenGodColor[p.stemTenGod] ?? chapterTheme.tenGod.accent}${isDay ? "18" : "0D"}`, animation: `yx-rise 400ms ease both`, animationDelay: `${i * 60}ms` }}
                  >
                    <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-ink-fade">{p.label}</p>
                    <p className="mt-2 text-xl font-light tracking-[0.06em]" style={{ color: tenGodColor[p.stemTenGod] ?? chapterTheme.tenGod.accent }}>{p.stemTenGod}</p>
                    <p className="mt-1.5 text-[10px] leading-5 text-ink-fade">
                      藏：{p.branchTenGods.join(" / ")}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Frequency + combos split */}
          <div className="grid gap-6 md:grid-cols-2 border-t border-divider pt-7">
            {/* Ten god frequency */}
            <div>
              <h3 className="mb-4 text-[11px] font-semibold tracking-[0.14em] text-ink dark:text-paper">十神频次</h3>
              <div className="space-y-3">
                {d.frequency.map((f, i) => (
                  <div key={f.name} className="rounded-sm border border-divider bg-card px-4 py-3" style={{ animation: `yx-fade-up 0.35s ease both`, animationDelay: `${i * 50}ms` }}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[12px] font-medium text-ink dark:text-paper">{f.name}</span>
                      <span className="text-lg font-light tabular-nums text-ink dark:text-paper">{f.count}</span>
                    </div>
                    <p className="text-[11px] leading-5 text-ink-light">{f.meaning}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Ten god combos */}
            <div>
              <h3 className="mb-4 text-[11px] font-semibold tracking-[0.14em] text-ink dark:text-paper">关键组合</h3>
              {d.combos.length > 0 ? (
                <div className="space-y-3">
                  {d.combos.map((combo: TenGodCombo, i: number) => (
                    <div
                      key={combo.name}
                      className="rounded-sm border border-divider bg-card px-4 py-4 transition-all hover:-translate-y-0.5"
                      style={{ animation: `yx-fade-up 0.4s ease both`, animationDelay: `${i * 80}ms` }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="h-2 w-2 rounded-full bg-[#8B6C4E]" />
                        <span className="text-[12px] font-semibold tracking-[0.08em] text-ink dark:text-paper">{combo.name}</span>
                      </div>
                      <p className="text-[10px] text-ink-fade mb-2">涉及：{combo.involved} · 位于：{combo.location}</p>
                      <p className="text-[12px] leading-6 text-ink-light">{combo.meaning}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[12px] leading-7 text-ink-light">此盘十神组合以单一行星为主，未出现经典的特殊组合。判断重点在主导十神和五行流通上。</p>
              )}
            </div>
          </div>
        </div>
      </section>
    </Reveal>
  );
}

// ========== Chapter 3: 事业与财运 ==========
function CareerWealthChapter({ sec }: { sec: BaziSection & { kind: "careerWealth" } }) {
  const d = sec.data;

  return (
    <Reveal delay={100}>
      <section className="relative overflow-hidden rounded-sm border border-divider bg-card">
        <ChapterAccent color={chapterTheme.career.accent} />
        <ChapterHeader number="03" title={sec.title} subtitle={sec.summary} highlights={sec.highlights} />

        <div className="px-6 py-8 sm:px-10 space-y-6">
          {/* Key insights in two columns */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="relative overflow-hidden rounded-sm border px-5 py-5" style={{ borderColor: `${chapterTheme.career.accent}35`, backgroundColor: chapterTheme.career.soft }}>
              <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-ink-fade">财富模式</p>
              <p className="mt-3 text-[13px] leading-7 text-ink-light">{d.wealthType}</p>
            </div>
            <div className="relative overflow-hidden rounded-sm border px-5 py-5" style={{ borderColor: `${chapterTheme.structure.accent}35`, backgroundColor: chapterTheme.structure.soft }}>
              <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-ink-fade">职业节奏</p>
              <p className="mt-3 text-[13px] leading-7 text-ink-light">{d.careerRhythm}</p>
            </div>
          </div>

          {/* Industries */}
          <div className="border-t border-divider pt-5">
            <h3 className="mb-3 text-[11px] font-semibold tracking-[0.14em] text-ink dark:text-paper">适合行业方向</h3>
            <div className="flex flex-wrap gap-2">
              {d.industries.map((ind) => (
                <span key={ind} className="rounded-full border border-divider bg-card px-4 py-2 text-[11px] tracking-[0.06em] text-ink-light transition-all hover:border-ink/20 hover:text-ink dark:hover:text-paper">
                  {ind}
                </span>
              ))}
            </div>
          </div>

          {/* Risk boundary */}
          <div className="rounded-sm border px-5 py-4" style={{ borderColor: "rgba(155,107,94,0.2)", backgroundColor: "rgba(155,107,94,0.04)" }}>
            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#9B6B5E]">风险边界</p>
            <p className="mt-2 text-[12px] leading-7 text-ink-light">{d.riskBoundary}</p>
          </div>

          {/* Body text */}
          <div className="max-w-[68ch]">
            <p className="whitespace-pre-line text-[13px] leading-8 text-ink-light">{sec.body}</p>
          </div>
        </div>
      </section>
    </Reveal>
  );
}

// ========== Chapter 4: 感情与婚姻 ==========
function RelationshipChapter({ sec }: { sec: BaziSection & { kind: "relationship" } }) {
  const d = sec.data;

  return (
    <Reveal delay={110}>
      <section className="relative overflow-hidden rounded-sm border border-divider bg-card">
        <ChapterAccent color={chapterTheme.relationship.accent} />
        <ChapterHeader number="04" title={sec.title} subtitle={sec.summary} highlights={sec.highlights} />

        <div className="px-6 py-8 sm:px-10 space-y-6">
          {/* Spouse star + Marriage palace cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-sm border overflow-hidden" style={{ borderColor: `${chapterTheme.relationship.accent}35`, backgroundColor: chapterTheme.relationship.soft }}>
              <div className="border-b border-divider px-5 py-3">
                <p className="text-[10px] font-semibold tracking-[0.14em] text-ink dark:text-paper">配偶星</p>
              </div>
              <div className="px-5 py-5 space-y-3">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <div>
                    <span className="text-[10px] tracking-[0.12em] text-ink-fade">位置 </span>
                    <span className="text-[13px] font-medium text-ink dark:text-paper">{d.spouseStar.location}</span>
                  </div>
                  <div>
                    <span className="text-[10px] tracking-[0.12em] text-ink-fade">五行 </span>
                    <span className="text-[13px] font-medium" style={{ color: elColor[d.spouseStar.element] ?? elColor["土"] }}>{d.spouseStar.element}</span>
                  </div>
                  <div>
                    <span className="text-[10px] tracking-[0.12em] text-ink-fade">十神 </span>
                    <span className="text-[13px] font-medium text-ink dark:text-paper">{d.spouseStar.tenGod}</span>
                  </div>
                </div>
                <p className="text-[12px] leading-7 text-ink-light">{d.spouseStar.analysis}</p>
              </div>
            </div>

            <div className="rounded-sm border overflow-hidden" style={{ borderColor: `${chapterTheme.relationship.accent}35`, backgroundColor: chapterTheme.relationship.soft }}>
              <div className="border-b border-divider px-5 py-3">
                <p className="text-[10px] font-semibold tracking-[0.14em] text-ink dark:text-paper">婚姻宫</p>
              </div>
              <div className="px-5 py-5 space-y-3">
                <div className="flex items-center gap-4">
                  <span className="font-serif text-4xl text-ink dark:text-paper">{d.marriagePalace.branch}</span>
                  <div>
                    <span className="text-[10px] tracking-[0.12em] text-ink-fade">日支 </span>
                    <span className="text-[13px] font-medium" style={{ color: elColor[d.marriagePalace.element] ?? elColor["土"] }}>{d.marriagePalace.element}</span>
                  </div>
                </div>
                <p className="text-[12px] leading-7 text-ink-light">{d.marriagePalace.analysis}</p>
              </div>
            </div>
          </div>

          {/* Signals */}
          {d.signals.length > 0 && (
            <div className="border-t border-divider pt-5">
              <h3 className="mb-3 text-[11px] font-semibold tracking-[0.14em] text-ink dark:text-paper">关键信号</h3>
              <div className="space-y-2">
                {d.signals.map((s, i) => (
                  <div key={i} className="flex items-start gap-2.5 rounded-sm border border-divider bg-card px-4 py-3" style={{ animation: `yx-fade-up 0.35s ease both`, animationDelay: `${i * 60}ms` }}>
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#8B6C4E]" />
                    <p className="text-[12px] leading-7 text-ink-light">{s}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="max-w-[68ch]">
            <p className="whitespace-pre-line text-[13px] leading-8 text-ink-light">{sec.body}</p>
          </div>
        </div>
      </section>
    </Reveal>
  );
}

// ========== Chapter 5: 健康与性格 ==========
function HealthChapter({ sec }: { sec: BaziSection & { kind: "health" } }) {
  const d = sec.data;

  return (
    <Reveal delay={120}>
      <section className="relative overflow-hidden rounded-sm border border-divider bg-card">
        <ChapterAccent color={chapterTheme.health.accent} />
        <ChapterHeader number="05" title={sec.title} subtitle={sec.summary} highlights={sec.highlights} />

        <div className="px-6 py-8 sm:px-10 space-y-6">
          {/* Personality tags */}
          <div>
            <h3 className="mb-3 text-[11px] font-semibold tracking-[0.14em] text-ink dark:text-paper">性格倾向</h3>
            <div className="flex flex-wrap gap-2">
              {d.personalityTags.map((tag) => (
                <span key={tag} className="rounded-sm border border-divider bg-card px-4 py-2.5 text-[12px] tracking-[0.06em] text-ink-light">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Element health mapping */}
          <div className="border-t border-divider pt-5">
            <h3 className="mb-3 text-[11px] font-semibold tracking-[0.14em] text-ink dark:text-paper">五行健康映射</h3>
            <p className="mb-4 text-[10px] tracking-[0.08em] text-ink-fade">以下为五行偏性对应的生活习惯提醒，不构成医学诊断。</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {d.elementHealth.map((eh, i) => {
                const ec = elColor[eh.element] ?? elColor["土"];
                const isImportant = eh.tendency.startsWith("【");
                return (
                  <div
                    key={eh.element}
                    className={`rounded-sm border px-4 py-4 ${isImportant ? "border-ink/15 bg-ink/[0.015]" : "border-divider bg-card"}`}
                    style={{ animation: `yx-fade-up 0.4s ease both`, animationDelay: `${i * 60}ms` }}
                  >
                    <div className="flex items-center gap-2.5 mb-2">
                      <span className="font-serif text-xl" style={{ color: ec }}>{eh.element}</span>
                      {isImportant && (
                        <span className="rounded-full px-2 py-0.5 text-[8px] font-semibold uppercase tracking-[0.1em]" style={{ backgroundColor: ec + "20", color: ec }}>
                          {eh.tendency.includes("偏显") ? "偏显" : "不足"}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] leading-6 text-ink-fade">{eh.tendency.replace(/【偏显】|【不足】/g, "")}</p>
                    <p className="mt-2 text-[11px] leading-6 text-ink-light">{eh.advice}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Lifestyle flags */}
          <div className="border-t border-divider pt-5">
            <h3 className="mb-3 text-[11px] font-semibold tracking-[0.14em] text-ink dark:text-paper">生活方式提醒</h3>
            <div className="space-y-2.5">
              {d.lifestyleFlags.map((flag, i) => (
                <div key={i} className="flex items-start gap-3 rounded-sm border border-divider bg-card px-4 py-3" style={{ animation: `yx-fade-up 0.35s ease both`, animationDelay: `${i * 60}ms` }}>
                  <span className="mt-0.5 text-[10px] tabular-nums text-ink-fade">{String(i + 1).padStart(2, "0")}</span>
                  <p className="text-[12px] leading-7 text-ink-light">{flag}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </Reveal>
  );
}

// ========== Chapter 6: 大运流年 ==========
function LuckChapter({ sec }: { sec: BaziSection & { kind: "luck" } }) {
  const d = sec.data;

  return (
    <Reveal delay={130}>
      <section className="relative overflow-hidden rounded-sm border border-divider bg-card">
        <ChapterAccent color={chapterTheme.luck.accent} />
        <ChapterHeader number="06" title={sec.title} subtitle={sec.summary} highlights={sec.highlights} />

        <div className="px-6 py-8 sm:px-10 space-y-6">
          {/* Current + Next comparison */}
          <div className="grid gap-4 sm:grid-cols-2">
            {d.currentCycle && (
              <div className="rounded-sm border px-5 py-5" style={{ borderColor: `${chapterTheme.luck.accent}45`, backgroundColor: chapterTheme.luck.soft }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="rounded-full bg-ink px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-paper dark:bg-paper dark:text-ink">当前大运</span>
                </div>
                <span className="text-3xl font-light tracking-[0.08em] text-ink dark:text-paper">{d.currentCycle.ganZhi}</span>
                <p className="mt-1 text-[11px] tracking-[0.06em] text-ink-fade">{d.currentCycle.startYear}-{d.currentCycle.endYear} · {d.currentCycle.startAge}-{d.currentCycle.endAge}岁</p>
                <p className="mt-3 text-[13px] leading-7 text-ink-light">{d.currentCycle.theme}</p>
                {d.currentCycle.focusAreas.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {d.currentCycle.focusAreas.map((area) => (
                      <span key={area} className="rounded-full border border-divider px-2.5 py-0.5 text-[10px] text-ink-fade tracking-[0.06em]">{area}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="rounded-sm border px-5 py-5" style={{ borderColor: `${chapterTheme.structure.accent}35`, backgroundColor: chapterTheme.structure.soft }}>
              <div className="mb-3">
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-fade">下一阶段</span>
              </div>
              {d.nextCycle ? (
                <>
                  <span className="text-3xl font-light tracking-[0.08em] text-ink dark:text-paper">{d.nextCycle.ganZhi}</span>
                  <p className="mt-1 text-[11px] tracking-[0.06em] text-ink-fade">{d.nextCycle.startYear}-{d.nextCycle.endYear} · {d.nextCycle.startAge}-{d.nextCycle.endAge}岁</p>
                  <p className="mt-3 text-[13px] leading-7 text-ink-light">{d.nextCycle.theme}</p>
                  {d.nextCycle.focusAreas.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {d.nextCycle.focusAreas.map((area) => (
                        <span key={area} className="rounded-full border border-divider px-2.5 py-0.5 text-[10px] text-ink-fade tracking-[0.06em]">{area}</span>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <span className="text-3xl font-light tracking-[0.08em] text-ink-fade/40">—</span>
                  <p className="mt-3 text-[13px] leading-7 text-ink-light">后续阶段以稳住当前节奏为先。</p>
                </>
              )}
            </div>
          </div>

          {/* Full timeline — horizontal scroll */}
          <div className="border-t border-divider pt-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[11px] font-semibold tracking-[0.14em] text-ink dark:text-paper">全部大运阶段</h3>
              <span className="text-[10px] tabular-nums text-ink-fade">{d.cycles.length} 步大运</span>
            </div>
            <div className="relative overflow-x-auto pb-3">
              <div className="flex gap-3 min-w-max">
                {d.cycles.map((cycle, i) => {
                  const isCurrent = d.currentCycle?.ganZhi === cycle.ganZhi && d.currentCycle?.startYear === cycle.startYear;
                  return (
                    <div
                      key={`${cycle.ganZhi}-${cycle.startYear}`}
                      className={`w-[172px] shrink-0 rounded-sm border px-4 py-4 transition-all ${isCurrent ? "border-ink/25 bg-ink/[0.03] dark:border-paper/25 dark:bg-paper/[0.02]" : "border-divider bg-card hover:-translate-y-0.5"}`}
                      style={{ animation: `yx-rise 400ms ease both`, animationDelay: `${i * 35}ms` }}
                    >
                      {isCurrent && (
                        <div className="mb-2 rounded-full bg-ink px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-paper dark:bg-paper dark:text-ink inline-block">当前</div>
                      )}
                      <span className="text-lg font-light tracking-[0.06em] text-ink dark:text-paper">{cycle.ganZhi}</span>
                      <p className="mt-1 text-[10px] tracking-[0.04em] text-ink-fade">{cycle.startYear}-{cycle.endYear}</p>
                      <p className="mt-0.5 text-[10px] text-ink-fade">{cycle.startAge}-{cycle.endAge}岁</p>
                      <p className="mt-2 text-[11px] leading-5 text-ink-light line-clamp-2">{cycle.theme}</p>
                      <div className="mt-3 border-t border-divider pt-2.5">
                        {cycle.focusAreas.map((area) => (
                          <span key={area} className="inline-block mr-1 mb-1 rounded-sm bg-divider/20 px-1.5 py-0.5 text-[9px] text-ink-fade tracking-[0.04em]">{area}</span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Body text */}
          <div className="max-w-[68ch] border-t border-divider pt-5">
            <p className="whitespace-pre-line text-[13px] leading-8 text-ink-light">{sec.body}</p>
          </div>
        </div>
      </section>
    </Reveal>
  );
}

// ========== Chapter 7: 综合总结 ==========
function ConclusionChapter({ sec }: { sec: BaziSection & { kind: "conclusion" } }) {
  const d = sec.data;

  return (
    <Reveal delay={140}>
      <section className="relative overflow-hidden rounded-sm border border-divider bg-card">
        <ChapterAccent color={chapterTheme.conclusion.accent} />
        <ChapterHeader number="07" title={sec.title} subtitle={sec.summary} />

        <div className="px-6 py-8 sm:px-10 space-y-6">
          {/* Core findings */}
          <div>
            <h3 className="mb-4 flex items-center gap-2 text-[11px] font-semibold tracking-[0.14em] text-ink dark:text-paper">
              核心发现
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {d.coreFindings.map((f, i) => (
                <div
                  key={i}
                  className="rounded-sm border border-divider bg-card px-5 py-4 transition-all hover:-translate-y-0.5"
                  style={{ animation: `yx-fade-up 0.4s ease both`, animationDelay: `${i * 70}ms` }}
                >
                  <span className="text-[10px] font-semibold tracking-[0.12em] text-ink-fade">{String(i + 1).padStart(2, "0")}</span>
                  <p className="mt-2 text-[12px] leading-7 text-ink-light">{f}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action plan — two columns */}
          <div className="grid gap-5 sm:grid-cols-2 border-t border-divider pt-5">
            <div>
              <h3 className="mb-3 text-[11px] font-semibold tracking-[0.14em] text-ink dark:text-paper">近期行动</h3>
              <div className="space-y-2.5">
                {d.nearTerm.map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5 rounded-sm border border-divider bg-card px-4 py-3" style={{ animation: `yx-fade-up 0.35s ease both`, animationDelay: `${i * 60}ms` }}>
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#6B8C5C]" />
                    <p className="text-[12px] leading-7 text-ink-light">{item}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="mb-3 text-[11px] font-semibold tracking-[0.14em] text-ink dark:text-paper">长期经营</h3>
              <div className="space-y-2.5">
                {d.longTerm.map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5 rounded-sm border border-divider bg-card px-4 py-3" style={{ animation: `yx-fade-up 0.35s ease both`, animationDelay: `${i * 80 + 60}ms` }}>
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#5C7A9A]" />
                    <p className="text-[12px] leading-7 text-ink-light">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </Reveal>
  );
}

// ========== Main Page ==========
export default function BaziReportPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState("");
  const [report, setReport] = useState<BaziDeepReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { params.then(({ id }) => setId(id)); }, [params]);

  useEffect(() => {
    if (!id) return;
    const cached = window.sessionStorage.getItem(`yixiang:bazi-report:${id}`);
    if (cached) {
      try { setReport(JSON.parse(cached)); setLoading(false); return; } catch { /* fall through */ }
    }
    fetch(`/api/reports/bazi/${id}`).then(async (r) => {
      if (!r.ok) throw new Error("");
      setReport((await r.json()).report);
    }).catch(() => setReport(null)).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-px w-16 bg-divider animate-pulse" />
          <p className="text-[11px] tracking-[0.2em] text-ink-fade">详批载入中</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="mx-auto max-w-lg py-24 text-center">
        <h1 className="mb-3 text-2xl font-light tracking-[0.12em] text-ink dark:text-paper">详批未载入</h1>
        <p className="mb-8 text-[13px] leading-7 text-ink-light">请从八字页重新排盘后解锁深度详批。</p>
        <Link href="/bazi" className="inline-flex min-h-11 items-center justify-center rounded-lg bg-ink px-7 py-3 text-sm font-medium tracking-[0.1em] text-paper transition-opacity hover:opacity-90 dark:bg-paper dark:text-ink">返回八字页</Link>
      </div>
    );
  }

  // Find sections by kind
  const structureSec = report.sections.find((s): s is BaziSection & { kind: "structure" } => s.kind === "structure");
  const tenGodSec = report.sections.find((s): s is BaziSection & { kind: "tenGod" } => s.kind === "tenGod");
  const careerSec = report.sections.find((s): s is BaziSection & { kind: "careerWealth" } => s.kind === "careerWealth");
  const relationshipSec = report.sections.find((s): s is BaziSection & { kind: "relationship" } => s.kind === "relationship");
  const healthSec = report.sections.find((s): s is BaziSection & { kind: "health" } => s.kind === "health");
  const luckSec = report.sections.find((s): s is BaziSection & { kind: "luck" } => s.kind === "luck");
  const conclusionSec = report.sections.find((s): s is BaziSection & { kind: "conclusion" } => s.kind === "conclusion");

  return (
    <article className="mx-auto max-w-3xl space-y-12 pb-24 pt-6">
      {/* Back link */}
      <Link href="/bazi?from=report" className="group inline-flex items-center gap-2 text-[11px] tracking-[0.12em] text-ink-fade transition-colors hover:text-ink dark:hover:text-paper">
        <span className="inline-block transition-transform duration-300 group-hover:-translate-x-1">←</span>
        返回八字排盘
      </Link>

      {/* Hero */}
      <Reveal>
        <header className="relative overflow-hidden rounded-sm border border-divider bg-card px-8 py-14 sm:px-12 sm:py-20">
          <span className="pointer-events-none absolute -right-4 -top-4 select-none font-serif text-[180px] leading-none text-ink-fade/5 sm:text-[220px]" aria-hidden>命</span>
          <div className="relative">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-ink-fade">
              八字深度详批 · {report.priceLabel}
            </p>
            <h1 className="mt-6 max-w-xl text-[36px] font-light leading-[1.25] tracking-[0.06em] text-ink dark:text-paper sm:text-[44px]">
              {report.headline}
            </h1>
            <div className="mt-8 h-px w-16 bg-divider origin-left" style={{ animation: "marriage-line-draw 1s 0.3s cubic-bezier(0.2,0.75,0.25,1) both" }} />
            <p className="mt-8 max-w-xl text-[13px] leading-8 text-ink-light">{report.summary}</p>
          </div>
        </header>
      </Reveal>

      {/* Dashboard: 命盘总览 */}
      <Reveal delay={50}>
        <section className="overflow-hidden rounded-sm border border-divider bg-card">
          <div className="border-b border-divider px-7 py-6 sm:px-10">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-ink-fade">命盘总览 / OVERVIEW</p>
            <h2 className="mt-2 text-xl font-light tracking-[0.08em] text-ink dark:text-paper">四柱八字</h2>
            <p className="mt-1.5 text-[12px] leading-relaxed text-ink-light">年柱为根，月柱为苗，日柱为花，时柱为果。四柱合看，方见全貌。</p>
          </div>
          <div className="px-5 py-7 sm:px-8 sm:py-9">
            <PillarGrid pillars={report.dashboard.pillars} />
          </div>

          <div className="border-t border-divider px-6 py-7 sm:px-10 sm:py-8 space-y-8">
            <div>
              <h3 className="mb-5 text-[11px] font-semibold tracking-[0.14em] text-ink dark:text-paper">五行分布</h3>
              <ElementBars elements={report.dashboard.elements} />
            </div>
            <div className="border-t border-divider pt-8">
              <h3 className="mb-5 text-[11px] font-semibold tracking-[0.14em] text-ink dark:text-paper">十神关系</h3>
              <TenGodGrid tenGods={report.dashboard.tenGods} />
            </div>
            <div className="grid gap-6 md:grid-cols-2 border-t border-divider pt-8">
              <div>
                <h3 className="mb-4 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6B8C5C]">
                  <span className="inline-block h-2 w-2 rounded-full bg-[#6B8C5C]" />优势摘要
                </h3>
                <div className="space-y-2">
                  {report.dashboard.strengths.map((s, i) => (
                    <div key={i} className="rounded-sm border px-4 py-3 transition-all duration-300 hover:-translate-y-0.5" style={{ borderColor: "rgba(107,140,92,0.22)", backgroundColor: "rgba(107,140,92,0.055)", animation: `yx-fade-up 0.35s ease both`, animationDelay: `${i * 60}ms` }}>
                      <p className="text-[12px] leading-7 text-ink-light">{s}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="mb-4 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9B6B5E]">
                  <span className="inline-block h-2 w-2 rounded-full bg-[#9B6B5E]" />风险提醒
                </h3>
                <div className="space-y-2">
                  {report.dashboard.risks.map((r, i) => (
                    <div key={i} className="rounded-sm border px-4 py-3 transition-all duration-300 hover:-translate-y-0.5" style={{ borderColor: "rgba(155,107,94,0.22)", backgroundColor: "rgba(155,107,94,0.05)", animation: `yx-fade-up 0.35s ease both`, animationDelay: `${i * 60 + 50}ms` }}>
                      <p className="text-[12px] leading-7 text-ink-light">{r}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      {/* Chapter sections */}
      {structureSec && <StructureChapter sec={structureSec} />}
      {tenGodSec && <TenGodChapter sec={tenGodSec} />}
      {careerSec && <CareerWealthChapter sec={careerSec} />}
      {relationshipSec && <RelationshipChapter sec={relationshipSec} />}
      {healthSec && <HealthChapter sec={healthSec} />}
      {luckSec && <LuckChapter sec={luckSec} />}
      {conclusionSec && <ConclusionChapter sec={conclusionSec} />}

      {/* Coda */}
      <Reveal delay={150}>
        <div className="text-center border-t border-divider pt-12">
          <p className="font-serif text-6xl text-ink-fade/10 select-none">命</p>
          <p className="mt-4 text-[12px] leading-relaxed text-ink-fade">八字命理分析属于传统文化范畴，报告内容仅供参考</p>
          <p className="mt-1 text-[12px] leading-relaxed text-ink-fade">命理提供概率和趋势，你的选择和行动才是决定性变量</p>
          <Link
            href="/bazi?from=report"
            className="mt-8 inline-flex min-h-10 items-center justify-center rounded-full border border-divider px-6 py-2.5 text-[11px] tracking-[0.12em] text-ink-fade transition-all hover:border-ink/30 hover:text-ink dark:hover:text-paper"
          >
            返回八字排盘
          </Link>
        </div>
      </Reveal>
    </article>
  );
}
