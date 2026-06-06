"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { BaziDeepReport } from "@/lib/bazi-deep-report";

function Stat({ value, label, note }: { value: string; label: string; note: string }) {
  return (
    <div className="border border-divider bg-card p-4">
      <div className="mb-1 text-2xl font-thin text-ink">{value}</div>
      <div className="mb-1 text-[11px] font-semibold tracking-[0.14em] text-ink">{label}</div>
      <div className="text-[11px] leading-5 text-ink-fade">{note}</div>
    </div>
  );
}

const elementStyles: Record<string, { accent: string; wash: string; meaning: string; image: string }> = {
  木: { accent: "#4F7D59", wash: "#E8F0E6", meaning: "生发、规划、成长", image: "枝叶" },
  火: { accent: "#B8643C", wash: "#F5E8DD", meaning: "表达、热度、行动", image: "火势" },
  土: { accent: "#A8874D", wash: "#F3EDDD", meaning: "承载、稳定、资源", image: "山丘" },
  金: { accent: "#7E8790", wash: "#ECEFF1", meaning: "规则、边界、判断", image: "矿脉" },
  水: { accent: "#4E7892", wash: "#E4EEF3", meaning: "流动、学习、应变", image: "水纹" },
};

function ElementMap({ elements }: { elements: BaziDeepReport["dashboard"]["elements"] }) {
  const max = Math.max(...elements.map((element) => element.value), 1);
  const dominant = elements.reduce((top, element) => (element.value > top.value ? element : top), elements[0]);
  const missing = elements.filter((element) => element.role === "不足").map((element) => element.name);
  const useful = elements.filter((element) => element.role === "可用").map((element) => element.name);

  return (
    <div>
      <div className="mb-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="border border-divider bg-paper/40 p-5 shadow-[inset_0_0_60px_rgba(44,36,22,0.04)]">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="mb-1 text-[11px] font-semibold tracking-[0.16em] text-ink">五行取象</div>
              <p className="text-[12px] leading-6 text-ink-light">以五行环绕看强弱，图形越大，代表这一类气越容易主导判断。</p>
            </div>
            <div className="border border-ink bg-card px-3 py-2 text-right">
              <div className="text-[10px] tracking-[0.14em] text-ink-fade">主轴</div>
              <div className="text-2xl font-thin text-ink">{dominant.name}</div>
            </div>
          </div>
          <ElementParticleField elements={elements} max={max} dominant={dominant.name} />
        </div>
        <div className="border border-divider bg-card p-5">
          <div className="mb-3 text-[11px] font-semibold tracking-[0.16em] text-ink">五行重点</div>
          <div className="space-y-4 text-[13px] leading-7 text-ink-light">
            <p>
              {dominant.name}气最显，代表{elementStyles[dominant.name]?.meaning ?? "命盘主轴"}更容易成为行事重心。它通常体现为做事时更看重稳定、承载、资源配置和现实结果。
            </p>
            <p>
              {missing.length > 0 ? `${missing.join("、")}相对不足，相关事项宜主动补位。` : "五行缺口不明显，重点在平衡使用。"}
              {useful.length > 0 ? ` 调候可借${useful.join("、")}，适合通过规则、学习、流动、人际和环境选择来平衡偏性。` : " 调候重点在避免单一优势过度消耗。"}
            </p>
            <p>看五行不是简单补缺，而是判断哪种气在推动选择，哪种气需要后天经营。用事时先稳住主轴，再补短板，效果会比单点用力更顺。</p>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        {elements.map((element, index) => {
          const style = elementStyles[element.name] ?? elementStyles.土;
          return (
            <div key={element.name} className="grid grid-cols-[32px_1fr_56px] items-center gap-3">
              <div className="text-lg font-light text-ink">{element.name}</div>
              <div className="h-3 overflow-hidden bg-divider">
                <div
                  className="h-3 animate-yx-fill"
                  style={{
                    width: `${Math.round((element.value / max) * 100)}%`,
                    backgroundColor: style.accent,
                    animationDelay: `${index * 120}ms`,
                  }}
                />
              </div>
              <div className="text-right text-[11px] text-ink-fade">{element.role}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function elementPoint(element: string) {
  if (element === "木") return { x: "50%", y: "16%" };
  if (element === "火") return { x: "82%", y: "39%" };
  if (element === "土") return { x: "70%", y: "76%" };
  if (element === "金") return { x: "30%", y: "76%" };
  return { x: "18%", y: "39%" };
}

function pointToNumber(point: { x: string; y: string }, width: number, height: number) {
  return {
    x: (Number.parseFloat(point.x) / 100) * width,
    y: (Number.parseFloat(point.y) / 100) * height,
  };
}

function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");
  return {
    r: Number.parseInt(clean.slice(0, 2), 16),
    g: Number.parseInt(clean.slice(2, 4), 16),
    b: Number.parseInt(clean.slice(4, 6), 16),
  };
}

function sampleElementShape(element: string, random: () => number) {
  const centered = () => ({ x: (random() - 0.5) * 2, y: (random() - 0.5) * 2 });

  if (element === "木") {
    const branch = random();
    if (branch < 0.28) return { x: (random() - 0.5) * 0.18, y: random() * 1.35 - 0.2 };
    if (branch < 0.52) return { x: -0.36 - random() * 0.34, y: -0.55 + random() * 0.5 };
    if (branch < 0.76) return { x: 0.36 + random() * 0.34, y: -0.6 + random() * 0.55 };
    return { x: (random() - 0.5) * 0.78, y: -0.95 + random() * 0.38 };
  }

  if (element === "火") {
    const y = 1 - random() * 2;
    const width = 0.18 + (1 - Math.abs(y)) * 0.55 + (y > 0.2 ? 0.18 : 0);
    const x = (random() - 0.5) * width * 2 + Math.sin(y * 5) * 0.12;
    return { x, y };
  }

  if (element === "土") {
    const layer = random();
    const y = layer < 0.42 ? 0.48 + random() * 0.45 : -0.15 + random() * 0.75;
    const width = y > 0.45 ? 0.95 : 0.35 + y * 0.75;
    return { x: (random() - 0.5) * width * 2, y };
  }

  if (element === "金") {
    const y = (random() - 0.5) * 1.8;
    const width = 0.86 - Math.abs(y) * 0.42;
    return { x: (random() - 0.5) * width * 2, y };
  }

  const y = (random() - 0.5) * 1.35;
  const x = (random() - 0.5) * 1.55;
  return { x, y: y + Math.sin(x * 4.2) * 0.18 };
}

function ElementParticleField({
  elements,
  max,
  dominant,
}: {
  elements: BaziDeepReport["dashboard"]["elements"];
  max: number;
  dominant: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    let frame = 0;
    let width = 0;
    let height = 0;
    let animationId = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const particles = elements.flatMap((element) => {
      const style = elementStyles[element.name] ?? elementStyles.土;
      const rgb = hexToRgb(style.accent);
      const count = 130 + Math.round((element.value / max) * 170);
      return Array.from({ length: count }, (_, index) => {
        let seed = index * 9301 + element.name.charCodeAt(0) * 49297;
        const random = () => {
          seed = (seed * 16807) % 2147483647;
          return (seed - 1) / 2147483646;
        };
        const shape = sampleElementShape(element.name, random);
        return {
          element,
          rgb,
          localX: shape.x,
          localY: shape.y,
          seed,
          speed: 0.006 + random() * 0.012,
          radius: 0.7 + random() * 1.7 + (element.value / max) * 0.55,
          phase: random() * Math.PI * 2,
          tint: 0.76 + random() * 0.28,
        };
      });
    });

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      width = Math.max(320, rect.width);
      height = Math.max(360, rect.height);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      frame += 1;
      context.clearRect(0, 0, width, height);
      context.fillStyle = "rgba(255, 255, 255, 0.68)";
      context.fillRect(0, 0, width, height);

      const center = { x: width / 2, y: height / 2 };
      const points = elements.map((element) => pointToNumber(elementPoint(element.name), width, height));

      context.strokeStyle = "rgba(184, 168, 138, 0.22)";
      context.lineWidth = 1;
      context.beginPath();
      points.forEach((point, index) => {
        if (index === 0) context.moveTo(point.x, point.y);
        else context.lineTo(point.x, point.y);
      });
      context.closePath();
      context.stroke();

      points.forEach((point) => {
        context.beginPath();
        context.moveTo(center.x, center.y);
        context.lineTo(point.x, point.y);
        context.stroke();
      });

      particles.forEach((particle) => {
        const point = pointToNumber(elementPoint(particle.element.name), width, height);
        const t = frame * particle.speed + particle.phase;
        const shapeSize = 34 + (particle.element.value / max) * 42;
        const drift = 2.5 + (particle.element.value / max) * 3.5;
        const x = point.x + particle.localX * shapeSize + Math.cos(t + particle.localY * 2) * drift;
        const y = point.y + particle.localY * shapeSize + Math.sin(t * 1.2 + particle.localX * 2) * drift;
        const alpha = 0.18 + (particle.element.value / max) * 0.34;
        const r = Math.min(255, Math.round(particle.rgb.r * particle.tint + 28 * (1 - particle.tint)));
        const g = Math.min(255, Math.round(particle.rgb.g * particle.tint + 28 * (1 - particle.tint)));
        const b = Math.min(255, Math.round(particle.rgb.b * particle.tint + 28 * (1 - particle.tint)));

        context.beginPath();
        context.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        context.arc(x, y, particle.radius, 0, Math.PI * 2);
        context.fill();
      });

      const dominantStyle = elementStyles[dominant] ?? elementStyles.土;
      const dominantRgb = hexToRgb(dominantStyle.accent);
      const glow = context.createRadialGradient(center.x, center.y, 4, center.x, center.y, 78);
      glow.addColorStop(0, `rgba(${dominantRgb.r}, ${dominantRgb.g}, ${dominantRgb.b}, 0.2)`);
      glow.addColorStop(1, "rgba(255, 255, 255, 0)");
      context.fillStyle = glow;
      context.beginPath();
      context.arc(center.x, center.y, 82, 0, Math.PI * 2);
      context.fill();

      context.strokeStyle = `rgba(${dominantRgb.r}, ${dominantRgb.g}, ${dominantRgb.b}, 0.42)`;
      context.lineWidth = 1;
      context.beginPath();
      context.arc(center.x, center.y, 34 + Math.sin(frame * 0.018) * 3, 0, Math.PI * 2);
      context.stroke();
      context.beginPath();
      context.arc(center.x, center.y, 54 + Math.cos(frame * 0.014) * 4, 0, Math.PI * 2);
      context.stroke();

      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillStyle = "rgba(44, 36, 22, 0.86)";
      context.font = "300 34px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
      context.fillText(dominant, center.x, center.y + 2);
      context.font = "11px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
      context.fillStyle = "rgba(122, 110, 94, 0.72)";
      context.fillText("主轴", center.x, center.y - 34);

      elements.forEach((element) => {
        const style = elementStyles[element.name] ?? elementStyles.土;
        const point = pointToNumber(elementPoint(element.name), width, height);
        const rgb = hexToRgb(style.accent);
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.92)`;
        context.font = "300 30px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
        context.fillText(element.name, point.x, point.y - 4);
        context.font = "11px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
        context.fillStyle = "rgba(122, 110, 94, 0.76)";
        context.fillText(`${element.role} · ${element.value}`, point.x, point.y + 26);
      });

      animationId = window.requestAnimationFrame(draw);
    };

    resize();
    draw();
    const observer = new ResizeObserver(resize);
    observer.observe(wrap);

    return () => {
      window.cancelAnimationFrame(animationId);
      observer.disconnect();
    };
  }, [dominant, elements, max]);

  return (
    <div ref={wrapRef} className="relative min-h-[420px] overflow-hidden border border-divider bg-card/70">
      <canvas ref={canvasRef} className="absolute inset-0" aria-hidden="true" />
    </div>
  );
}

function pillarHint(label: string) {
  if (label.includes("年")) return "外部环境与早年底色";
  if (label.includes("月")) return "事业节令与现实资源";
  if (label.includes("日")) return "自我核心与亲密关系";
  return "后续规划与长期走向";
}

function PillarTable({ pillars }: { pillars: BaziDeepReport["dashboard"]["pillars"] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {pillars.map((pillar, index) => (
        <div
          key={pillar.label}
          className="animate-yx-rise border border-divider bg-card p-4 shadow-[0_16px_35px_rgba(44,36,22,0.06)] transition-transform duration-300 hover:-translate-y-1"
          style={{ animationDelay: `${index * 120}ms` }}
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="text-[10px] tracking-[0.16em] text-ink-fade">{pillar.label}</div>
            <div className="text-[10px] text-ink-soft">{pillarHint(pillar.label)}</div>
          </div>
          <div className="mb-4 grid grid-cols-2 overflow-hidden border border-divider text-center">
            <div className="bg-paper/50 px-2 py-3">
              <div className="mb-1 text-[10px] text-ink-fade">天干</div>
              <div className="text-4xl font-thin text-ink">{pillar.ganZhi[0]}</div>
            </div>
            <div className="border-l border-divider px-2 py-3">
              <div className="mb-1 text-[10px] text-ink-fade">地支</div>
              <div className="text-4xl font-thin text-ink">{pillar.ganZhi[1]}</div>
            </div>
          </div>
          <div className="mb-3 flex items-center justify-between border-b border-divider pb-3">
            <span className="text-sm font-medium text-ink">{pillar.tenGod}</span>
            <span className="text-[11px] text-ink-fade">纳音 {pillar.nayin}</span>
          </div>
          <div className="space-y-2 text-[11px] leading-5 text-ink-light">
            <div>藏干：{pillar.hiddenTenGods.join("、")}</div>
            <div>旬空：{pillar.xunKong}</div>
            <div className="text-ink-soft">看法：先看{pillar.tenGod}如何落在{pillar.label}的位置。</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TenGodPanel({ tenGods }: { tenGods: BaziDeepReport["dashboard"]["tenGods"] }) {
  const visible = tenGods.slice(0, 8);
  const max = Math.max(...visible.map((tenGod) => tenGod.count), 1);

  return (
    <div className="border border-divider p-5">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <div className="mb-1 text-[12px] font-semibold tracking-[0.16em] text-ink">十神关系</div>
          <p className="text-[12px] leading-6 text-ink-light">看哪些关系力量重复出现，哪些会影响表达、责任、财务与边界。</p>
        </div>
        <div className="text-right text-[11px] text-ink-fade">强弱排序</div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {visible.map((tenGod, index) => (
          <div
            key={tenGod.name}
            className="animate-yx-rise border border-divider bg-paper/40 p-4"
            style={{ animationDelay: `${index * 70}ms` }}
          >
            <div className="mb-3 flex items-start justify-between">
              <div>
                <div className="text-lg font-light text-ink">{tenGod.name}</div>
                <p className="mt-1 text-[11px] leading-5 text-ink-light">{tenGod.meaning}</p>
              </div>
              <div className="text-2xl font-thin text-ink">x{tenGod.count}</div>
            </div>
            <div className="h-2 overflow-hidden bg-divider">
              <div className="h-2 animate-yx-fill bg-ink" style={{ width: `${Math.round((tenGod.count / max) * 100)}%`, animationDelay: `${index * 80}ms` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LuckDeepSection({ report, index }: { report: BaziDeepReport; index: number }) {
  const current = report.dashboard.currentLuck;
  const currentIndex = current ? report.luckTimeline.findIndex((cycle) => cycle.ganZhi === current.ganZhi && `${cycle.startYear}-${cycle.endYear}` === current.years) : -1;
  const currentCycle = currentIndex >= 0 ? report.luckTimeline[currentIndex] : report.luckTimeline[0];
  const nextCycle = currentIndex >= 0 ? report.luckTimeline[currentIndex + 1] : report.luckTimeline[1];

  return (
    <div className="animate-yx-rise border border-divider bg-card p-6" style={{ animationDelay: `${index * 80}ms` }}>
      <div className="mb-2 text-[11px] tracking-[0.16em] text-ink-fade">详批 {index + 1}</div>
      <h2 className="mb-3 text-2xl font-thin tracking-[0.12em] text-ink">大运流年详解</h2>
      <p className="mb-5 text-[13px] leading-7 text-ink-soft">重点看当前十年的主题、下一阶段的转向，以及每一步大运该怎么取舍。</p>
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        {currentCycle && (
          <div className="border border-ink bg-paper p-5">
            <div className="mb-2 text-[11px] font-semibold tracking-[0.16em] text-ink">当前十年</div>
            <div className="mb-2 text-4xl font-thin tracking-[0.12em] text-ink">{currentCycle.ganZhi}</div>
            <div className="mb-4 text-[12px] text-ink-fade">
              {currentCycle.startYear}-{currentCycle.endYear} · {currentCycle.startAge}-{currentCycle.endAge}岁
            </div>
            <p className="text-[13px] leading-7 text-ink-light">{currentCycle.theme}</p>
          </div>
        )}
        <div className="border border-divider p-5">
          <div className="mb-2 text-[11px] font-semibold tracking-[0.16em] text-ink">接下来要观察</div>
          {nextCycle ? (
            <>
              <div className="mb-2 text-3xl font-thin tracking-[0.12em] text-ink">{nextCycle.ganZhi}</div>
              <div className="mb-4 text-[12px] text-ink-fade">
                {nextCycle.startYear}-{nextCycle.endYear} · {nextCycle.startAge}-{nextCycle.endAge}岁
              </div>
              <p className="text-[13px] leading-7 text-ink-light">{nextCycle.theme}</p>
            </>
          ) : (
            <p className="text-[13px] leading-7 text-ink-light">后续阶段以稳住当前节奏为先，减少无谓消耗。</p>
          )}
        </div>
      </div>
      <div className="mt-5 border border-divider bg-paper/40 p-5">
        <div className="mb-4 text-[12px] font-semibold tracking-[0.16em] text-ink">十年流年观察点</div>
        <div className="grid gap-2 sm:grid-cols-5">
          {(currentCycle?.years ?? []).slice(0, 10).map((year, yearIndex) => (
            <div key={year.year} className="animate-yx-rise border border-divider bg-card p-3" style={{ animationDelay: `${yearIndex * 45}ms` }}>
              <div className="text-sm text-ink">{year.year}</div>
              <div className="text-xl font-thin text-ink">{year.ganZhi}</div>
              <div className="text-[10px] text-ink-fade">{year.age}岁</div>
            </div>
          ))}
        </div>
        <p className="mt-5 text-[13px] leading-7 text-ink-light">
          这一段不直接下单年吉凶，而是用十年主题去看每一年：哪些年份适合推进，哪些年份适合守住资源，哪些年份要特别注意关系、健康和财务边界。
        </p>
      </div>
    </div>
  );
}

function LuckTimeline({ report }: { report: BaziDeepReport }) {
  const current = report.dashboard.currentLuck;
  const currentIndex = current ? report.luckTimeline.findIndex((cycle) => cycle.ganZhi === current.ganZhi && `${cycle.startYear}-${cycle.endYear}` === current.years) : -1;

  return (
    <section className="mt-5 border border-divider bg-card p-6">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <div className="mb-2 text-[11px] font-semibold tracking-[0.18em] text-ink">大运流年</div>
          <p className="text-[12px] leading-6 text-ink-light">当前阶段会突出显示，前后阶段用于观察节奏变化。</p>
        </div>
        {currentIndex >= 0 && <div className="text-[11px] tracking-[0.14em] text-ink-fade">当前第 {currentIndex + 1} 步</div>}
      </div>
      <div className="relative overflow-x-auto pb-4">
        <div className="absolute left-0 top-[74px] h-px w-full min-w-[1600px] bg-divider" />
        <div className="flex min-w-[1600px] gap-4">
          {report.luckTimeline.map((cycle, cycleIndex) => {
            const isCurrent = cycleIndex === currentIndex;
            const isNext = cycleIndex === currentIndex + 1;
            return (
              <div
                key={`${cycle.ganZhi}-${cycle.startYear}`}
                className={[
                  "relative min-w-[245px] animate-yx-rise border p-4 transition-transform duration-300",
                  isCurrent ? "border-ink bg-ink text-paper shadow-[0_18px_40px_rgba(44,36,22,0.18)]" : "border-divider bg-paper/30 hover:-translate-y-1",
                ].join(" ")}
                style={{ animationDelay: `${cycleIndex * 80}ms` }}
              >
                <div className={["absolute left-5 top-[66px] h-4 w-4 rounded-full border-2", isCurrent ? "border-paper bg-ink" : "border-ink bg-card"].join(" ")} />
                <div className="mb-6 flex items-start justify-between gap-3">
                  <div>
                    <div className={["text-3xl font-thin tracking-[0.12em]", isCurrent ? "text-paper" : "text-ink"].join(" ")}>{cycle.ganZhi}</div>
                    <div className={["text-[11px]", isCurrent ? "text-paper/65" : "text-ink-fade"].join(" ")}>
                      {cycle.startYear}-{cycle.endYear}
                    </div>
                  </div>
                  {(isCurrent || isNext) && (
                    <div className={["border px-2 py-1 text-[10px] tracking-[0.12em]", isCurrent ? "border-paper/40 text-paper" : "border-divider text-ink-fade"].join(" ")}>
                      {isCurrent ? "当前" : "下一步"}
                    </div>
                  )}
                </div>
                <p className={["mb-4 text-[13px] leading-7", isCurrent ? "text-paper/82" : "text-ink-light"].join(" ")}>
                  {cycle.startAge}-{cycle.endAge}岁 · {cycle.theme}
                </p>
                <div className={["grid grid-cols-5 gap-1.5 border-t pt-3", isCurrent ? "border-paper/20" : "border-divider"].join(" ")}>
                  {cycle.years.slice(0, 10).map((year, yearIndex) => (
                    <div key={year.year} className={["p-1.5 text-center", isCurrent ? "bg-paper/10" : "bg-card"].join(" ")}>
                      <div className={["text-[10px]", isCurrent ? "text-paper/62" : "text-ink-fade"].join(" ")}>{year.year}</div>
                      <div className={["text-[11px]", isCurrent ? "text-paper" : "text-ink-light"].join(" ")}>{year.ganZhi}</div>
                      {isCurrent && yearIndex === 0 && <div className="mt-1 h-1 bg-paper" />}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default function BaziReportPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState("");
  const [report, setReport] = useState<BaziDeepReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then(({ id: nextId }) => setId(nextId));
  }, [params]);

  useEffect(() => {
    if (!id) return;
    const cached = window.sessionStorage.getItem(`yixiang:bazi-report:${id}`);
    if (cached) {
      setReport(JSON.parse(cached) as BaziDeepReport);
      setLoading(false);
      return;
    }

    fetch(`/api/reports/bazi/${id}`)
      .then(async (response) => {
        if (!response.ok) throw new Error("报告未找到");
        const data = await response.json();
        setReport(data.report);
      })
      .catch(() => setReport(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="py-20 text-center text-sm tracking-[0.16em] text-ink-fade">详批载入中</div>;
  }

  if (!report) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <h1 className="mb-4 text-2xl font-thin tracking-[0.16em] text-ink">详批未载入</h1>
        <p className="mb-6 text-[13px] leading-7 text-ink-light">请从八字页重新排盘，或登录后在“我的”中查看已保存的详批。</p>
        <Link href="/bazi" className="inline-flex min-h-11 items-center justify-center bg-ink px-7 py-3 text-sm font-medium tracking-[0.14em] text-paper">
          返回八字页
        </Link>
      </div>
    );
  }

  return (
    <article className="pb-16 pt-4">
      <section className="relative overflow-hidden border border-divider bg-card px-6 py-10 sm:px-10">
        <div className="absolute right-6 top-6 text-[11px] tracking-[0.16em] text-ink-fade">已保存</div>
        <div className="mb-6 text-[11px] tracking-[0.25em] text-ink-fade">{report.priceLabel}</div>
        <h1 className="max-w-2xl text-4xl font-thin leading-tight tracking-[0.12em] text-ink sm:text-5xl">{report.headline}</h1>
        <p className="mt-6 max-w-2xl text-[14px] leading-8 text-ink-light">{report.summary}</p>
        <div className="mt-8 grid gap-3 sm:grid-cols-4">
          {report.deliverables.map((item) => (
            <Stat key={item.label} value={item.value} label={item.label} note={item.note} />
          ))}
        </div>
      </section>

      <section className="mt-5 border border-divider bg-card p-6">
        <div className="mb-5 text-[11px] font-semibold tracking-[0.18em] text-ink">命盘总览</div>
        <PillarTable pillars={report.dashboard.pillars} />
        <div className="mt-5 border border-divider p-5">
          <div className="mb-4 text-[12px] font-semibold tracking-[0.16em] text-ink">五行分布</div>
          <ElementMap elements={report.dashboard.elements} />
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <TenGodPanel tenGods={report.dashboard.tenGods} />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
            <div className="border border-divider p-5">
              <div className="mb-3 text-[12px] font-semibold tracking-[0.16em] text-ink">优势摘要</div>
              <ul className="space-y-2 text-[12px] leading-6 text-ink-light">
                {report.dashboard.strengths.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="border border-divider p-5">
              <div className="mb-3 text-[12px] font-semibold tracking-[0.16em] text-ink">风险提醒</div>
              <ul className="space-y-2 text-[12px] leading-6 text-ink-light">
                {report.dashboard.risks.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-4 sm:grid-cols-2">
        {report.keyFindings.map((finding, index) => (
          <div key={finding} className="animate-yx-rise border border-divider bg-card p-5" style={{ animationDelay: `${index * 90}ms` }}>
            <div className="mb-2 text-[11px] tracking-[0.16em] text-ink-fade">关键结论 {index + 1}</div>
            <p className="text-[13px] leading-7 text-ink-light">{finding}</p>
          </div>
        ))}
      </section>

      <LuckTimeline report={report} />

      <section className="mt-5 space-y-5">
        {report.sections.map((section, index) =>
          section.title.includes("大运流年") ? (
            <LuckDeepSection key={section.title} report={report} index={index} />
          ) : (
            <div key={section.title} className="animate-yx-rise border border-divider bg-card p-6" style={{ animationDelay: `${index * 80}ms` }}>
              <div className="mb-2 text-[11px] tracking-[0.16em] text-ink-fade">详批 {index + 1}</div>
              <h2 className="mb-3 text-2xl font-thin tracking-[0.12em] text-ink">{section.title}</h2>
              <p className="mb-4 text-[13px] leading-7 text-ink-soft">{section.summary}</p>
              <div className="mb-4 flex flex-wrap gap-2">
                {section.highlights.map((highlight) => (
                  <span key={highlight} className="bg-divider/30 px-2 py-1 text-[10px] tracking-[0.08em] text-ink-light">
                    {highlight}
                  </span>
                ))}
              </div>
              <p className="text-[14px] leading-8 text-ink-light">{section.body}</p>
            </div>
          ),
        )}
      </section>

      <section className="mt-5 border border-divider bg-card p-6">
        <div className="mb-5 text-[11px] font-semibold tracking-[0.18em] text-ink">行动建议</div>
        <div className="grid gap-5 sm:grid-cols-2">
          {report.actionPlan.map((group) => (
            <div key={group.title} className="border border-divider p-5">
              <h3 className="mb-3 text-sm font-semibold tracking-[0.14em] text-ink">{group.title}</h3>
              <ul className="space-y-3 text-[13px] leading-7 text-ink-light">
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </article>
  );
}
