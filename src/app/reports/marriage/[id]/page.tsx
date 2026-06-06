"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { MarriageDeepReport } from "@/lib/marriage-deep-report";

// ========== Color tokens (match existing design system) ==========
const elColor: Record<string, string> = {
  "木": "#6B8C5C", "火": "#C4664A", "土": "#C4A24A", "金": "#B8A070", "水": "#5C7A9A",
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
const interactionTokens: Record<string, { icon: string; label: string; bar: string; bg: string }> = {
  "合": { icon: "⊕", label: "六合", bar: "#9B8E6B", bg: "rgba(155,142,107,0.08)" },
  "冲": { icon: "⚡", label: "六冲", bar: "#9B6B5E", bg: "rgba(155,107,94,0.07)" },
  "害": { icon: "⚠", label: "六害", bar: "#9B8A5E", bg: "rgba(155,138,94,0.07)" },
  "三合": { icon: "△", label: "三合", bar: "#7A8B6B", bg: "rgba(122,139,107,0.08)" },
  "半合": { icon: "◐", label: "半合", bar: "#8A8B7B", bg: "rgba(138,139,123,0.07)" },
  "刑": { icon: "⊗", label: "相刑", bar: "#8B6B6B", bg: "rgba(139,107,107,0.07)" },
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
      className="flex cursor-grab snap-x snap-mandatory gap-4 overflow-x-auto pb-4 active:cursor-grabbing [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
              {h}
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
  // Parse body into segments
  const bodyText = sec.body;
  const segments = bodyText.split(/\n(?=### )/);
  const introBlock = segments[0] ?? "";
  const subBlocks = segments.slice(1);

  // Extract interaction items from body
  const interactionRegex = /- ([⊕⚡⚠△◐⊗]) \*\*(.+?)(?:六合|六冲|六害|三合|半合|相刑)\*\*[：:]\s*(.*?)(?=\n- |\n###|\n\n(?=\S)|$)/g;

  return (
    <Reveal delay={60}>
      <section className="rounded-sm border border-divider bg-card">
        <ChapterHeader number={chapterNum} title={sec.title} subtitle={sec.subtitle} highlights={sec.highlights} />

        <div className="px-6 py-8 sm:px-10">
          {/* Intro paragraph */}
          <div className="mb-8 max-w-[66ch]">
            {introBlock.split("\n").filter(Boolean).map((line, i) => {
              if (line.startsWith("### ")) {
                return <h3 key={i} className="mb-3 mt-6 text-[11px] font-semibold tracking-[0.14em] text-ink dark:text-paper first:mt-0">{line.replace("### ", "")}</h3>;
              }
              if (line.startsWith("- ")) {
                const match = line.match(/^- ([⊕⚡⚠△◐⊗]) \*\*(.+?)(?:六合|六冲|六害|三合|半合|相刑)\*\*[：:]\s*(.*)$/);
                if (match) {
                  const interType = match[2].includes("六合") || match[2].includes("三合") || match[2].includes("半合") ? "合"
                    : match[2].includes("六冲") ? "冲" : match[2].includes("六害") ? "害"
                    : match[2].includes("相刑") ? "刑" : "合";
                  const tokens = interactionTokens[interType] ?? interactionTokens["合"];
                  return (
                    <div key={i} className="mb-3 overflow-hidden rounded-sm border transition-all duration-300 hover:-translate-y-0.5" style={{ borderColor: tokens.bar + "30" }}>
                      <div className="flex items-center gap-2 px-4 py-2.5" style={{ backgroundColor: tokens.bg }}>
                        <span className="text-[15px]" style={{ color: tokens.bar }}>{match[1]}</span>
                        <span className="text-[11px] font-semibold tracking-[0.08em] text-ink dark:text-paper">{match[2]}</span>
                        <span className="ml-auto text-[10px] tracking-[0.06em] text-ink-fade">{tokens.label}</span>
                      </div>
                      <div className="px-4 py-3 bg-card text-[12px] leading-7 text-ink-light">{match[3]}</div>
                    </div>
                  );
                }
                return <p key={i} className="mb-2 pl-3 text-[12px] leading-7 text-ink-light border-l-2 border-divider">{line.replace(/^- /, "")}</p>;
              }
              return <p key={i} className="mb-2 text-[12px] leading-7 text-ink-light">{line}</p>;
            })}
          </div>

          {/* Sub-blocks (日干合相, 藏干 etc.) */}
          {subBlocks.map((block, bi) => {
            const lines = block.split("\n").filter(Boolean);
            const headingLine = lines[0] ?? "";
            return (
              <div key={bi} className="mb-6 mt-8 border-t border-divider pt-6 first:mt-4">
                <h3 className="mb-3 text-[11px] font-semibold tracking-[0.14em] text-ink dark:text-paper">
                  {headingLine.replace("### ", "")}
                </h3>
                {lines.slice(1).map((line, li) => (
                  <p key={li} className="mb-2 text-[12px] leading-7 text-ink-light">{line.replace(/^- /, "")}</p>
                ))}
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
  const segments = bodyText.split(/\n(?=### )/);

  // Extract KPI data from text
  const totalMatch = bodyText.match(/出现\s*\*{0,2}(\d+)\*{0,2}\s*次/);
  const qualityMatch = bodyText.match(/综合评级[：:]\s*「?\*{0,2}(.{1,4})\*{0,2}」?/);
  const surfaceMatch = bodyText.match(/天干透出\s*(\d+)\s*次/);
  const hiddenMatch = bodyText.match(/地支藏干\s*(\d+)\s*次/);
  const positionMatch = bodyText.match(/出现位置[：:]\s*(.+?)(?:[。\n]|$)/);
  const deLingMatch = bodyText.match(/得月令(生扶|克制)/);

  return (
    <Reveal delay={70}>
      <section className="rounded-sm border border-divider bg-card">
        <ChapterHeader number={chapterNum} title={sec.title} subtitle={sec.subtitle} highlights={sec.highlights} />

        <div className="px-6 py-8 sm:px-10">
          {/* KPI cards */}
          <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-sm border border-divider bg-card px-4 py-5 text-center transition-all duration-300 hover:-translate-y-0.5">
              <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-ink-fade">出现次数</p>
              <p className="mt-2 text-[32px] font-light tracking-[0.04em] text-ink dark:text-paper">{totalMatch?.[1] ?? "—"}</p>
              <p className="mt-0.5 text-[10px] text-ink-fade">天干{surfaceMatch?.[1] ?? "—"} · 地支{hiddenMatch?.[1] ?? "—"}</p>
            </div>
            <div className="rounded-sm border border-divider bg-card px-4 py-5 text-center transition-all duration-300 hover:-translate-y-0.5">
              <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-ink-fade">质量评级</p>
              <div className="mt-3 inline-flex min-w-[64px] items-center justify-center rounded-full bg-ink px-4 py-1.5 text-[14px] font-medium tracking-[0.06em] text-paper dark:bg-paper dark:text-ink">
                {qualityMatch?.[1] ?? "—"}
              </div>
            </div>
            <div className="rounded-sm border border-divider bg-card px-4 py-5 text-center transition-all duration-300 hover:-translate-y-0.5">
              <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-ink-fade">得月令</p>
              <p className="mt-2 text-[28px] font-light tracking-[0.04em]" style={{ color: deLingMatch?.[1] === "生扶" ? "#6B8C5C" : deLingMatch?.[1] === "克制" ? "#9B6B5E" : "#B8A070" }}>
                {deLingMatch?.[1] === "生扶" ? "得生" : deLingMatch?.[1] === "克制" ? "受克" : "—"}
              </p>
            </div>
            <div className="rounded-sm border border-divider bg-card px-4 py-5 text-center transition-all duration-300 hover:-translate-y-0.5">
              <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-ink-fade">入婚姻宫</p>
              <p className="mt-2 text-[28px] font-light tracking-[0.04em]" style={{ color: bodyText.includes("配偶星入婚姻宫") || bodyText.includes("正星坐正位") ? "#6B8C5C" : "#B8A070" }}>
                {bodyText.includes("配偶星入婚姻宫") || bodyText.includes("正星坐正位") ? "是" : "—"}
              </p>
            </div>
          </div>

          {/* Intro + detail text */}
          <div className="max-w-[68ch] space-y-4">
            {segments.map((seg, si) => {
              const lines = seg.split("\n").filter(Boolean);
              const heading = lines[0]?.replace("### ", "") ?? "";
              const isDisclaimer = lines.some(l => l.startsWith("> ⚠️"));

              if (heading && lines.length > 1 && !isDisclaimer && !heading.startsWith(">")) {
                return (
                  <div key={si}>
                    <h3 className="mb-2 mt-6 text-[11px] font-semibold tracking-[0.14em] text-ink dark:text-paper first:mt-0">{heading}</h3>
                    {lines.slice(1).map((line, li) => {
                      if (line.startsWith(">")) {
                        return <div key={li} className="my-3 rounded-sm border border-divider bg-divider/20 px-4 py-3 text-[11px] leading-6 text-ink-fade dark:bg-divider/10">{line.replace(/^>\s*/, "")}</div>;
                      }
                      return <p key={li} className="text-[12px] leading-7 text-ink-light">{line.replace(/^\d+\.\s*/, "")}</p>;
                    })}
                  </div>
                );
              }

              return lines.map((line, li) => {
                if (line.startsWith(">")) {
                  return <div key={li} className="my-3 rounded-sm border border-divider bg-divider/20 px-4 py-3 text-[11px] leading-6 text-ink-fade dark:bg-divider/10">{line.replace(/^>\s*/, "")}</div>;
                }
                return <p key={li} className="text-[12px] leading-7 text-ink-light">{line.replace(/^\d+\.\s*/, "").replace(/^### /, "")}</p>;
              });
            })}
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
            {sec.body.split("\n").find(l => !l.startsWith("#") && !l.startsWith(">") && l.length > 20)?.slice(0, 120) ?? ""}
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
                <p className="text-[10px] tracking-[0.12em] text-ink-fade">按住卡片左右拖动查看全部</p>
                <p className="shrink-0 text-[10px] tabular-nums text-ink-fade">{cycleBlocks.length} 步大运</p>
              </div>

              <DragScroll>
                {cycleBlocks.map((block, i) => (
                  <article
                    key={i}
                    className={`relative min-h-64 w-[82vw] max-w-[280px] shrink-0 snap-start rounded-sm border px-5 py-5 select-none transition-all sm:w-[280px] ${
                      block.isCurrent ? "border-ink/25 bg-ink/[0.025] dark:border-paper/25 dark:bg-paper/[0.02]" : "border-divider bg-card opacity-60"
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
              <p className="text-[12px] leading-7 text-ink-light">{sec.body.split("\n").filter(l => !l.startsWith("#") && l.length > 10).join("\n")}</p>
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
                      <p className="mt-3 text-[11px] leading-5 text-ink-light line-clamp-3">{entry.detail}</p>
                      <div className="mt-3 border-t border-divider pt-2.5">
                        <p className="text-[10px] font-medium tracking-[0.06em] text-ink-fade">{entry.advice}</p>
                      </div>
                    </article>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-[12px] leading-7 text-ink-light max-w-[68ch]">{sec.body}</p>
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

  const strengthsItems = strengthsMatch?.[1]?.split("\n").filter(l => l.startsWith("- ")).map(l => l.replace(/^- /, "")) ?? [];
  const challengesItems = challengesMatch?.[1]?.split("\n").filter(l => l.startsWith("- ")).map(l => l.replace(/^- /, "")) ?? [];

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
                    <p className="text-[12px] leading-7 text-ink-light">{item}</p>
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
                    <p className="text-[12px] leading-7 text-ink-light">{item}</p>
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
                    <p className="text-[12px] leading-7 text-ink-light">{timingMatch[1].trim()}</p>
                  </div>
                </div>
              )}
              {adviceMatch && (
                <div>
                  <h3 className="mb-3 text-[11px] font-semibold tracking-[0.14em] text-ink dark:text-paper">个性化建议</h3>
                  <p className="text-[12px] leading-7 text-ink-light max-w-[66ch]">{adviceMatch[1].trim()}</p>
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
        const chapNum = String(i + 2).padStart(2, "0"); // Start from 02 since 01 is hero+bazi

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
