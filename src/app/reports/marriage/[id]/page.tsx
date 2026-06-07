"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { MarriageDeepReport } from "@/lib/marriage-deep-report";

// ========== Color tokens (match existing design system) ==========
const elColor: Record<string, string> = {
  "木": "#6B8C5C", "火": "#C4664A", "土": "#C4A24A", "金": "#B8A070", "水": "#5C7A9A",
};
const STEM_ELEMENT_FOR_DISPLAY: Record<string, string> = {
  "甲": "木", "乙": "木", "丙": "火", "丁": "火", "戊": "土", "己": "土", "庚": "金", "辛": "金", "壬": "水", "癸": "水",
};
const elBg: Record<string, string> = {
  "木": "rgba(107,140,92,0.08)", "火": "rgba(196,102,74,0.07)", "土": "rgba(196,162,74,0.08)", "金": "rgba(184,160,112,0.08)", "水": "rgba(92,122,154,0.07)",
};
const shenShaStyle = {
  "吉": { dot: "#8B6C4E", accent: "rgba(139,108,78,0.06)", border: "rgba(139,108,78,0.15)", label: "吉神" },
  "中性": { dot: "#B8A88A", accent: "rgba(184,168,138,0.05)", border: "rgba(184,168,138,0.15)", label: "中性神煞" },
  "凶": { dot: "#8B5E5E", accent: "rgba(139,94,94,0.05)", border: "rgba(139,94,94,0.15)", label: "凶煞" },
};

// Interaction type styling tokens
const interactionTokens: Record<string, { label: string; bar: string; bg: string }> = {
  "合": { label: "六合", bar: "#9B8E6B", bg: "rgba(155,142,107,0.08)" },
  "冲": { label: "六冲", bar: "#9B6B5E", bg: "rgba(155,107,94,0.07)" },
  "害": { label: "六害", bar: "#9B8A5E", bg: "rgba(155,138,94,0.07)" },
  "三合": { label: "三合", bar: "#7A8B6B", bg: "rgba(122,139,107,0.08)" },
  "半合": { label: "半合", bar: "#8A8B7B", bg: "rgba(138,139,123,0.07)" },
  "刑": { label: "相刑", bar: "#8B6B6B", bg: "rgba(139,107,107,0.07)" },
};

// Yearly activation type tokens
const yearlyTokens: Record<string, string> = {
  "桃花到位": "#5C7A9A",
  "合婚姻宫": "#9B8E6B",
  "冲婚姻宫": "#9B6B5E",
  "天干五合": "#6B8C5C",
  "三合日支": "#7A8B6B",
  "配偶星透": "#8B6C4E",
};

function cleanReportText(value: string) {
  return value
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s*(?:⚠️?\s*)?/gm, "")
    .replace(/^[\s]*[-*+]\s+/gm, "")
    .replace(/^[⊕⚡⚠△◐⊗]\s*/gm, "")
    .trim();
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

function DragScroll({ children, count }: { children: React.ReactNode; count: number }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const drag = useRef({ active: false, startX: 0, scrollLeft: 0 });
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragging, setDragging] = useState(false);

  const goTo = (index: number) => {
    const el = ref.current;
    if (!el) return;
    const safeIndex = Math.max(0, Math.min(count - 1, index));
    const card = el.children[safeIndex] as HTMLElement | undefined;
    card?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
    setActiveIndex(safeIndex);
  };

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-card to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-card to-transparent" />
      <div
        ref={ref}
        className={`flex touch-pan-y gap-4 overflow-x-auto px-1 pb-4 select-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
          dragging ? "cursor-grabbing snap-none" : "cursor-grab snap-x snap-mandatory scroll-smooth"
        }`}
        onScroll={(event) => {
          if (dragging) return;
          const el = event.currentTarget;
          const cards = Array.from(el.children) as HTMLElement[];
          const nearest = cards.reduce((best, card, index) => {
            const distance = Math.abs(card.offsetLeft - el.scrollLeft);
            return distance < best.distance ? { index, distance } : best;
          }, { index: 0, distance: Number.POSITIVE_INFINITY });
          setActiveIndex(nearest.index);
        }}
        onPointerDown={(event) => {
          const el = ref.current;
          if (!el) return;
          drag.current = { active: true, startX: event.clientX, scrollLeft: el.scrollLeft };
          setDragging(true);
          el.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          const el = ref.current;
          if (!el || !drag.current.active) return;
          el.scrollLeft = drag.current.scrollLeft - (event.clientX - drag.current.startX) * 1.35;
        }}
        onPointerUp={(event) => {
          drag.current.active = false;
          setDragging(false);
          ref.current?.releasePointerCapture(event.pointerId);
        }}
        onPointerCancel={() => { drag.current.active = false; setDragging(false); }}
      >
        {children}
      </div>
      <div className="mt-2 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => goTo(activeIndex - 1)}
          disabled={activeIndex === 0}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-divider text-sm text-ink-light transition-colors hover:border-ink/30 hover:text-ink disabled:opacity-25"
          aria-label="上一张大运卡片"
        >
          ←
        </button>
        <div className="flex flex-1 items-center justify-center gap-1.5">
          {Array.from({ length: count }, (_, index) => (
            <button
              type="button"
              key={index}
              onClick={() => goTo(index)}
              className={`h-1.5 rounded-full transition-all ${index === activeIndex ? "w-6 bg-ink/60" : "w-1.5 bg-divider"}`}
              aria-label={`查看第 ${index + 1} 步大运`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => goTo(activeIndex + 1)}
          disabled={activeIndex === count - 1}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-divider text-sm text-ink-light transition-colors hover:border-ink/30 hover:text-ink disabled:opacity-25"
          aria-label="下一张大运卡片"
        >
          →
        </button>
      </div>
    </div>
  );
}

// ========== Chapter header ==========
function ChapterHeader({ number, title, subtitle, highlights }: { number: string; title: string; subtitle?: string; highlights?: string[] }) {
  return (
    <div className="border-b border-divider px-8 py-7 sm:px-12">
      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-ink-fade">
        {number} / CHAPTER
      </p>
      <h2 className="mt-2 text-xl font-light tracking-[0.08em] text-ink dark:text-paper">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-2 text-[12px] leading-relaxed text-ink-light">{subtitle}</p>
      )}
      {highlights && highlights.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {highlights.map((h) => (
            <span key={h} className="rounded-full border border-divider px-3 py-1 text-[10px] tracking-[0.06em] text-ink-light">
              {cleanReportText(h)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ========== Section renderers ==========

/** Section 1: 命盘总览 — pillar cards + element stats */
function BaziOverview({ ov }: { ov: NonNullable<MarriageDeepReport["baziOverview"]> }) {
  return (
    <Reveal delay={50}>
      <section className="rounded-sm border border-divider bg-card">
        <div className="border-b border-divider px-8 py-5 sm:px-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-ink-fade">命盘底稿</p>
        </div>
        <div className="px-6 py-8 sm:px-10">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ov.pillars.map((p, i) => {
              const isDay = p.label === "日柱";
              const ec = elColor[p.element] ?? elColor["土"];
              const ebg = elBg[p.element] ?? elBg["土"];
              return (
                <div
                  key={p.label}
                  className={`group relative overflow-hidden rounded-sm border transition-all duration-500 ${
                    isDay ? "border-ink/20 ring-1 ring-ink/5 bg-ink/[0.02] lg:scale-105" : "border-divider bg-card hover:border-ink/15"
                  }`}
                  style={{ animation: `yx-rise 520ms ease both`, animationDelay: `${i * 50 + 80}ms` }}
                >
                  <div className="absolute inset-x-0 top-0 h-0.5 opacity-50 transition-all duration-500 group-hover:opacity-80" style={{ backgroundColor: ec }} />
                  <div className="px-4 py-5">
                    <div className="flex items-center justify-between">
                      <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-ink-fade">{p.label}</p>
                      {isDay && <span className="rounded-full bg-ink/[0.06] px-2 py-0.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-ink-fade">婚姻宫</span>}
                    </div>
                    <div className="mt-3 flex items-end gap-3">
                      <span className="text-4xl font-light tracking-[0.04em] text-ink dark:text-paper">{p.ganZhi}</span>
                      <span className="mb-1 rounded-full px-2 py-0.5 text-[9px] tracking-[0.1em]" style={{ backgroundColor: ebg, color: ec }}>{p.element}</span>
                    </div>
                    <div className="mt-4 space-y-1.5 border-t border-divider pt-3">
                      <div className="flex justify-between text-[10px]"><span className="text-ink-fade">十神</span><span className="font-medium text-ink dark:text-paper">{p.tenGod}</span></div>
                      <div className="flex justify-between text-[10px]"><span className="text-ink-fade">纳音</span><span className="text-ink-light">{p.nayin}</span></div>
                      <div className="flex justify-between text-[10px]"><span className="text-ink-fade">藏干</span><span className="text-ink-light">{p.hiddenTenGods.join(" · ") || "—"}</span></div>
                      {p.xunKong && <div className="flex justify-between text-[10px]"><span className="text-ink-fade">旬空</span><span className="text-ink-light">{p.xunKong}</span></div>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-divider pt-4 text-[11px]">
            <span className="text-ink-fade">日主 <span className="ml-1 font-medium text-ink dark:text-paper">{ov.dayMaster}</span><span className="ml-1 text-[10px] text-ink-fade">({ov.strength})</span></span>
            <span className="text-ink-fade">生肖 <span className="ml-1 font-medium text-ink dark:text-paper">{ov.zodiac}</span></span>
            <span className="text-ink-fade">命宫 <span className="ml-1 font-medium text-ink dark:text-paper">{ov.mingGong}</span></span>
            <span className="text-ink-fade">身宫 <span className="ml-1 font-medium text-ink dark:text-paper">{ov.shenGong}</span></span>
            <span className="ml-auto flex items-center gap-2.5">
              {Object.entries(ov.elements).sort((a, b) => b[1] - a[1]).map(([el, val]) => (
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
  );
}

/** Section 2: 婚姻宫精析 — interaction cards around the day branch */
function MarriagePalaceChapter({ sec, chapterNum }: { sec: MarriageDeepReport["sections"][number]; chapterNum: string }) {
  const bodyText = sec.body;
  const segments = bodyText.split(/\n(?=### )/);
  const introBlock = segments[0] ?? "";
  const subBlocks = segments.slice(1);
  const introLines = introBlock.split("\n").map(cleanReportText).filter(Boolean);
  const overviewText = introLines[0] ?? "";
  const relationText = introLines.slice(1).join(" ");
  const dayBranch = overviewText.match(/日支「([^」]+)」/)?.[1] ?? sec.highlights[0] ?? "—";
  const element = overviewText.match(/五行属([^，。]+)/)?.[1] ?? "—";
  const nayin = overviewText.match(/纳音「([^」]+)」/)?.[1] ?? "—";
  const hiddenStems = overviewText.match(/藏干[：:]\s*([^。]+)/)?.[1] ?? "—";
  const relationName = relationText.match(/(同气相求|相生有情|日主生宫|婚姻宫生日主|相克|比和)/)?.[1] ?? "五行关系";

  const renderInteraction = (line: string, key: string) => {
    const match = line.match(/^- (?:[⊕⚡⚠△◐⊗]\s*)?\*\*(.+?(六合|六冲|六害|三合|半合|相刑))\*\*[：:]\s*(.*)$/);
    if (!match) {
      return <p key={key} className="border-l-2 border-divider pl-4 text-[12px] leading-7 text-ink-light">{cleanReportText(line.replace(/^- /, ""))}</p>;
    }

    const relation = match[2];
    const interType = relation.includes("合") ? "合" : relation.includes("冲") ? "冲" : relation.includes("害") ? "害" : "刑";
    const tokens = interactionTokens[interType] ?? interactionTokens["合"];

    return (
      <div key={key} className="grid gap-3 rounded-sm border border-divider bg-card px-4 py-4 sm:grid-cols-[8.5rem_1fr] sm:gap-5">
        <div className="flex items-start gap-3">
          <span className="mt-2 h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: tokens.bar }} />
          <div>
            <div className="text-[12px] font-semibold text-ink dark:text-paper">{cleanReportText(match[1])}</div>
            <div className="mt-1 text-[10px] tracking-[0.12em] text-ink-fade">{tokens.label} · 柱位关系</div>
          </div>
        </div>
        <p className="text-[12px] leading-7 text-ink-light">{cleanReportText(match[3])}</p>
      </div>
    );
  };

  return (
    <Reveal delay={60}>
      <section className="rounded-sm border border-divider bg-card">
        <ChapterHeader number={chapterNum} title={sec.title} subtitle={sec.subtitle} highlights={sec.highlights} />

        <div className="px-6 py-8 sm:px-10">
          <div className="grid overflow-hidden rounded-sm border border-divider sm:grid-cols-4">
            {[
              ["婚姻宫日支", dayBranch],
              ["五行属性", element],
              ["纳音", nayin],
              ["藏干", hiddenStems],
            ].map(([label, value], index) => (
              <div key={label} className={`px-4 py-5 ${index > 0 ? "border-t border-divider sm:border-l sm:border-t-0" : ""}`}>
                <div className="text-[9px] font-semibold tracking-[0.16em] text-ink-fade">{label}</div>
                <div className={`mt-2 text-ink dark:text-paper ${index === 0 ? "font-serif text-3xl" : "text-[13px] font-medium leading-6"}`}>{value}</div>
              </div>
            ))}
          </div>

          {relationText && (
            <div className="mt-6 grid gap-4 rounded-sm border border-divider bg-warm/35 px-5 py-5 sm:grid-cols-[9rem_1fr] sm:gap-6">
              <div>
                <div className="text-[9px] font-semibold tracking-[0.16em] text-ink-fade">五行关系判断</div>
                <div className="mt-2 text-lg font-medium text-ink dark:text-paper">{relationName}</div>
              </div>
              <p className="border-t border-divider pt-4 text-[12px] leading-7 text-ink-light sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">{relationText}</p>
            </div>
          )}

          {subBlocks.map((block, bi) => {
            const lines = block.split("\n").filter(Boolean);
            const headingLine = lines[0] ?? "";
            return (
              <div key={bi} className="mt-8 border-t border-divider pt-6">
                <h3 className="mb-4 text-[11px] font-semibold tracking-[0.14em] text-ink dark:text-paper">
                  {cleanReportText(headingLine.replace("### ", ""))}
                </h3>
                <div className="space-y-3">
                  {lines.slice(1).map((line, li) => renderInteraction(line, `${bi}-${li}`))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </Reveal>
  );
}

/** Section 3: 配偶星全维分析 — dashboard layout */
function SpouseStarChapter({ sec, chapterNum }: { sec: MarriageDeepReport["sections"][number]; chapterNum: string }) {
  const bodyText = sec.body;
  const totalMatch = bodyText.match(/出现\s*\*{0,2}(\d+)\*{0,2}\s*次/);
  const qualityMatch = bodyText.match(/综合评级[：:]\s*「?\*{0,2}([^*」\n]{1,8})\*{0,2}」?/);
  const surfaceMatch = bodyText.match(/天干透出\s*(\d+)\s*次/);
  const hiddenMatch = bodyText.match(/地支藏干\s*(\d+)\s*次/);
  const positionMatch = bodyText.match(/出现位置[：:]\s*(.+?)(?:[。\n]|$)/);
  const introText = cleanReportText(bodyText.split(/\n### /)[0] ?? "");
  const sectionMap = new Map<string, string>();
  for (const match of bodyText.matchAll(/### ([^\n]+)\n([\s\S]*?)(?=\n### |$)/g)) {
    sectionMap.set(cleanReportText(match[1]), match[2].trim());
  }
  const configurationText = sectionMap.get("配偶星配置") ?? "";
  const seasonText = sectionMap.get("配偶星得令判断") ?? "";
  const portraitText = sectionMap.get("配偶星取象与配偶画像") ?? "";
  const tenGodText = sectionMap.get("十神格局中的感情信号") ?? "";
  const portraitLines = portraitText.split("\n").filter(Boolean);
  const portraitDisclaimer = portraitLines.find((line) => line.startsWith(">"));
  const portraitBody = portraitLines.filter((line) => !line.startsWith(">"));
  const tenGodItems = tenGodText.split("\n").filter(Boolean).map((line) => cleanReportText(line.replace(/^\d+\.\s*/, "")));

  return (
    <Reveal delay={70}>
      <section className="rounded-sm border border-divider bg-card">
        <ChapterHeader number={chapterNum} title={sec.title} subtitle={sec.subtitle} highlights={sec.highlights} />

        <div className="px-6 py-8 sm:px-10">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-sm border border-divider bg-card px-5 py-5">
              <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-ink-fade">出现次数</p>
              <p className="mt-2 text-[30px] font-light tracking-[0.04em] text-ink dark:text-paper">{totalMatch?.[1] ?? "—"}</p>
              <p className="mt-1 text-[10px] text-ink-fade">四柱天干与地支藏干合计</p>
            </div>
            <div className="rounded-sm border border-divider bg-card px-5 py-5">
              <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-ink-fade">透藏分布</p>
              <div className="mt-3 flex items-end gap-5">
                <div><span className="text-2xl font-light text-ink dark:text-paper">{surfaceMatch?.[1] ?? "—"}</span><span className="ml-1 text-[10px] text-ink-fade">天干</span></div>
                <div><span className="text-2xl font-light text-ink dark:text-paper">{hiddenMatch?.[1] ?? "—"}</span><span className="ml-1 text-[10px] text-ink-fade">地支</span></div>
              </div>
              <p className="mt-2 text-[10px] text-ink-fade">透干主显，藏支主隐</p>
            </div>
            <div className="rounded-sm border border-divider bg-card px-5 py-5">
              <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-ink-fade">综合评级</p>
              <p className="mt-3 text-xl font-medium tracking-[0.08em] text-ink dark:text-paper">{cleanReportText(qualityMatch?.[1] ?? "—")}</p>
              <p className="mt-2 text-[10px] text-ink-fade">基于出现次数、透藏与位置综合观察</p>
            </div>
          </div>

          <div className="mt-8 max-w-[70ch] space-y-8">
            <section className="border-l-2 border-ink/20 pl-5">
              <p className="text-[10px] font-semibold tracking-[0.14em] text-ink-fade">命理取法</p>
              <p className="mt-2 text-[12px] leading-7 text-ink-light">{introText}</p>
            </section>

            <section className="border-t border-divider pt-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-[12px] font-semibold tracking-[0.12em] text-ink dark:text-paper">配置判断</h3>
                {positionMatch?.[1] && (
                  <div className="flex flex-wrap gap-1.5">
                    {positionMatch[1].split("、").map((position) => (
                      <span key={position} className="rounded-full border border-divider px-2.5 py-1 text-[9px] tracking-[0.08em] text-ink-fade">{position}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-4 space-y-3">
                {configurationText.split("\n").filter(Boolean).filter((line) => !line.startsWith("出现位置")).map((line, index) => (
                  <p key={index} className="text-[12px] leading-7 text-ink-light">{cleanReportText(line)}</p>
                ))}
              </div>
            </section>

            {seasonText && (
              <section className="border-t border-divider pt-6">
                <h3 className="text-[12px] font-semibold tracking-[0.12em] text-ink dark:text-paper">月令关系</h3>
                <p className="mt-3 text-[12px] leading-7 text-ink-light">{cleanReportText(seasonText)}</p>
              </section>
            )}

            {portraitBody.length > 0 && (
              <section className="border-t border-divider pt-6">
                <h3 className="text-[12px] font-semibold tracking-[0.12em] text-ink dark:text-paper">配偶星取象</h3>
                <div className="mt-3 space-y-3">
                  {portraitBody.map((line, index) => <p key={index} className="text-[12px] leading-7 text-ink-light">{cleanReportText(line)}</p>)}
                </div>
                {portraitDisclaimer && <p className="mt-4 border-l-2 border-divider pl-4 text-[11px] leading-6 text-ink-fade">{cleanReportText(portraitDisclaimer)}</p>}
              </section>
            )}

            {tenGodItems.length > 0 && (
              <section className="border-t border-divider pt-6">
                <h3 className="text-[12px] font-semibold tracking-[0.12em] text-ink dark:text-paper">十神格局补充</h3>
                <div className="mt-4 space-y-4">
                  {tenGodItems.map((item, index) => (
                    <div key={index} className="grid gap-3 sm:grid-cols-[28px_1fr]">
                      <span className="text-[10px] font-semibold tabular-nums text-ink-fade">{String(index + 1).padStart(2, "0")}</span>
                      <p className="text-[12px] leading-7 text-ink-light">{cleanReportText(item)}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </section>
    </Reveal>
  );
}

/** Section 4: 神煞关键信号 — highlighted entry cards */
function ShenShaChapter({ sec, chapterNum }: { sec: MarriageDeepReport["sections"][number]; chapterNum: string }) {
  const data = sec.data as {
    primary?: { name: string; position: string }[];
    jiCount?: number;
    xiongCount?: number;
  } | undefined;
  const primaryEntries = data?.primary ?? [];

  return (
    <Reveal delay={80}>
      <section className="rounded-sm border border-divider bg-card">
        <ChapterHeader number={chapterNum} title={sec.title} subtitle={sec.subtitle} highlights={sec.highlights} />

        <div className="px-5 py-6 sm:px-8 sm:py-8">
          {/* Lead text */}
          <p className="mb-8 max-w-[62ch] text-[12px] leading-7 text-ink-light">
            {cleanReportText(sec.body.split("\n").find(l => !l.startsWith("#") && !l.startsWith(">") && l.length > 20)?.slice(0, 120) ?? "")}
          </p>

          {/* Parse shensha entries from body text */}
          {(() => {
            const entries: { name: string; position: string; basis: string; analysis: string }[] = [];
            const entryRegex = /\*\*([\s\S]+?)\*\*（(.+?)）\n> 取法[：:]\s*([\s\S]+?)\n>\s*([\s\S]+?)(?=\n\n|\n\*\*|$)/g;
            let m;
            while ((m = entryRegex.exec(sec.body)) !== null) {
              entries.push({ name: m[1], position: m[2], basis: m[3], analysis: m[4] });
            }
            if (entries.length === 0) return null;

            return entries.map((entry, i) => {
              const category = entry.name.includes("贵人") || entry.name.includes("红鸾") || entry.name.includes("天喜") || entry.name.includes("禄神") || entry.name.includes("文昌") || entry.name.includes("金舆") ? "吉"
                : entry.name.includes("孤辰") || entry.name.includes("寡宿") || entry.name.includes("孤鸾") || entry.name.includes("阴差阳错") || entry.name.includes("羊刃") || entry.name.includes("劫煞") || entry.name.includes("亡神") ? "凶" : "中性";
              const style = shenShaStyle[category as keyof typeof shenShaStyle] ?? shenShaStyle["中性"];

              return (
                <article
                  key={`${entry.name}-${i}`}
                  className="group mb-4 overflow-hidden rounded-sm border transition-all duration-300 hover:-translate-y-0.5"
                  style={{ borderColor: style.border, backgroundColor: style.accent, animation: `yx-fade-up 0.5s ease both`, animationDelay: `${i * 30}ms` }}
                >
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-divider bg-card/70 px-5 py-4 sm:px-7">
                    <div className="flex items-center gap-2 rounded-full border px-3 py-1.5" style={{ borderColor: style.border }}>
                      <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: style.dot }} />
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: style.dot }}>{style.label}</p>
                    </div>
                    <h3 className="text-xl font-medium tracking-[0.10em] text-ink dark:text-paper">{entry.name}</h3>
                    <p className="ml-auto text-[11px] tracking-[0.10em] text-ink-fade">落于 <span className="font-semibold text-ink-light">{entry.position}</span></p>
                  </div>
                  <div className="px-5 py-5 sm:px-7">
                    <div className="mb-4 border-l-2 pl-4" style={{ borderColor: style.dot }}>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: style.dot }}>姻缘研判</p>
                      <p className="mt-2 text-[13px] leading-7 text-ink-light">{entry.analysis}</p>
                    </div>
                    <div className="rounded-sm border border-divider bg-card/70 px-4 py-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-fade">取法依据</p>
                      <p className="mt-1.5 text-[11px] leading-6 text-ink-light">{entry.basis}</p>
                    </div>
                  </div>
                </article>
              );
            });
          })()}
        </div>
      </section>
    </Reveal>
  );
}

/** Section 5: 大运婚姻走势 — drag-scroll cards */
function LuckCyclesChapter({ sec, chapterNum }: { sec: MarriageDeepReport["sections"][number]; chapterNum: string }) {
  const data = sec.data as {
    keyCount?: number;
    totalCycles?: number;
  } | undefined;

  // Parse luck cycle blocks from body
  const cycleBlocks: { ganZhi: string; ages: string; isCurrent: boolean; lines: string[] }[] = [];
  const blockRegex = /### (▶\s*)?(\S+)（(\d+)-(\d+)岁）([^]*?)(?=### |$)/g;
  let m;
  while ((m = blockRegex.exec(sec.body)) !== null) {
    cycleBlocks.push({
      ganZhi: m[2],
      ages: `${m[3]}-${m[4]}岁`,
      isCurrent: !!m[1],
      lines: m[5].trim().split("\n").filter(l => l.startsWith("-")),
    });
  }

  return (
    <Reveal delay={90}>
      <section className="rounded-sm border border-divider bg-card">
        <ChapterHeader number={chapterNum} title={sec.title} subtitle={sec.subtitle} highlights={sec.highlights} />

        <div className="px-6 py-8 sm:px-10">
          {cycleBlocks.length > 0 ? (
            <>
              <div className="mb-4 flex items-center justify-between gap-4">
                <p className="text-[10px] tracking-[0.12em] text-ink-fade">左右拖动，或使用下方按钮翻页</p>
                <p className="shrink-0 text-[10px] tabular-nums text-ink-fade">{cycleBlocks.length} 步大运</p>
              </div>

              <DragScroll count={cycleBlocks.length}>
                {cycleBlocks.map((block, i) => (
                  <article
                    key={i}
                    className={`relative min-h-64 w-[82vw] max-w-[280px] shrink-0 snap-start rounded-sm border px-5 py-5 select-none transition-all sm:w-[280px] ${
                      block.isCurrent ? "border-ink/25 bg-ink/[0.025] dark:border-paper/25 dark:bg-paper/[0.02]" : "border-divider bg-card"
                    }`}
                    style={{ animation: `yx-rise 400ms ease both`, animationDelay: `${i * 30 + 60}ms` }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-xl font-medium tracking-[0.12em] text-ink dark:text-paper">{block.ganZhi}</span>
                        <span className="ml-2 text-[11px] text-ink-fade">{block.ages}</span>
                      </div>
                      {block.isCurrent && (
                        <span className="shrink-0 rounded-full bg-ink px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-paper dark:bg-paper dark:text-ink">当前</span>
                      )}
                    </div>
                    <div className="mt-4 space-y-2">
                      {block.lines.map((line, li) => {
                        const clean = line.replace(/^-\s*\*{0,2}(.+?)\*{0,2}[：:]\s*/, "$1：");
                        const parts = clean.split(/[：:]/);
                        if (parts.length >= 2) {
                          return (
                            <div key={li} className="rounded-sm bg-divider/20 px-3 py-2 dark:bg-divider/10">
                              <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-ink-fade">{parts[0]}</p>
                              <p className="mt-1 text-[11px] leading-5 text-ink-light">{parts.slice(1).join("：")}</p>
                            </div>
                          );
                        }
                        return <p key={li} className="text-[11px] leading-5 text-ink-light">{clean}</p>;
                      })}
                    </div>
                  </article>
                ))}
              </DragScroll>
            </>
          ) : (
            <div className="max-w-[68ch]">
              <p className="whitespace-pre-line text-[12px] leading-7 text-ink-light">{cleanReportText(sec.body.split("\n").filter(l => !l.startsWith("#") && l.length > 10).join("\n"))}</p>
            </div>
          )}
        </div>
      </section>
    </Reveal>
  );
}

/** Section 6: 流年引动节点 — horizontal timeline */
function YearlyActivationChapter({ sec, chapterNum }: { sec: MarriageDeepReport["sections"][number]; chapterNum: string }) {
  const data = sec.data as {
    pastYears?: number[];
    currentYear?: number | null;
    futureYears?: number[];
    yearReasons?: Record<number, string>;
  } | undefined;

  const now = new Date().getFullYear();
  const pastYears = data?.pastYears ?? [];
  const currentYear = data?.currentYear ?? null;
  const futureYears = data?.futureYears ?? [];

  // Parse year entries from body
  const yearEntries: { year: number; type: string; detail: string; advice: string; isPast: boolean; isCurrent: boolean }[] = [];
  const yearRegex = /\*{0,2}(\d{4})年\*{0,2}\n- 引动[：:]\s*(.+?)\n- (.+?)\n- 建议[：:]\s*(.+?)(?=\n\n|\n\*|$)/g;
  let ym;
  while ((ym = yearRegex.exec(sec.body)) !== null) {
    const y = parseInt(ym[1]);
    yearEntries.push({
      year: y,
      type: ym[2],
      detail: ym[3],
      advice: ym[4],
      isPast: y < now,
      isCurrent: y === now,
    });
  }

  return (
    <Reveal delay={100}>
      <section className="rounded-sm border border-divider bg-card">
        <ChapterHeader number={chapterNum} title={sec.title} subtitle={sec.subtitle} highlights={sec.highlights} />

        <div className="px-6 py-8 sm:px-10">
          {yearEntries.length > 0 ? (
            <div className="flex items-start gap-0 overflow-x-auto pb-2">
              {yearEntries.map((entry, i) => {
                const types = entry.type.split("+");
                const isCurrent = entry.isCurrent;

                return (
                  <div key={entry.year} className="flex items-stretch shrink-0">
                    {i > 0 && (
                      <div className="flex items-center px-1">
                        <svg width="16" height="2" className="text-divider"><line x1="0" y1="1" x2="16" y2="1" stroke="currentColor" strokeWidth="1" /></svg>
                      </div>
                    )}
                    <article
                      className={`relative w-[160px] shrink-0 rounded-sm border px-4 py-5 transition-all duration-300 hover:-translate-y-1 ${
                        isCurrent
                          ? "border-ink/25 bg-ink/[0.03] dark:border-paper/25 dark:bg-paper/[0.03] shadow-[0_4px_20px_rgba(44,36,22,0.06)]"
                          : entry.isPast
                            ? "border-divider bg-card opacity-50"
                            : "border-divider bg-card"
                      }`}
                      style={{ animation: `yx-rise 400ms ease both`, animationDelay: `${i * 50 + 40}ms` }}
                    >
                      {isCurrent && (
                        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-ink px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-paper dark:bg-paper dark:text-ink">
                          今年
                        </div>
                      )}
                      <p className={`text-[9px] font-semibold uppercase tracking-[0.14em] ${isCurrent ? "text-ink dark:text-paper" : "text-ink-fade"}`}>
                        {entry.year}
                      </p>
                      <div className="mt-3 space-y-1.5">
                        {types.map((t) => {
                          const color = yearlyTokens[t.trim()] ?? "#B8A070";
                          return (
                            <span key={t} className="inline-block rounded-full px-2.5 py-1 text-[10px] tracking-[0.06em]" style={{ backgroundColor: color + "18", color }}>
                              {t.trim()}
                            </span>
                          );
                        })}
                      </div>
                      <p className="mt-3 text-[11px] leading-5 text-ink-light line-clamp-3">{cleanReportText(entry.detail)}</p>
                      <div className="mt-3 border-t border-divider pt-2.5">
                        <p className="text-[10px] font-medium tracking-[0.06em] text-ink-fade">{cleanReportText(entry.advice)}</p>
                      </div>
                    </article>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="whitespace-pre-line text-[12px] leading-7 text-ink-light max-w-[68ch]">{cleanReportText(sec.body)}</p>
          )}
        </div>
      </section>
    </Reveal>
  );
}

/** Section 7: 综合研判与建议 — two-panel layout */
function SynthesisChapter({ sec, chapterNum }: { sec: MarriageDeepReport["sections"][number]; chapterNum: string }) {
  const bodyText = sec.body;

  // Split into strengths and challenges
  const strengthsMatch = bodyText.match(/### 核心优势\n([\s\S]*?)(?=\n### |$)/);
  const challengesMatch = bodyText.match(/### 需要经营的课题\n([\s\S]*?)(?=\n### |$)/);
  const timingMatch = bodyText.match(/### 关键时间窗口\n([\s\S]*?)(?=\n### |$)/);
  const adviceMatch = bodyText.match(/### 个性化建议\n([\s\S]*?)(?=$)/);

  const strengthsItems = strengthsMatch?.[1]?.split("\n").filter(l => l.startsWith("- ")).map(cleanReportText) ?? [];
  const challengesItems = challengesMatch?.[1]?.split("\n").filter(l => l.startsWith("- ")).map(cleanReportText) ?? [];

  return (
    <Reveal delay={110}>
      <section className="rounded-sm border border-divider bg-card">
        <ChapterHeader number={chapterNum} title={sec.title} subtitle={sec.subtitle} />

        <div className="px-6 py-8 sm:px-10">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Strengths */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6B8C5C]">核心优势</span>
                <span className="rounded-full bg-[#6B8C5C]/10 px-2 py-0.5 text-[10px] tabular-nums text-[#6B8C5C]">{strengthsItems.length}</span>
              </div>
              <div className="space-y-3">
                {strengthsItems.length > 0 ? strengthsItems.map((item, i) => (
                  <div key={i} className="rounded-sm border border-divider bg-card px-4 py-4 transition-all duration-300 hover:-translate-y-0.5" style={{ animation: `yx-fade-up 0.4s ease both`, animationDelay: `${i * 60 + 50}ms` }}>
                    <p className="text-[12px] leading-7 text-ink-light">{cleanReportText(item)}</p>
                  </div>
                )) : (
                  <p className="text-[12px] leading-7 text-ink-fade">命盘中没有特别突出的先天优势信号——这意味着你的感情走向更多取决于后天经营而非先天配置。</p>
                )}
              </div>
            </div>

            {/* Challenges */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9B6B5E]">需经营课题</span>
                <span className="rounded-full bg-[#9B6B5E]/10 px-2 py-0.5 text-[10px] tabular-nums text-[#9B6B5E]">{challengesItems.length}</span>
              </div>
              <div className="space-y-3">
                {challengesItems.length > 0 ? challengesItems.map((item, i) => (
                  <div key={i} className="rounded-sm border border-divider bg-card px-4 py-4 transition-all duration-300 hover:-translate-y-0.5" style={{ animation: `yx-fade-up 0.4s ease both`, animationDelay: `${i * 60 + 100}ms` }}>
                    <p className="text-[12px] leading-7 text-ink-light">{cleanReportText(item)}</p>
                  </div>
                )) : (
                  <p className="text-[12px] leading-7 text-ink-fade">盘面中未见需要特别留意的结构性问题。在保持良好沟通的基础上，顺其自然地推进关系即可。</p>
                )}
              </div>
            </div>
          </div>

          {/* Timing + Advice */}
          {(timingMatch || adviceMatch) && (
            <div className="mt-8 border-t border-divider pt-6">
              {timingMatch && (
                <div className="mb-6">
                  <h3 className="mb-3 text-[11px] font-semibold tracking-[0.14em] text-ink dark:text-paper">关键时间窗口</h3>
                  <div className="rounded-sm border border-divider bg-divider/20 px-5 py-4 dark:bg-divider/10">
                    <p className="whitespace-pre-line text-[12px] leading-7 text-ink-light">{cleanReportText(timingMatch[1])}</p>
                  </div>
                </div>
              )}
              {adviceMatch && (
                <div>
                  <h3 className="mb-3 text-[11px] font-semibold tracking-[0.14em] text-ink dark:text-paper">个性化建议</h3>
                  <p className="whitespace-pre-line text-[12px] leading-7 text-ink-light max-w-[66ch]">{cleanReportText(adviceMatch[1])}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </Reveal>
  );
}

/** Section 8: 附录 — rule reference card grid */
function AppendixChapter({ sec, chapterNum }: { sec: MarriageDeepReport["sections"][number]; chapterNum: string }) {
  // Parse rule entries
  const rules: { rule: string; source: string; note: string }[] = [];
  const ruleRegex = /(\d+)\.\s*\*{0,2}(.+?)\*{0,2}（(.+?)）[：:]\s*(.+?)(?=\n\d+\.|\n---|$)/g;
  let rm;
  while ((rm = ruleRegex.exec(sec.body)) !== null) {
    rules.push({ rule: rm[2], source: rm[3], note: rm[4] });
  }

  return (
    <Reveal delay={120}>
      <section className="rounded-sm border border-divider bg-card">
        <ChapterHeader number={chapterNum} title={sec.title} subtitle={sec.subtitle} />

        <div className="px-6 py-8 sm:px-10">
          {rules.length > 0 && (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {rules.map((rule, i) => (
                <div key={i} className="rounded-sm border border-divider bg-card px-4 py-4 transition-all duration-300 hover:-translate-y-0.5" style={{ animation: `yx-fade-up 0.4s ease both`, animationDelay: `${i * 30}ms` }}>
                  <p className="text-[11px] font-medium tracking-[0.06em] text-ink dark:text-paper">{rule.rule}</p>
                  <p className="mt-1 text-[10px] tracking-[0.04em] text-ink-fade">{rule.source}</p>
                  <p className="mt-2 text-[11px] leading-5 text-ink-light">{rule.note}</p>
                </div>
              ))}
            </div>
          )}

          {/* Disclaimer */}
          <div className="mt-8 border-t border-divider pt-6 text-center">
            <p className="text-[11px] leading-6 text-ink-fade">
              {sec.body.split("\n").find(l => l.includes("免责声明"))?.replace(/\*{2}/g, "") ?? "八字命理分析属于传统文化范畴，报告内容仅供参考和反思。"}
            </p>
          </div>
        </div>
      </section>
    </Reveal>
  );
}

/** Generic fallback for any section not matched by type */
function GenericChapter({ sec, chapterNum }: { sec: MarriageDeepReport["sections"][number]; chapterNum: string }) {
  const bodyText = sec.body;
  const paragraphs = bodyText.split("\n\n").filter(Boolean);

  return (
    <Reveal delay={60}>
      <section className="rounded-sm border border-divider bg-card">
        <ChapterHeader number={chapterNum} title={sec.title} subtitle={sec.subtitle} highlights={sec.highlights} />
        <div className="px-8 py-8 sm:px-12">
          <div className="max-w-[68ch] space-y-5">
            {paragraphs.map((para, pi) => (
              <p key={pi} className="text-[12px] leading-7 text-ink-light">{para}</p>
            ))}
          </div>
        </div>
      </section>
    </Reveal>
  );
}

type PairContentBlock = {
  heading: string;
  lines: string[];
};

function parsePairBlocks(body: string): PairContentBlock[] {
  const blocks: PairContentBlock[] = [];
  let current: PairContentBlock = { heading: "", lines: [] };

  for (const rawLine of body.split("\n")) {
    if (rawLine.startsWith("### ")) {
      if (current.heading || current.lines.some(Boolean)) blocks.push(current);
      current = { heading: cleanReportText(rawLine), lines: [] };
    } else {
      current.lines.push(rawLine);
    }
  }
  if (current.heading || current.lines.some(Boolean)) blocks.push(current);
  return blocks;
}

function PairChartComparison({ sec, chapterNum }: { sec: MarriageDeepReport["sections"][number]; chapterNum: string }) {
  const blocks = parsePairBlocks(sec.body);
  const charts = blocks.filter(block => block.heading.includes("方命盘"));

  const parseChart = (block: PairContentBlock) => {
    const rows = block.lines
      .filter(line => line.startsWith("|") && !/^\|[-|\s]+\|$/.test(line))
      .map(line => line.split("|").slice(1, -1).map(cleanReportText));
    const summary = block.lines.find(line => line.startsWith("日主：")) ?? "";
    const facts = cleanReportText(summary).split(/\s*\|\s*/).map((part) => {
      const [label, ...value] = part.split(/[：:]/);
      return { label, value: value.join("：") };
    }).filter(fact => fact.label && fact.value);
    return { rows: rows.slice(1), facts };
  };

  return (
    <Reveal delay={60}>
      <section className="rounded-sm border border-divider bg-card">
        <ChapterHeader number={chapterNum} title={sec.title} subtitle={sec.subtitle} />
        <div className="px-5 py-6 sm:px-8 sm:py-8">
          <div className="grid gap-5 lg:grid-cols-2">
            {charts.map((block) => {
              const chart = parseChart(block);
              return (
                <div key={block.heading} className="overflow-hidden rounded-sm border border-divider">
                  <div className="flex items-center justify-between border-b border-divider bg-divider/15 px-4 py-3">
                    <h3 className="text-[12px] font-semibold tracking-[0.12em] text-ink dark:text-paper">{block.heading}</h3>
                    <span className="text-[9px] tracking-[0.12em] text-ink-fade">四柱命盘</span>
                  </div>
                  <div className="grid grid-cols-4 divide-x divide-divider border-b border-divider">
                    {chart.rows.map((row) => (
                      <div key={`${block.heading}-${row[0]}`} className="px-2 py-4 text-center">
                        <div className="text-[9px] tracking-[0.12em] text-ink-fade">{row[0]}</div>
                        <div className="mt-2 font-serif text-xl text-ink dark:text-paper">{row[1]}</div>
                        <div className="mt-2 text-[9px] leading-5 text-ink-fade">{row[3]} · {row[4]}</div>
                        <div className="text-[9px] leading-5 text-ink-fade">{row[2]}</div>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-px bg-divider sm:grid-cols-5">
                    {chart.facts.map((fact) => (
                      <div key={`${block.heading}-${fact.label}`} className="bg-card px-3 py-3">
                        <div className="text-[9px] tracking-[0.12em] text-ink-fade">{fact.label}</div>
                        <div className="mt-1 text-[11px] font-medium leading-5 text-ink dark:text-paper">{fact.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </Reveal>
  );
}

function PairElementInteraction({ sec, chapterNum }: { sec: MarriageDeepReport["sections"][number]; chapterNum: string }) {
  const blocks = parsePairBlocks(sec.body);
  const relation = blocks.find(block => block.heading === "五行生克链条");
  const distribution = blocks.find(block => block.heading === "五行分布对比");
  const nayin = blocks.find(block => block.heading === "纳音配对");
  const useful = blocks.find(block => block.heading === "用神互补");
  const relationText = cleanReportText(relation?.lines.find(Boolean) ?? "");
  const relationElements = relationText.match(/甲方([木火土金水]).*乙方([木火土金水])/)?.slice(1) ?? sec.highlights.filter(item => /^[木火土金水]$/.test(item)).slice(0, 2);
  const elementRows = (distribution?.lines ?? []).map((line) => {
    const match = cleanReportText(line).match(/^([木火土金水])[：:]\s*甲方(\d+)\s*·\s*乙方(\d+)(.*)$/);
    return match ? { element: match[1], a: Number(match[2]), b: Number(match[3]), note: match[4].replace(/[（）]/g, "") } : null;
  }).filter((row): row is { element: string; a: number; b: number; note: string } => Boolean(row));

  const insightCards = [
    { title: "纳音配对", lines: nayin?.lines.filter(Boolean) ?? [] },
    { title: "用神互补", lines: useful?.lines.filter(Boolean) ?? [] },
  ];

  return (
    <Reveal delay={60}>
      <section className="overflow-hidden rounded-sm border border-divider bg-card">
        <ChapterHeader number={chapterNum} title={sec.title} subtitle={sec.subtitle} />
        <div className="space-y-6 px-6 py-8 sm:px-10">
          <div className="relative overflow-hidden rounded-sm border border-divider bg-card">
            {/* Top gradient bar */}
            <div className="absolute inset-x-0 top-0 h-1" style={{ background: `linear-gradient(90deg, ${elColor[relationElements[0]] ?? "#5C7A9A"}, ${elColor[relationElements[1]] ?? "#C4664A"})` }} />

            <div className="px-6 py-8 sm:px-10">
              {/* Two element cards + relation badge */}
              <div className="flex items-stretch gap-0">
                {/* 甲方 */}
                <div className="flex-1 rounded-l-sm border border-r-0 border-divider px-5 py-6" style={{ backgroundColor: elBg[relationElements[0]] ?? elBg["水"] }}>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-ink-fade">甲方主导五行</p>
                  <p className="mt-2 font-serif text-5xl leading-none tracking-[0.04em]" style={{ color: elColor[relationElements[0]] ?? elColor["水"] }}>{relationElements[0]}</p>
                </div>

                {/* Center — relation badge */}
                <div className="flex shrink-0 flex-col items-center justify-center border-y border-divider bg-divider/10 px-4 py-3 min-w-[5rem]">
                  <div className="rounded-full border border-divider bg-card px-3 py-1.5">
                    <span className="text-[10px] font-semibold tracking-[0.12em] text-ink dark:text-paper">
                      {relationText.includes("生") && !relationText.includes("不生") ? "相生" : relationText.includes("克") ? "相克" : "同气"}
                    </span>
                  </div>
                  <svg width="24" height="1" className="mt-1.5 text-divider"><line x1="0" y1="0.5" x2="24" y2="0.5" stroke="currentColor" /></svg>
                  <span className="text-[8px] tracking-[0.14em] text-ink-fade">生克关系</span>
                </div>

                {/* 乙方 */}
                <div className="flex-1 rounded-r-sm border border-l-0 border-divider px-5 py-6 text-right" style={{ backgroundColor: elBg[relationElements[1]] ?? elBg["火"] }}>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-ink-fade">乙方主导五行</p>
                  <p className="mt-2 font-serif text-5xl leading-none tracking-[0.04em]" style={{ color: elColor[relationElements[1]] ?? elColor["火"] }}>{relationElements[1]}</p>
                </div>
              </div>

              {/* Description */}
              <p className="mt-5 max-w-[64ch] text-[12px] leading-7 text-ink-light">{relationText}</p>
            </div>
          </div>

          <div className="rounded-sm border border-divider px-5 py-5 sm:px-6">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-[11px] font-semibold tracking-[0.14em] text-ink dark:text-paper">五行分布对比</h3>
              <div className="flex gap-4 text-[9px] tracking-[0.1em] text-ink-fade">
                <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-sm bg-[#6B8C5C]" />甲 ←</span>
                <span className="flex items-center gap-1">→ 乙 <span className="inline-block h-2 w-2 rounded-sm bg-[#6B8C5C]/50" /></span>
              </div>
            </div>
            <div className="space-y-4">
              {(() => {
                const globalMax = Math.max(...elementRows.map(r => Math.max(r.a, r.b)), 1);
                return elementRows.map((row, index) => {
                  const aPct = Math.max(3, row.a / globalMax * 50);
                  const bPct = Math.max(3, row.b / globalMax * 50);
                  return (
                  <div key={row.element} className="grid grid-cols-[2rem_1fr] gap-4 items-center" style={{ animation: `yx-fade-up 0.45s ease both`, animationDelay: `${index * 70}ms` }}>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full font-serif text-lg" style={{ color: elColor[row.element], backgroundColor: elBg[row.element] }}>{row.element}</div>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="flex items-center gap-1.5 text-[10px]">
                          <span className="inline-block h-2 w-2 rounded-sm" style={{ backgroundColor: elColor[row.element] }} />
                          甲 <span className="font-semibold tabular-nums text-ink dark:text-paper">{row.a}</span>
                        </span>
                        <span className="flex items-center gap-1.5 text-[10px]">
                          乙 <span className="font-semibold tabular-nums text-ink dark:text-paper">{row.b}</span>
                          <span className="inline-block h-2 w-2 rounded-sm" style={{ backgroundColor: elColor[row.element], opacity: 0.5 }} />
                        </span>
                      </div>
                      <div className="relative h-5 overflow-hidden rounded-full bg-divider/25">
                        <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${aPct}%`, backgroundColor: elColor[row.element], animation: `yx-fill 0.8s ${index * 80}ms ease both` }} />
                        <div className="absolute inset-y-0 right-0 rounded-full" style={{ width: `${bPct}%`, backgroundColor: elColor[row.element], opacity: 0.5, animation: `yx-fill 0.8s ${index * 80 + 100}ms ease both` }} />
                      </div>
                      {row.note && <p className="mt-1 text-[9px] text-ink-fade text-right">{row.note}</p>}
                    </div>
                  </div>
                );
              });
            })()}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* 纳音配对 */}
            <div className="overflow-hidden rounded-sm border border-divider bg-card" style={{ animation: `yx-fade-up 0.5s ease both`, animationDelay: `350ms` }}>
              <div className="border-b border-divider bg-divider/10 px-5 py-3">
                <h3 className="text-[10px] font-semibold tracking-[0.14em] text-ink dark:text-paper">纳音配对</h3>
              </div>
              <div className="px-5 py-4">
                {(() => {
                  const nayinLines = (nayin?.lines.filter(Boolean) ?? []).map(cleanReportText);
                  const nayinFull = nayinLines.join(" · ");
                  const isTongQi = nayinFull.includes("同气共振");
                  const isXiangSheng = nayinFull.includes("相生滋养");
                  const nayinMatchLabel = isTongQi ? "同气共振" : isXiangSheng ? "相生滋养" : "各具其韵";
                  const nayinColor = isTongQi ? "#6B8C5C" : isXiangSheng ? "#5C7A9A" : "#B8A070";
                  return (
                    <>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="rounded-full px-2.5 py-0.5 text-[9px] tracking-[0.08em]" style={{ backgroundColor: nayinColor + "18", color: nayinColor }}>{nayinMatchLabel}</span>
                      </div>
                      {nayinLines.map((line, i) => (
                        <p key={i} className="text-[11px] leading-6 text-ink-light">{line.replace(/\s*\|\s*/g, " · ")}</p>
                      ))}
                    </>
                  );
                })()}
              </div>
            </div>

            {/* 用神互补 */}
            <div className="overflow-hidden rounded-sm border border-divider bg-card" style={{ animation: `yx-fade-up 0.5s ease both`, animationDelay: `450ms` }}>
              <div className="border-b border-divider bg-divider/10 px-5 py-3">
                <h3 className="text-[10px] font-semibold tracking-[0.14em] text-ink dark:text-paper">用神互补</h3>
              </div>
              <div className="px-5 py-4">
                {(() => {
                  const usefulLines = (useful?.lines.filter(Boolean) ?? []).map(cleanReportText);
                  const usefulFull = usefulLines.join(" ");
                  const hasShared = usefulFull.includes("共有用神");
                  const usefulColor = hasShared ? "#6B8C5C" : "#B8A070";
                  const usefulLabel = hasShared ? "用神共享" : "用神各异";
                  return (
                    <>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="rounded-full px-2.5 py-0.5 text-[9px] tracking-[0.08em]" style={{ backgroundColor: usefulColor + "18", color: usefulColor }}>{usefulLabel}</span>
                      </div>
                      {usefulLines.map((line, i) => (
                        <p key={i} className="text-[11px] leading-6 text-ink-light">{line.replace(/\s*\|\s*/g, " · ")}</p>
                      ))}
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </section>
    </Reveal>
  );
}

/** Pair Section 2: 日柱关系深度分析 */
function PairDayPillarDeepChapter({ sec, chapterNum }: { sec: MarriageDeepReport["sections"][number]; chapterNum: string }) {
  const blocks = parsePairBlocks(sec.body);
  const stemBlock = blocks.find(b => b.heading.includes("天干五合"));
  const branchBlock = blocks.find(b => b.heading.includes("地支关系"));
  const changShengBlock = blocks.find(b => b.heading.includes("十二长生"));

  const stemLines = (stemBlock?.lines ?? []).filter(Boolean).map(cleanReportText);
  const branchLines = (branchBlock?.lines ?? []).filter(Boolean).map(cleanReportText);
  const csAllLines = (changShengBlock?.lines ?? []).filter(Boolean).map(cleanReportText);
  const aCSLine = csAllLines.find(l => l.includes("甲方")) ?? "";
  const bCSLine = csAllLines.find(l => l.includes("乙方")) ?? "";
  const csSummary = csAllLines.find(l => !l.includes("甲方") && !l.includes("乙方")) ?? "";

  const stemFull = stemLines.join(" ");
  const isStemHe = stemFull.includes("为天干五合");
  const branchFull = branchLines.join(" ");
  const isBranchHe = branchFull.includes("地支六合");
  const isBranchChong = branchFull.includes("地支六冲");
  const isBranchHai = branchFull.includes("地支六害");
  const branchColor = isBranchHe ? "#6B8C5C" : isBranchChong ? "#9B6B5E" : isBranchHai ? "#B8A070" : "#8A8B7B";
  const branchBg = isBranchHe ? "rgba(107,140,92,0.05)" : isBranchChong ? "rgba(155,107,94,0.05)" : isBranchHai ? "rgba(184,160,112,0.05)" : "rgba(138,139,123,0.04)";
  const branchLabel = isBranchHe ? "六合 · 和谐共振" : isBranchChong ? "六冲 · 动态张力" : isBranchHai ? "六害 · 隐性调适" : "平和";

  const aStage = aCSLine.match(/：([^（]+)/)?.[1]?.trim() ?? "";
  const bStage = bCSLine.match(/：([^（]+)/)?.[1]?.trim() ?? "";
  const positiveStages = ["长生", "沐浴", "冠带", "临官", "帝旺"];
  const aPositive = positiveStages.includes(aStage);
  const bPositive = positiveStages.includes(bStage);

  // Parse stems from subtitle: "甲申 ↔ 乙卯" → stems = ["甲", "乙"]
  const stemFromSubtitle = (sec.subtitle ?? "").match(/([甲乙丙丁戊己庚辛壬癸])/g)?.slice(0, 2) ?? [];
  const stemA = stemFromSubtitle[0] ?? sec.highlights[0]?.[0] ?? "?";
  const stemB = stemFromSubtitle[1] ?? sec.highlights[1]?.[0] ?? "?";
  const stemAEl = STEM_ELEMENT_FOR_DISPLAY[stemA] ?? "土";
  const stemBEl = STEM_ELEMENT_FOR_DISPLAY[stemB] ?? "土";

  // Parse branch chars from branch text: "日支卯酉为地支六冲" → branches = ["卯", "酉"]
  const branchFromText = branchFull.match(/日支(\S)(\S)为/);
  const branchA = branchFromText?.[1] ?? "";
  const branchB = branchFromText?.[2] ?? "";

  return (
    <Reveal delay={65}>
      <section className="rounded-sm border border-divider bg-card">
        <ChapterHeader number={chapterNum} title={sec.title} subtitle={sec.subtitle} highlights={sec.highlights} />
        <div className="px-6 py-8 sm:px-10 space-y-6">

          {/* 天干五合 + 地支关系 — combined card */}
          <div className="overflow-hidden rounded-sm border border-divider">
            {/* 天干 row */}
            <div className="px-5 py-6 sm:px-7">
              <div className="flex items-center gap-4">
                {/* 甲 stem */}
                <div className="flex flex-col items-center gap-1.5 shrink-0">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full text-xl font-serif" style={{ backgroundColor: elBg[stemAEl], color: elColor[stemAEl] }}>{stemA}</span>
                  <span className="text-[9px] tracking-[0.1em] text-ink-fade">甲方日干</span>
                </div>

                {/* Connector line + badge */}
                <div className="flex-1 flex flex-col items-center gap-1 min-w-0">
                  <div className="flex items-center w-full gap-0">
                    <div className="flex-1 h-px" style={{ backgroundColor: isStemHe ? "#6B8C5C60" : "#B8A88A60" }} />
                    <span className={`shrink-0 rounded-full border px-3 py-0.5 text-[10px] tracking-[0.08em] mx-2 ${isStemHe ? "border-[#6B8C5C]/30 bg-[#6B8C5C]/10 text-[#6B8C5C]" : "border-divider bg-divider/20 text-ink-fade"}`}>
                      {isStemHe ? "天干五合" : "无合"}
                    </span>
                    <div className="flex-1 h-px" style={{ backgroundColor: isStemHe ? "#6B8C5C60" : "#B8A88A60" }} />
                  </div>
                </div>

                {/* 乙 stem */}
                <div className="flex flex-col items-center gap-1.5 shrink-0">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full text-xl font-serif" style={{ backgroundColor: elBg[stemBEl], color: elColor[stemBEl] }}>{stemB}</span>
                  <span className="text-[9px] tracking-[0.1em] text-ink-fade">乙方日干</span>
                </div>
              </div>
              <p className="mt-4 text-[12px] leading-7 text-ink-light">{stemFull}</p>
            </div>

            {/* Divider */}
            <div className="border-t border-divider" />

            {/* 地支 row */}
            <div className="px-5 py-5 sm:px-7" style={{ backgroundColor: branchBg }}>
              <div className="flex items-center gap-4">
                {/* 卯 branch */}
                <div className="flex flex-col items-center gap-1.5 shrink-0">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full text-xl font-serif border" style={{ borderColor: branchColor + "50", color: branchColor }}>{branchA || "?"}</span>
                  <span className="text-[9px] tracking-[0.1em] text-ink-fade">甲方日支</span>
                </div>

                {/* Connector + badge */}
                <div className="flex-1 flex flex-col items-center gap-1 min-w-0">
                  <div className="flex items-center w-full gap-0">
                    <div className="flex-1 h-px" style={{ backgroundColor: branchColor + "50" }} />
                    <span className="shrink-0 rounded-full border px-3 py-0.5 text-[10px] tracking-[0.08em] mx-2" style={{ borderColor: branchColor + "40", backgroundColor: branchColor + "18", color: branchColor }}>
                      {branchLabel}
                    </span>
                    <div className="flex-1 h-px" style={{ backgroundColor: branchColor + "50" }} />
                  </div>
                </div>

                {/* 酉 branch */}
                <div className="flex flex-col items-center gap-1.5 shrink-0">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full text-xl font-serif border" style={{ borderColor: branchColor + "50", color: branchColor }}>{branchB || "?"}</span>
                  <span className="text-[9px] tracking-[0.1em] text-ink-fade">乙方日支</span>
                </div>
              </div>
              <p className="mt-4 text-[12px] leading-7 text-ink-light">{branchFull}</p>
            </div>
          </div>

          {/* 十二长生交互 */}
          <div className="overflow-hidden rounded-sm border border-divider">
            <div className="border-b border-divider bg-divider/10 px-5 py-3 flex items-center justify-between">
              <div>
                <h3 className="text-[11px] font-semibold tracking-[0.14em] text-ink dark:text-paper">十二长生交互</h3>
                <p className="mt-0.5 text-[10px] text-ink-fade">日主在对方婚姻宫中的能量状态</p>
              </div>
            </div>
            <div className="grid divide-y divide-divider sm:grid-cols-2 sm:divide-x sm:divide-y-0">
              <div className="px-5 py-5">
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-ink-fade">甲方日主在乙方婚姻宫</p>
                <div className="mt-3 flex items-center gap-2.5">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full text-base font-serif shrink-0" style={{ backgroundColor: aPositive ? "rgba(107,140,92,0.1)" : "rgba(155,107,94,0.08)", color: aPositive ? "#6B8C5C" : "#9B6B5E" }}>{aStage || "?"}</span>
                  <div>
                    <span className={`text-[10px] tracking-[0.06em] ${aPositive ? "text-[#6B8C5C]" : "text-[#9B6B5E]"}`}>{aPositive ? "能量充沛" : "能量收敛"}</span>
                    <p className="mt-0.5 text-[11px] leading-6 text-ink-light">{aCSLine.replace(/\*\*/g, "").replace(/^甲方日主\S+\s*在乙方日支\S+[：:]?\s*/, "").trim()}</p>
                  </div>
                </div>
              </div>
              <div className="px-5 py-5">
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-ink-fade">乙方日主在甲方婚姻宫</p>
                <div className="mt-3 flex items-center gap-2.5">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full text-base font-serif shrink-0" style={{ backgroundColor: bPositive ? "rgba(107,140,92,0.1)" : "rgba(155,107,94,0.08)", color: bPositive ? "#6B8C5C" : "#9B6B5E" }}>{bStage || "?"}</span>
                  <div>
                    <span className={`text-[10px] tracking-[0.06em] ${bPositive ? "text-[#6B8C5C]" : "text-[#9B6B5E]"}`}>{bPositive ? "能量充沛" : "能量收敛"}</span>
                    <p className="mt-0.5 text-[11px] leading-6 text-ink-light">{bCSLine.replace(/\*\*/g, "").replace(/^乙方日主\S+\s*在甲方日支\S+[：:]?\s*/, "").trim()}</p>
                  </div>
                </div>
              </div>
            </div>
            {csSummary && (
              <div className="border-t border-divider bg-divider/10 px-5 py-4">
                <p className="text-[11px] leading-6 text-ink-light">{csSummary}</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </Reveal>
  );
}

/** Pair Section 4: 十神交叉配对 */
function PairTenGodCrossChapter({ sec, chapterNum }: { sec: MarriageDeepReport["sections"][number]; chapterNum: string }) {
  const blocks = parsePairBlocks(sec.body);
  // First block is the overview — remaining lines after the heading line are the cross-hit entries
  const allLines = sec.body.split("\n").filter(Boolean);
  const overviewLine = cleanReportText(allLines.find(l => !l.startsWith("#") && !l.startsWith(">") && l.length > 20 && /配偶星.*对方盘/.test(l)) ?? "");
  const footerLine = cleanReportText(allLines.find(l => l.includes("十神交叉配对是传统合婚")) ?? "");

  // Cross hits: lines matching "甲方/乙方 ... 为甲方/乙方配偶星"
  const crossHits = allLines
    .filter(l => /^(甲方|乙方)/.test(l.trim()) && l.includes("配偶星"))
    .map(cleanReportText);

  const aInBHits = crossHits.filter(l => l.includes("为甲方配偶星"));
  const bInAHits = crossHits.filter(l => l.includes("为乙方配偶星"));

  const countMatch = overviewLine.match(/(\d+)次/);
  const totalCount = countMatch?.[1] ?? "—";
  const isStrong = Number(totalCount) >= 4;
  const isMedium = Number(totalCount) >= 2 && Number(totalCount) < 4;

  const strengthColor = isStrong ? "#6B8C5C" : isMedium ? "#C4A24A" : "#B8A070";
  const strengthBg = isStrong ? "rgba(107,140,92,0.06)" : isMedium ? "rgba(196,162,74,0.06)" : "rgba(184,160,112,0.05)";
  const strengthLabel = isStrong ? "信号强烈" : isMedium ? "信号可辨" : Number(totalCount) >= 1 ? "信号偏弱" : "未见显应";

  return (
    <Reveal delay={75}>
      <section className="rounded-sm border border-divider bg-card">
        <ChapterHeader number={chapterNum} title={sec.title} subtitle={sec.subtitle} highlights={sec.highlights} />
        <div className="px-6 py-8 sm:px-10 space-y-7">
          {/* Hero stat */}
          <div className="rounded-sm border px-6 py-6 sm:px-8" style={{ borderColor: strengthColor + "30", backgroundColor: strengthBg }}>
            <div className="flex flex-wrap items-baseline gap-x-6 gap-y-3">
              <div className="flex items-end gap-4">
                <span className="inline-flex h-[56px] w-[56px] items-center justify-center rounded-md text-[34px] font-light leading-none tracking-[0.02em]" style={{ backgroundColor: strengthColor + "18", color: strengthColor }}>{totalCount}</span>
                <span className="text-[15px] tracking-[0.08em] text-ink-light pb-1.5">次交叉呼应</span>
              </div>
              <span className="rounded-full border px-3 py-1 text-[10px] tracking-[0.1em]" style={{ borderColor: strengthColor + "50", color: strengthColor }}>{strengthLabel}</span>
            </div>
            <div className="mt-3 flex items-center gap-3 text-[11px] tracking-[0.08em]">
              <span className="text-ink-fade">甲 ← 乙 <span className="ml-0.5 font-medium text-ink dark:text-paper tabular-nums">{aInBHits.length}</span> 次</span>
              <span className="text-divider">·</span>
              <span className="text-ink-fade">乙 ← 甲 <span className="ml-0.5 font-medium text-ink dark:text-paper tabular-nums">{bInAHits.length}</span> 次</span>
            </div>
            {overviewLine && <p className="mt-4 max-w-[62ch] text-[12px] leading-7 text-ink-light">{overviewLine}</p>}
          </div>

          {/* Two-column cross hits */}
          {(aInBHits.length > 0 || bInAHits.length > 0) && (
            <div className="grid gap-5 sm:grid-cols-2">
              {/* A's spouse star in B's chart */}
              <div className="rounded-sm border border-divider bg-card overflow-hidden">
                <div className="border-b border-divider bg-divider/10 px-4 py-3">
                  <h3 className="text-[10px] font-semibold tracking-[0.12em] text-ink dark:text-paper">甲方配偶星 · 见于乙方盘</h3>
                  <p className="mt-0.5 text-[9px] text-ink-fade">乙方哪些柱位触发了甲方的配偶信号</p>
                </div>
                <div className="px-3 py-3 space-y-1.5">
                  {aInBHits.length > 0 ? aInBHits.map((hit, i) => (
                    <div key={i} className="flex items-start gap-2.5 rounded-sm bg-divider/10 px-3 py-2.5" style={{ animation: `yx-fade-up 0.35s ease both`, animationDelay: `${i * 40}ms` }}>
                      <span className="mt-0.5 shrink-0 h-1.5 w-1.5 rounded-full bg-[#8B6C4E]" />
                      <span className="text-[11px] leading-6 text-ink-light">{hit}</span>
                    </div>
                  )) : (
                    <p className="px-3 py-4 text-[11px] text-ink-fade">甲方配偶星在乙方盘中未见显应</p>
                  )}
                </div>
              </div>

              {/* B's spouse star in A's chart */}
              <div className="rounded-sm border border-divider bg-card overflow-hidden">
                <div className="border-b border-divider bg-divider/10 px-4 py-3">
                  <h3 className="text-[10px] font-semibold tracking-[0.12em] text-ink dark:text-paper">乙方配偶星 · 见于甲方盘</h3>
                  <p className="mt-0.5 text-[9px] text-ink-fade">甲方哪些柱位触发了乙方的配偶信号</p>
                </div>
                <div className="px-3 py-3 space-y-1.5">
                  {bInAHits.length > 0 ? bInAHits.map((hit, i) => (
                    <div key={i} className="flex items-start gap-2.5 rounded-sm bg-divider/10 px-3 py-2.5" style={{ animation: `yx-fade-up 0.35s ease both`, animationDelay: `${i * 40 + 80}ms` }}>
                      <span className="mt-0.5 shrink-0 h-1.5 w-1.5 rounded-full bg-[#5C7A9A]" />
                      <span className="text-[11px] leading-6 text-ink-light">{hit}</span>
                    </div>
                  )) : (
                    <p className="px-3 py-4 text-[11px] text-ink-fade">乙方配偶星在甲方盘中未见显应</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {footerLine && (
            <div className="border-t border-divider pt-5">
              <p className="text-[11px] leading-6 text-ink-fade max-w-[64ch]">{footerLine}</p>
            </div>
          )}
        </div>
      </section>
    </Reveal>
  );
}

/** Pair Section 5: 神煞与特殊配置共振 */
function PairShenShaResonanceChapter({ sec, chapterNum }: { sec: MarriageDeepReport["sections"][number]; chapterNum: string }) {
  const blocks = parsePairBlocks(sec.body);
  const specialBlock = blocks.find(b => b.heading.includes("特殊日柱配对"));
  const mainLines = blocks.filter(b => !b.heading.includes("特殊日柱配对")).flatMap(b => b.lines).filter(Boolean).map(cleanReportText);
  const specialLines = (specialBlock?.lines ?? []).filter(Boolean).map(cleanReportText);

  // Parse: "甲方吉星：..." / "甲方留意：..." etc
  const aJiLine = mainLines.find(l => l.startsWith("甲方吉星")) ?? "";
  const aXiongLine = mainLines.find(l => l.startsWith("甲方留意")) ?? "";
  const bJiLine = mainLines.find(l => l.startsWith("乙方吉星")) ?? "";
  const bXiongLine = mainLines.find(l => l.startsWith("乙方留意")) ?? "";
  const sharedJiLine = mainLines.find(l => l.startsWith("双方共有吉星")) ?? "";
  const sharedXiongLine = mainLines.find(l => l.startsWith("双方共有需留意")) ?? "";
  const footerLine = mainLines.find(l => l.startsWith("神煞对照看的是")) ?? "";

  // Parse shensha names with positions: "天乙贵人（日柱）" → {name: "天乙贵人", position: "日柱"}
  const parseEntries = (line: string) => {
    const afterColon = line.replace(/^[^：:]+[：:]\s*/, "");
    if (!afterColon || afterColon.includes("无显著")) return [] as { name: string; position: string }[];
    return afterColon.split("、").map(s => {
      const m = s.match(/^(.+?)（(.+?)）$/);
      return m ? { name: m[1].trim(), position: m[2].trim() } : { name: s.replace(/[（）()]/g, "").trim(), position: "" };
    }).filter(e => e.name);
  };
  const aJi = parseEntries(aJiLine);
  const aXiong = parseEntries(aXiongLine);
  const bJi = parseEntries(bJiLine);
  const bXiong = parseEntries(bXiongLine);

  const hasGuLuan = specialLines.some(l => l.includes("孤鸾日"));
  const hasYinCha = specialLines.some(l => l.includes("阴差阳错"));
  const allNormal = specialLines.some(l => l.includes("均为正常配置"));

  return (
    <Reveal delay={85}>
      <section className="rounded-sm border border-divider bg-card">
        <ChapterHeader number={chapterNum} title={sec.title} subtitle={sec.subtitle} highlights={sec.highlights} />
        <div className="px-6 py-8 sm:px-10 space-y-6">

          {/* Two-person shensha overview */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Person A */}
            <div className="rounded-sm border border-divider bg-card overflow-hidden">
              <div className="border-b border-divider px-4 py-3 flex items-center justify-between" style={{ backgroundColor: "rgba(44,36,22,0.02)" }}>
                <h3 className="text-[10px] font-semibold tracking-[0.12em] text-ink dark:text-paper">甲方神煞</h3>
                <span className="text-[9px] tracking-[0.08em] text-ink-fade">{aJi.length + aXiong.length} 颗关键</span>
              </div>
              <div className="px-4 py-3 space-y-2">
                {aJi.map(e => (
                  <div key={`a-ji-${e.name}-${e.position}`} className="flex items-center gap-2.5 text-[11px]">
                    <span className="shrink-0 h-1.5 w-1.5 rounded-full bg-[#6B8C5C]" />
                    <span className="text-ink-light">{e.name}</span>
                    {e.position && <span className="text-[9px] text-ink-fade ml-auto">{e.position}</span>}
                  </div>
                ))}
                {aXiong.map(e => (
                  <div key={`a-xiong-${e.name}-${e.position}`} className="flex items-center gap-2.5 text-[11px]">
                    <span className="shrink-0 h-1.5 w-1.5 rounded-full bg-[#9B6B5E]" />
                    <span className="text-ink-light">{e.name}</span>
                    {e.position && <span className="text-[9px] text-ink-fade ml-auto">{e.position}</span>}
                  </div>
                ))}
                {aJi.length === 0 && aXiong.length === 0 && (
                  <p className="text-[11px] text-ink-fade py-1">无显著姻缘神煞</p>
                )}
              </div>
            </div>

            {/* Person B */}
            <div className="rounded-sm border border-divider bg-card overflow-hidden">
              <div className="border-b border-divider px-4 py-3 flex items-center justify-between" style={{ backgroundColor: "rgba(44,36,22,0.02)" }}>
                <h3 className="text-[10px] font-semibold tracking-[0.12em] text-ink dark:text-paper">乙方神煞</h3>
                <span className="text-[9px] tracking-[0.08em] text-ink-fade">{bJi.length + bXiong.length} 颗关键</span>
              </div>
              <div className="px-4 py-3 space-y-2">
                {bJi.map(e => (
                  <div key={`b-ji-${e.name}-${e.position}`} className="flex items-center gap-2.5 text-[11px]">
                    <span className="shrink-0 h-1.5 w-1.5 rounded-full bg-[#6B8C5C]" />
                    <span className="text-ink-light">{e.name}</span>
                    {e.position && <span className="text-[9px] text-ink-fade ml-auto">{e.position}</span>}
                  </div>
                ))}
                {bXiong.map(e => (
                  <div key={`b-xiong-${e.name}-${e.position}`} className="flex items-center gap-2.5 text-[11px]">
                    <span className="shrink-0 h-1.5 w-1.5 rounded-full bg-[#9B6B5E]" />
                    <span className="text-ink-light">{e.name}</span>
                    {e.position && <span className="text-[9px] text-ink-fade ml-auto">{e.position}</span>}
                  </div>
                ))}
                {bJi.length === 0 && bXiong.length === 0 && (
                  <p className="text-[11px] text-ink-fade py-1">无显著姻缘神煞</p>
                )}
              </div>
            </div>
          </div>

          {/* Shared resonance */}
          {(sharedJiLine || sharedXiongLine) && (
            <div className="rounded-sm border border-divider px-5 py-4">
              <h3 className="text-[10px] font-semibold tracking-[0.14em] text-ink dark:text-paper mb-3">双方共振</h3>
              {sharedJiLine && (
                <div className="flex items-start gap-2.5 text-[11px] leading-6 text-ink-light">
                  <span className="mt-1 shrink-0 h-1.5 w-1.5 rounded-full bg-[#6B8C5C]" />
                  <span>{sharedJiLine}</span>
                </div>
              )}
              {sharedXiongLine && (
                <div className="flex items-start gap-2.5 text-[11px] leading-6 text-ink-light mt-2">
                  <span className="mt-1 shrink-0 h-1.5 w-1.5 rounded-full bg-[#9B6B5E]" />
                  <span>{sharedXiongLine}</span>
                </div>
              )}
            </div>
          )}

          {/* Special day pillar */}
          {!allNormal && (hasGuLuan || hasYinCha) && (
            <div className="rounded-sm border border-[#B8A070]/25 px-5 py-4" style={{ backgroundColor: "rgba(184,160,112,0.04)" }}>
              <h3 className="text-[10px] font-semibold tracking-[0.14em] text-[#8B7A5E] mb-2">特殊日柱提醒</h3>
              {specialLines.filter(l => l.includes("孤鸾日") || l.includes("阴差阳错")).map((line, i) => (
                <p key={i} className="text-[11px] leading-6 text-ink-light">{line}</p>
              ))}
            </div>
          )}
          {allNormal && (
            <div className="rounded-sm border border-divider px-5 py-3 text-center" style={{ backgroundColor: "rgba(107,140,92,0.03)" }}>
              <p className="text-[11px] leading-6 text-[#6B8C5C]">双方日柱均为正常配置，无孤鸾或阴差阳错等特殊标记</p>
            </div>
          )}

          {/* Footer */}
          {footerLine && (
            <p className="text-[11px] leading-6 text-ink-fade">{footerLine}</p>
          )}
        </div>
      </section>
    </Reveal>
  );
}

/** Pair Section 6: 大运同步分析 */
function PairLuckSyncChapter({ sec, chapterNum }: { sec: MarriageDeepReport["sections"][number]; chapterNum: string }) {
  const blocks = parsePairBlocks(sec.body);
  const currentBlock = blocks.find(b => b.heading.includes("当前大运"));
  const overlapBlock = blocks.find(b => b.heading.includes("大运重合"));
  const introLines = blocks.filter(b => !b.heading).flatMap(b => b.lines).filter(Boolean).map(cleanReportText);

  const currentLines = (currentBlock?.lines ?? []).filter(Boolean).map(cleanReportText);
  const overlapLines = (overlapBlock?.lines ?? []).filter(Boolean).map(cleanReportText);

  // Parse current cycle info
  const aCycleLine = currentLines.find(l => l.startsWith("甲方")) ?? "";
  const bCycleLine = currentLines.find(l => l.startsWith("乙方")) ?? "";
  const cycleSummary = currentLines.find(l => !l.startsWith("甲方") && !l.startsWith("乙方")) ?? "";

  const aCycleMatch = aCycleLine.match(/(\S+)（(\d+-\d+)岁）/);
  const bCycleMatch = bCycleLine.match(/(\S+)（(\d+-\d+)岁）/);

  // Parse overlap entries with signals
  const overlapEntries = overlapLines.map(line => {
    const parts = line.split(/[：:]/);
    const yearRange = parts[0]?.trim() ?? "";
    const signals = parts.slice(1).join("：").trim();
    const signalTags = signals ? signals.split("、").map(s => s.trim()).filter(Boolean) : [];
    return { yearRange, signalTags };
  });

  return (
    <Reveal delay={95}>
      <section className="rounded-sm border border-divider bg-card">
        <ChapterHeader number={chapterNum} title={sec.title} subtitle={sec.subtitle} highlights={sec.highlights} />
        <div className="px-6 py-8 sm:px-10 space-y-8">
          {/* Intro */}
          {introLines.length > 0 && (
            <p className="text-[12px] leading-7 text-ink-light">{introLines[0]}</p>
          )}

          {/* Current cycles — two cards with accent */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* 甲方 */}
            <div className="rounded-sm border border-divider bg-card overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-divider/15 text-[10px] font-semibold tracking-[0.08em] text-ink-fade">甲</div>
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-ink-fade">当前大运</p>
                  {aCycleMatch ? (
                    <div className="mt-0.5 flex items-baseline gap-2">
                      <span className="text-xl font-light tracking-[0.08em] text-ink dark:text-paper">{aCycleMatch[1]}</span>
                      <span className="text-[11px] tracking-[0.06em] text-ink-fade">{aCycleMatch[2]}</span>
                    </div>
                  ) : (
                    <p className="text-[13px] text-ink-light">{aCycleLine || "—"}</p>
                  )}
                </div>
              </div>
            </div>

            {/* 乙方 */}
            <div className="rounded-sm border border-divider bg-card overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-divider/15 text-[10px] font-semibold tracking-[0.08em] text-ink-fade">乙</div>
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-ink-fade">当前大运</p>
                  {bCycleMatch ? (
                    <div className="mt-0.5 flex items-baseline gap-2">
                      <span className="text-xl font-light tracking-[0.08em] text-ink dark:text-paper">{bCycleMatch[1]}</span>
                      <span className="text-[11px] tracking-[0.06em] text-ink-fade">{bCycleMatch[2]}</span>
                    </div>
                  ) : (
                    <p className="text-[13px] text-ink-light">{bCycleLine || "—"}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {cycleSummary && (
            <p className="text-[12px] leading-7 text-ink-light">{cycleSummary}</p>
          )}

          {/* Overlap timeline — vertical timeline with dots */}
          {overlapEntries.length > 0 && (
            <div>
              <h3 className="mb-4 text-[11px] font-semibold tracking-[0.14em] text-ink dark:text-paper">大运重合时段</h3>
              <div className="relative pl-6 space-y-0">
                {/* Vertical line */}
                <div className="absolute left-[7px] top-2 bottom-2 w-px bg-divider" />
                {overlapEntries.map((entry, i) => {
                  const hasSignal = entry.signalTags.length > 0;
                  return (
                    <div key={i} className="relative pb-5 last:pb-0" style={{ animation: `yx-fade-up 0.4s ease both`, animationDelay: `${i * 60}ms` }}>
                      {/* Dot */}
                      <div className={`absolute left-[-17px] top-1.5 h-[9px] w-[9px] rounded-full border-2 border-card ${hasSignal ? "bg-[#8B6C4E]" : "bg-divider"}`} />
                      {/* Content */}
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <span className={`text-[11px] font-medium tabular-nums tracking-[0.04em] ${hasSignal ? "text-ink dark:text-paper" : "text-ink-fade"}`}>{entry.yearRange}</span>
                        {hasSignal ? (
                          <div className="flex flex-wrap gap-1.5">
                            {entry.signalTags.map((tag, ti) => (
                              <span key={ti} className="rounded-full bg-divider/15 px-2.5 py-0.5 text-[10px] tracking-[0.06em] text-ink-light">{tag}</span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[10px] text-ink-fade/50">—</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>
    </Reveal>
  );
}

/** Pair Section 7: 综合研判与相处建议 */
function PairSynthesisChapter({ sec, chapterNum }: { sec: MarriageDeepReport["sections"][number]; chapterNum: string }) {
  const bodyText = sec.body;
  const strengthsMatch = bodyText.match(/### 核心匹配优势\n([\s\S]*?)(?=\n### |$)/);
  const challengesMatch = bodyText.match(/### 需要磨合的领域\n([\s\S]*?)(?=\n### |$)/);
  const adviceMatch = bodyText.match(/### 相处建议\n([\s\S]*?)(?=$)/);

  const strengthsItems = strengthsMatch?.[1]?.split("\n").filter(l => l.startsWith("- ")).map(cleanReportText) ?? [];
  const challengesItems = challengesMatch?.[1]?.split("\n").filter(l => l.startsWith("- ")).map(cleanReportText) ?? [];
  const adviceRaw = adviceMatch?.[1] ?? "";
  // Split at "> " line to separate advice from disclaimer
  const adviceText = cleanReportText(adviceRaw.split(/\n>\s*/)[0].trim());

  // Extract disclaimer
  const disclaimerMatch = bodyText.match(/^>\s*(.+)$/m);
  const disclaimer = disclaimerMatch?.[1] ?? "";

  return (
    <Reveal delay={110}>
      <section className="rounded-sm border border-divider bg-card">
        <ChapterHeader number={chapterNum} title={sec.title} subtitle={sec.subtitle} />

        <div className="px-6 py-8 sm:px-10">
          {/* Strengths & Challenges — two panel */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Strengths */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6B8C5C]">匹配优势</span>
                <span className="rounded-full bg-[#6B8C5C]/10 px-2 py-0.5 text-[10px] tabular-nums text-[#6B8C5C]">{strengthsItems.length}</span>
              </div>
              <div className="space-y-3">
                {strengthsItems.length > 0 ? strengthsItems.map((item, i) => (
                  <div key={i} className="rounded-sm border border-divider bg-card px-4 py-4 transition-all duration-300 hover:-translate-y-0.5" style={{ animation: `yx-fade-up 0.4s ease both`, animationDelay: `${i * 60 + 50}ms` }}>
                    <div className="flex items-start gap-2.5">
                      <span className="mt-1 shrink-0 h-1.5 w-1.5 rounded-full bg-[#6B8C5C]" />
                      <p className="text-[12px] leading-7 text-ink-light">{item}</p>
                    </div>
                  </div>
                )) : (
                  <div className="rounded-sm border border-divider bg-card px-4 py-4">
                    <p className="text-[12px] leading-7 text-ink-fade">匹配度中等偏上。关系的走向更多取决于双方的经营而非命理结构。</p>
                  </div>
                )}
              </div>
            </div>

            {/* Challenges */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9B6B5E]">需磨合领域</span>
                <span className="rounded-full bg-[#9B6B5E]/10 px-2 py-0.5 text-[10px] tabular-nums text-[#9B6B5E]">{challengesItems.length}</span>
              </div>
              <div className="space-y-3">
                {challengesItems.length > 0 ? challengesItems.map((item, i) => (
                  <div key={i} className="rounded-sm border border-divider bg-card px-4 py-4 transition-all duration-300 hover:-translate-y-0.5" style={{ animation: `yx-fade-up 0.4s ease both`, animationDelay: `${i * 60 + 100}ms` }}>
                    <div className="flex items-start gap-2.5">
                      <span className="mt-1 shrink-0 h-1.5 w-1.5 rounded-full bg-[#9B6B5E]" />
                      <p className="text-[12px] leading-7 text-ink-light">{item}</p>
                    </div>
                  </div>
                )) : (
                  <div className="rounded-sm border border-divider bg-card px-4 py-4">
                    <p className="text-[12px] leading-7 text-ink-fade">未见需要特别留意的结构性问题。专业合婚的目的不是打分而是提供经营地图。</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Advice */}
          {adviceText && (
            <div className="mt-8 rounded-sm border border-divider overflow-hidden">
              <div className="border-b border-divider bg-divider/10 px-5 py-3">
                <h3 className="text-[11px] font-semibold tracking-[0.14em] text-ink dark:text-paper">相处建议</h3>
              </div>
              <div className="px-5 py-5 sm:px-7">
                <p className="whitespace-pre-line text-[13px] leading-8 text-ink-light">{adviceText}</p>
              </div>
            </div>
          )}

          {/* Disclaimer */}
          {disclaimer && (
            <div className="mt-6 border-t border-divider pt-5 text-center">
              <p className="text-[11px] leading-6 text-ink-fade">{cleanReportText(disclaimer)}</p>
            </div>
          )}
        </div>
      </section>
    </Reveal>
  );
}

/** Pair chapter dispatcher — routes to specialized renderers, falls back to generic layout */
function PairChapter({ sec, chapterNum }: { sec: MarriageDeepReport["sections"][number]; chapterNum: string }) {
  if (sec.title === "双方命盘对照") return <PairChartComparison sec={sec} chapterNum={chapterNum} />;
  if (sec.title === "五行交互与互补") return <PairElementInteraction sec={sec} chapterNum={chapterNum} />;
  if (sec.title === "日柱关系深度分析") return <PairDayPillarDeepChapter sec={sec} chapterNum={chapterNum} />;
  if (sec.title === "十神交叉配对") return <PairTenGodCrossChapter sec={sec} chapterNum={chapterNum} />;
  if (sec.title === "神煞与特殊配置共振") return <PairShenShaResonanceChapter sec={sec} chapterNum={chapterNum} />;
  if (sec.title === "大运同步分析") return <PairLuckSyncChapter sec={sec} chapterNum={chapterNum} />;
  if (sec.title === "综合研判与相处建议") return <PairSynthesisChapter sec={sec} chapterNum={chapterNum} />;
  if (sec.title.includes("附录")) return <AppendixChapter sec={sec} chapterNum={chapterNum} />;

  // Generic fallback for any unrecognized pair sections
  const blocks = parsePairBlocks(sec.body);
  return (
    <Reveal delay={60}>
      <section className="rounded-sm border border-divider bg-card">
        <ChapterHeader number={chapterNum} title={sec.title} subtitle={sec.subtitle} />
        <div className="space-y-5 px-6 py-8 sm:px-10">
          {blocks.map((block, blockIndex) => {
            const contentLines = block.lines.filter(Boolean);
            const hasHeading = Boolean(block.heading);
            return (
              <div
                key={`${block.heading}-${blockIndex}`}
                className={hasHeading ? "rounded-sm border border-divider px-5 py-5 sm:px-6" : "border-l-2 border-divider pl-5"}
              >
                {hasHeading && (
                  <div className="mb-4 flex items-center gap-3 border-b border-divider pb-4">
                    <span className="h-2 w-2 rounded-full bg-ink-fade/50" />
                    <h3 className="text-[11px] font-semibold tracking-[0.14em] text-ink dark:text-paper">{block.heading}</h3>
                  </div>
                )}
                <div className="grid gap-3 sm:grid-cols-2">
                  {contentLines.map((line, lineIndex) => {
                    const isList = /^[-*+]\s+/.test(line);
                    const isQuote = /^>\s*/.test(line);
                    return (
                      <div
                        key={lineIndex}
                        className={
                          isQuote
                            ? "sm:col-span-2 border-l-2 border-divider pl-4"
                            : isList
                              ? "rounded-sm bg-divider/10 px-4 py-4"
                              : "sm:col-span-2 max-w-[68ch]"
                        }
                      >
                        <p className={`text-[12px] leading-7 ${isQuote ? "text-ink-fade" : "text-ink-light"}`}>{cleanReportText(line)}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </Reveal>
  );
}

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
        <h1 className="mb-3 text-2xl font-light tracking-[0.12em] text-ink dark:text-paper">解读未载入</h1>
        <p className="mb-8 text-[13px] leading-7 text-ink-light">请从姻缘页重新测算后解锁深度解读。</p>
        <Link href="/marriage" className="inline-flex min-h-11 items-center justify-center rounded-lg bg-ink px-7 py-3 text-sm font-medium tracking-[0.1em] text-paper transition-opacity hover:opacity-90 dark:bg-paper dark:text-ink">返回姻缘页</Link>
      </div>
    );
  }

  const isSolo = report.mode === "solo";
  const sections = report.sections;

  // Classify sections by content type for specialized rendering
  function sectionType(sec: (typeof sections)[number]): string {
    const t = sec.title;
    if (t.includes("命盘总览")) return "bazi-overview";
    if (t.includes("婚姻宫精析")) return "marriage-palace";
    if (t.includes("配偶星全维")) return "spouse-star";
    if (t.includes("神煞关键") || t.includes("神煞全盘")) return "shensha";
    if (t.includes("大运")) return "luck-cycles";
    if (t.includes("流年")) return "yearly-activation";
    if (t.includes("综合研判")) return "synthesis";
    if (t.includes("附录")) return "appendix";
    return "generic";
  }

  const baziSec = sections.find(s => sectionType(s) === "bazi-overview");
  const otherSections = sections.filter(s => sectionType(s) !== "bazi-overview");

  return (
    <article className="mx-auto max-w-3xl space-y-12 pb-24 pt-6">
      {/* Back link */}
      <button
        onClick={() => router.push("/marriage?from=report")}
        className="group inline-flex items-center gap-2 text-[11px] tracking-[0.12em] text-ink-fade transition-colors hover:text-ink dark:hover:text-paper"
      >
        <span className="inline-block transition-transform duration-300 group-hover:-translate-x-1">←</span>
        返回基础测算
      </button>

      {/* Hero */}
      <Reveal>
        <header className="relative overflow-hidden rounded-sm border border-divider bg-card px-8 py-14 sm:px-12 sm:py-20">
          <span className="pointer-events-none absolute -right-4 -top-4 select-none font-serif text-[180px] leading-none text-ink-fade/5 sm:text-[220px]" aria-hidden>缘</span>
          <div className="relative">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-ink-fade">
              {isSolo ? "姻缘深度解读" : "合盘深度解读"}
            </p>
            <h1 className="mt-6 max-w-xl text-[36px] font-light leading-[1.25] tracking-[0.06em] text-ink dark:text-paper sm:text-[44px]">
              {report.headline}
            </h1>
            <div className="mt-8 h-px w-16 bg-divider origin-left animate-[marriage-line-draw_1s_0.3s_cubic-bezier(0.2,0.75,0.25,1)_both]" />
            <p className="mt-8 max-w-xl text-[13px] leading-8 text-ink-light">{report.summary}</p>
          </div>
        </header>
      </Reveal>

      {/* Bazi Overview (section 1) */}
      {baziSec && report.baziOverview && (
        <BaziOverview ov={report.baziOverview} />
      )}

      {/* Remaining sections */}
      {otherSections.map((sec, i) => {
        const type = sectionType(sec);
        const chapNum = String(i + (baziSec ? 2 : 1)).padStart(2, "0");

        if (!isSolo) {
          return <PairChapter key={sec.title} sec={sec} chapterNum={chapNum} />;
        }

        switch (type) {
          case "marriage-palace":
            return <MarriagePalaceChapter key={sec.title} sec={sec} chapterNum={chapNum} />;
          case "spouse-star":
            return <SpouseStarChapter key={sec.title} sec={sec} chapterNum={chapNum} />;
          case "shensha":
            return <ShenShaChapter key={sec.title} sec={sec} chapterNum={chapNum} />;
          case "luck-cycles":
            return <LuckCyclesChapter key={sec.title} sec={sec} chapterNum={chapNum} />;
          case "yearly-activation":
            return <YearlyActivationChapter key={sec.title} sec={sec} chapterNum={chapNum} />;
          case "synthesis":
            return <SynthesisChapter key={sec.title} sec={sec} chapterNum={chapNum} />;
          case "appendix":
            return <AppendixChapter key={sec.title} sec={sec} chapterNum={chapNum} />;
          default:
            return <GenericChapter key={sec.title} sec={sec} chapterNum={chapNum} />;
        }
      })}

      {/* Coda */}
      <Reveal delay={150}>
        <div className="text-center border-t border-divider pt-12">
          <p className="font-serif text-6xl text-ink-fade/10 select-none">缘</p>
          <p className="mt-4 text-[12px] leading-relaxed text-ink-fade">以上内容基于八字命理传统算法推导，仅供参考</p>
          <p className="mt-1 text-[12px] leading-relaxed text-ink-fade">命理提供概率和趋势，你的选择和经营才是决定性变量</p>
          <Link
            href="/marriage?from=report"
            className="mt-8 inline-flex min-h-10 items-center justify-center rounded-full border border-divider px-6 py-2.5 text-[11px] tracking-[0.12em] text-ink-fade transition-all hover:border-ink/30 hover:text-ink dark:hover:text-paper"
          >
            返回基础测算
          </Link>
        </div>
      </Reveal>
    </article>
  );
}
