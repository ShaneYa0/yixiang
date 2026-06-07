# 六爻问象 · 视觉重设计 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将易经起卦仪式从视频背景方案重写为宣纸水墨风格的纯 Canvas 2D 动画

**Architecture:** 单一组件 `IchingCast.tsx` 内管理阶段状态和 Canvas 动画循环。绘制函数拆到独立 `ritual-canvas.ts` 文件中，纯函数无副作用，方便测试和复用。CSS 层提供宣纸底纹理和辅助动画。

**Tech Stack:** React 19 + Canvas 2D + CSS（无外部动画库）

---

## 文件结构

| 文件 | 职责 |
|------|------|
| `src/components/iching/IchingCast.tsx` | 组件：阶段状态、Canvas ref、动画循环调度、UI 布局 |
| `src/components/iching/ritual-canvas.ts` | 纯函数：所有 Canvas 绘制逻辑（宣纸底、墨晕、铜钱、爻线） |
| `src/app/globals.css` | CSS：宣纸纹理背景、微光动画关键帧、移除旧视频相关样式 |
| `public/videos/iching-ritual.mp4` | 删除 |
| `public/ritual-render.svg` | 删除 |

---

### Task 1: 清理旧资源

**Files:**
- Delete: `public/videos/iching-ritual.mp4`
- Delete: `public/ritual-render.svg`

- [ ] **Step 1: 删除旧视频和海报文件**

```bash
rm public/videos/iching-ritual.mp4
rm public/ritual-render.svg
```

- [ ] **Step 2: 提交**

```bash
git add -A
git commit -m "chore: 移除易经起卦旧视频资源，准备水墨动画重写
"
```

---

### Task 2: 更新 CSS

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: 移除 globals.css 中不再使用的视频相关动画（yx-orbit-draw, yx-element-pulse, yx-element-float）**

将 `src/app/globals.css` 文件末尾的三个 keyframes（254-287 行）替换为新的水墨动画关键帧：

```css
/* ===== 易经起卦 · 水墨仪式动画 ===== */

@keyframes yx-ink-glow {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(180, 140, 60, 0);
  }
  50% {
    box-shadow: 0 0 40px 2px rgba(180, 140, 60, 0.18);
  }
}

@keyframes yx-coin-drop {
  0% {
    transform: translateY(-120px) rotate(0deg);
    opacity: 0;
  }
  60% {
    opacity: 1;
  }
  85% {
    transform: translateY(4px) rotate(540deg);
  }
  92% {
    transform: translateY(-2px) rotate(560deg);
  }
  100% {
    transform: translateY(0) rotate(580deg);
  }
}

@keyframes yx-fade-up {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes yx-gua-reveal {
  0% {
    opacity: 0;
    filter: blur(8px);
    transform: scale(0.96);
  }
  100% {
    opacity: 1;
    filter: blur(0);
    transform: scale(1);
  }
}
```

- [ ] **Step 2: 在 globals.css 中添加宣纸纹理背景工具类**

在文件末尾继续添加：

```css
/* 宣纸纹理背景 */
.yx-rice-paper {
  background-color: #f6f1e6;
  background-image:
    radial-gradient(ellipse at 50% 40%, rgba(200, 180, 150, 0.12) 0%, transparent 70%),
    radial-gradient(circle at 30% 60%, rgba(180, 160, 130, 0.06) 0%, transparent 50%),
    radial-gradient(circle at 70% 30%, rgba(190, 175, 145, 0.05) 0%, transparent 50%);
}
```

- [ ] **Step 3: 提交**

```bash
git add src/app/globals.css
git commit -m "style: 替换为水墨动画关键帧，添加宣纸纹理样式
"
```

---

### Task 3: 创建 Canvas 绘制工具函数

**Files:**
- Create: `src/components/iching/ritual-canvas.ts`

- [ ] **Step 1: 创建 ritual-canvas.ts 文件，包含所有纯绘制函数**

```typescript
// 宣纸水墨仪式的 Canvas 绘制函数（纯函数，无副作用）

export type RitualPhase = "idle" | "breath" | "cloud" | "coins" | "seal" | "done";

// ---- 常量 ----

const INK_COLOR = "#1a1510";
const PAPER_BG = "#f6f1e6";
const COIN_COLOR = "#8B7355";
const COIN_RIM = "#6B5740";
const CINNABAR = "#C04040";
const GOLD_LIGHT = "rgba(200, 160, 80, 0.15)";

/** 每阶段激活的爻位线数 */
export const ACTIVE_LINES: Record<RitualPhase, number> = {
  idle: 0, breath: 1, cloud: 2, coins: 4, seal: 6, done: 6,
};

// ---- 宣纸背景 ----

export function drawPaperBg(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // 底色
  ctx.fillStyle = PAPER_BG;
  ctx.fillRect(0, 0, w, h);

  // 纸纤维肌理 — 微细随机短线条
  ctx.strokeStyle = "rgba(170, 155, 130, 0.06)";
  ctx.lineWidth = 0.5;
  const count = Math.floor((w * h) / 6000);
  for (let i = 0; i < count; i++) {
    const x = ((i * 173 + 37) % w);
    const y = ((i * 211 + 59) % h);
    const len = 2 + (i % 5);
    const angle = ((i * 73) % 360) * (Math.PI / 180);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
    ctx.stroke();
  }

  // 中央太极水印（极淡）
  drawTaijiWatermark(ctx, w / 2, h * 0.42, Math.min(w, h) * 0.18);
}

function drawTaijiWatermark(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.save();
  ctx.globalAlpha = 0.035;
  ctx.strokeStyle = INK_COLOR;
  ctx.lineWidth = 0.8;
  // 外圆
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  // S 曲线
  ctx.beginPath();
  ctx.arc(cx, cy - r / 2, r / 2, Math.PI * 0.5, Math.PI * 1.5);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy + r / 2, r / 2, -Math.PI * 0.5, Math.PI * 0.5);
  ctx.stroke();
  // 两个小圆点
  ctx.beginPath();
  ctx.arc(cx, cy - r / 2, r * 0.1, 0, Math.PI * 2);
  ctx.arc(cx, cy + r / 2, r * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ---- 爻位虚线 ----

export function drawYaoPlaceholders(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  activeCount: number,
) {
  const lineW = w * 0.52;
  const spacing = Math.min(h * 0.09, 52);
  const baseY = h * 0.68;

  for (let i = 0; i < 6; i++) {
    const y = baseY - i * spacing;
    const alpha = i < activeCount ? 0.18 + i * 0.02 : 0.05;
    ctx.strokeStyle = `rgba(26, 21, 16, ${alpha})`;
    ctx.lineWidth = 0.8;
    ctx.setLineDash([4, 10]);
    ctx.beginPath();
    ctx.moveTo((w - lineW) / 2, y);
    ctx.lineTo((w + lineW) / 2, y);
    ctx.stroke();
  }
  ctx.setLineDash([]);
}

// ---- 墨滴/墨晕 ----

export function drawInkDrop(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  progress: number, // 0→1 下落过程
) {
  const dropY = y - 60 + progress * 60; // 从上方 60px 落到目标位置
  const dropR = 2 + progress * 2; // 小墨滴

  ctx.fillStyle = INK_COLOR;
  ctx.beginPath();
  ctx.arc(x, dropY, dropR, 0, Math.PI * 2);
  ctx.fill();
}

export function drawInkDiffusion(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  progress: number, // 0→1 扩散程度
) {
  const maxR = 160;
  const r = maxR * Math.min(progress, 1);

  // 多层渐变模拟浓淡
  const layers = [
    { r: r, inner: "rgba(26,21,16,0.45)", outer: "rgba(26,21,16,0)" },
    { r: r * 0.55, inner: "rgba(20,16,12,0.55)", outer: "rgba(20,16,12,0.02)" },
    { r: r * 0.22, inner: "rgba(15,12,9,0.65)", outer: "rgba(15,12,9,0.05)" },
  ];

  for (const layer of layers) {
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, layer.r);
    grad.addColorStop(0, layer.inner);
    grad.addColorStop(0.65, layer.outer.replace("0)", "0.12)"));
    grad.addColorStop(1, layer.outer);

    ctx.fillStyle = grad;
    ctx.beginPath();
    // 不规则边缘 — 用正弦扰动
    const points = 48;
    for (let i = 0; i < points; i++) {
      const angle = (i / points) * Math.PI * 2;
      const noise = 1 + Math.sin(i * 7.3 + 1.8) * 0.08 + Math.cos(i * 11.7 + 3.1) * 0.05;
      const pr = layer.r * noise;
      const px = cx + Math.cos(angle) * pr;
      const py = cy + Math.sin(angle) * pr;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }
}

// ---- 铜钱 ----

export function drawCoin(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  rotation: number,
  scale: number = 1,
) {
  const r = 20 * scale;
  const innerR = 9 * scale;
  const hole = 3.5 * scale;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);

  // 币身
  ctx.fillStyle = COIN_COLOR;
  ctx.strokeStyle = COIN_RIM;
  ctx.lineWidth = 1.5 * scale;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 内圈
  ctx.strokeStyle = "rgba(90, 72, 50, 0.7)";
  ctx.lineWidth = 0.7 * scale;
  ctx.beginPath();
  ctx.arc(0, 0, innerR, 0, Math.PI * 2);
  ctx.stroke();

  // 方孔
  ctx.fillStyle = PAPER_BG;
  ctx.beginPath();
  ctx.rect(-hole, -hole, hole * 2, hole * 2);
  ctx.fill();

  // 简化的字痕（四个小短线模拟刻字）
  ctx.strokeStyle = "rgba(90, 72, 50, 0.35)";
  ctx.lineWidth = 0.5 * scale;
  const marks = [0, Math.PI / 2, Math.PI, Math.PI * 1.5];
  for (const angle of marks) {
    const mx = Math.cos(angle) * (innerR + 3) * scale;
    const my = Math.sin(angle) * (innerR + 3) * scale;
    ctx.beginPath();
    ctx.moveTo(mx - 2 * scale, my);
    ctx.lineTo(mx + 2 * scale, my);
    ctx.stroke();
  }

  ctx.restore();
}

/** 在落点绘制墨迹迸溅粒子 */
export function drawInkSplash(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  intensity: number,
) {
  const count = Math.floor(intensity * 12);
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = intensity * 18 * Math.random();
    const px = cx + Math.cos(angle) * dist;
    const py = cy + Math.sin(angle) * dist;
    const pr = 0.5 + Math.random() * 1.5;
    ctx.fillStyle = `rgba(26,21,16,${0.3 + Math.random() * 0.4})`;
    ctx.beginPath();
    ctx.arc(px, py, pr, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ---- 爻线（毛笔笔触） ----

export function drawYaoLine(
  ctx: CanvasRenderingContext2D,
  x1: number, y1: number,
  x2: number, y2: number,
  progress: number,
  broken: boolean,
) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);

  if (broken) {
    // 阴爻：两段短线，中间留空
    const gap = len * 0.12;
    const segLen = (len - gap) / 2;
    drawBrushSegment(ctx, x1, y1, x1 + dx * (segLen / len), y1 + dy * (segLen / len), progress, len / 2);
    drawBrushSegment(ctx, x2 - dx * (segLen / len), y2 - dy * (segLen / len), x2, y2, Math.max(0, progress - 0.5) * 2, len / 2);
  } else {
    // 阳爻：一笔贯穿
    drawBrushSegment(ctx, x1, y1, x2, y2, progress, len);
  }
}

function drawBrushSegment(
  ctx: CanvasRenderingContext2D,
  x1: number, y1: number,
  x2: number, y2: number,
  progress: number,
  totalLen: number,
) {
  if (progress <= 0) return;
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2 - 2.5; // 微微上弓，笔意

  ctx.save();
  ctx.strokeStyle = INK_COLOR;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // 主笔触：粗线
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.quadraticCurveTo(midX, midY, x2, y2);
  ctx.setLineDash([totalLen * progress, totalLen]);
  ctx.lineDashOffset = 0;
  ctx.stroke();

  // 枯笔飞白：细线微偏移，模拟毛笔飞白
  ctx.lineWidth = 0.6;
  ctx.strokeStyle = "rgba(26,21,16,0.35)";
  ctx.beginPath();
  ctx.moveTo(x1, y1 + 1.2);
  ctx.quadraticCurveTo(midX, midY + 0.8, x2, y2 + 0.5);
  ctx.setLineDash([totalLen * progress * 0.7, totalLen]);
  ctx.lineDashOffset = -(totalLen * 0.15);
  ctx.stroke();

  ctx.setLineDash([]);
  ctx.restore();
}

// ---- 完成微光 ----

export function drawCompletionGlow(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  progress: number,
) {
  const alpha = Math.sin(progress * Math.PI) * 0.12; // 一次闪烁
  if (alpha <= 0) return;
  const grad = ctx.createRadialGradient(w / 2, h * 0.45, 0, w / 2, h * 0.45, Math.min(w, h) * 0.5);
  grad.addColorStop(0, `rgba(200,160,80,${alpha})`);
  grad.addColorStop(1, "rgba(200,160,80,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

// ---- 完整渲染 ----

export interface RenderState {
  phase: RitualPhase;
  elapsedInPhase: number; // ms
  totalElapsed: number;   // ms
  width: number;
  height: number;
}

export function renderFrame(ctx: CanvasRenderingContext2D, state: RenderState) {
  const { phase, elapsedInPhase, width: w, height: h } = state;

  ctx.clearRect(0, 0, w, h);
  drawPaperBg(ctx, w, h);

  const activeLines = ACTIVE_LINES[phase];
  drawYaoPlaceholders(ctx, w, h, activeLines);

  // 阶段 1+：墨晕
  if (phase !== "idle") {
    const inkCenterY = h * 0.48;
    let inkProgress = 0;
    if (phase === "breath") inkProgress = clamp(elapsedInPhase / 760, 0, 1) * 0.5;
    else if (phase === "cloud") inkProgress = 0.5 + clamp(elapsedInPhase / 940, 0, 1) * 0.35;
    else inkProgress = 0.85;

    if (inkProgress > 0) {
      drawInkDiffusion(ctx, w / 2, inkCenterY, inkProgress);
    }

    // 阶段 1：墨滴下落
    if (phase === "breath") {
      drawInkDrop(ctx, w / 2, inkCenterY, clamp(elapsedInPhase / 760, 0, 1));
    }
  }

  // 阶段 3：铜钱
  if (phase === "coins" || phase === "seal" || phase === "done") {
    const coinProgress = phase === "coins" ? clamp(elapsedInPhase / 1060, 0, 1) : 1;
    const coinY = h * 0.56;
    const spacing = 36;
    const coins = [
      { x: w / 2 - spacing, delay: 0 },
      { x: w / 2, delay: 0.25 },
      { x: w / 2 + spacing, delay: 0.5 },
    ];
    for (const c of coins) {
      const cp = clamp((coinProgress - c.delay) / 0.33, 0, 1);
      if (cp <= 0) continue;
      // 下落 + 弹跳缓动
      const eased = easeOutBounce(cp);
      const drawY = coinY - 80 + eased * 80;
      const rot = eased * Math.PI * 3;
      drawCoin(ctx, c.x, drawY, rot, 1);
      // 落地墨迹
      if (cp > 0.85) {
        drawInkSplash(ctx, c.x, coinY, (cp - 0.85) / 0.15);
      }
    }
  }

  // 阶段 3-5：爻线从下往上生长
  if (phase === "coins" || phase === "seal" || phase === "done") {
    const totalLines = 6;
    let linesToDraw = 0;
    if (phase === "coins") linesToDraw = 1;
    else if (phase === "seal") linesToDraw = 1 + clamp(elapsedInPhase / 1040, 0, 1) * 5;
    else linesToDraw = 6;

    drawYaoLinesStack(ctx, w, h, Math.floor(linesToDraw), Math.min(linesToDraw % 1, 0.999));
  }

  // 阶段 5：完成微光
  if (phase === "done") {
    drawCompletionGlow(ctx, w, h, clamp(elapsedInPhase / 500, 0, 1));
  }
}

function drawYaoLinesStack(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  fullLines: number,
  partialProgress: number,
) {
  const lineW = w * 0.52;
  const spacing = Math.min(h * 0.09, 52);
  const baseY = h * 0.68;
  const yaoPattern = [false, true, false, true, true, false]; // 示例阴阳

  // 已有完整爻线
  for (let i = 0; i < fullLines; i++) {
    const y = baseY - i * spacing;
    drawYaoLine(ctx, (w - lineW) / 2, y, (w + lineW) / 2, y, 1, yaoPattern[i] ?? false);
  }

  // 正在生长的爻线
  if (partialProgress > 0 && fullLines < 6) {
    const i = fullLines;
    const y = baseY - i * spacing;
    drawYaoLine(ctx, (w - lineW) / 2, y, (w + lineW) / 2, y, partialProgress, yaoPattern[i] ?? false);
  }
}

// ---- 工具函数 ----

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function easeOutBounce(t: number): number {
  const n1 = 7.5625;
  const d1 = 2.75;
  if (t < 1 / d1) return n1 * t * t;
  else if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
  else if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
  else return n1 * (t -= 2.625 / d1) * t + 0.984375;
}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/iching/ritual-canvas.ts
git commit -m "feat: 添加宣纸水墨 Canvas 绘制工具函数
"
```

---

### Task 4: 重写 IchingCast 组件

**Files:**
- Modify: `src/components/iching/IchingCast.tsx`

- [ ] **Step 1: 用 Canvas 动画 + 宣纸风格重写 IchingCast.tsx**

```tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  type RitualPhase,
  renderFrame,
  type RenderState,
} from "./ritual-canvas";

const phaseLabels: Record<RitualPhase, string> = {
  idle: "静心问卦",
  breath: "一念初定",
  cloud: "阴阳成旋",
  coins: "三钱定爻",
  seal: "六爻成象",
  done: "卦象已成",
};

const PHASE_DURATIONS: Partial<Record<RitualPhase, number>> = {
  breath: 760,
  cloud: 940,
  coins: 1060,
  seal: 1040,
};

export function IchingCast({ onCast, isCasting }: { onCast: (question: string) => void; isCasting: boolean }) {
  const [question, setQuestion] = useState("");
  const [phase, setPhase] = useState<RitualPhase>("idle");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const questionRef = useRef("");

  useEffect(() => {
    questionRef.current = question;
  }, [question]);

  const ritualActive = phase !== "idle";

  // 动画循环
  useEffect(() => {
    if (!ritualActive) {
      // idle：绘制静止帧
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      renderFrame(ctx, {
        phase: "idle",
        elapsedInPhase: 0,
        totalElapsed: 0,
        width: canvas.width,
        height: canvas.height,
      });
      return;
    }

    startTimeRef.current = performance.now();

    const tick = (now: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const totalElapsed = now - startTimeRef.current;

      // 确定当前阶段
      let currentPhase: RitualPhase = "breath";
      let phaseStart = 0;
      let accumulated = 0;

      const phaseOrder: RitualPhase[] = ["breath", "cloud", "coins", "seal"];
      for (const p of phaseOrder) {
        const dur = PHASE_DURATIONS[p] ?? 0;
        if (totalElapsed >= accumulated && totalElapsed < accumulated + dur) {
          currentPhase = p;
          phaseStart = accumulated;
          break;
        }
        accumulated += dur;
        currentPhase = "done";
        phaseStart = accumulated;
      }

      if (totalElapsed >= 3800) {
        currentPhase = "done";
        phaseStart = 3800;
      }

      const elapsedInPhase = totalElapsed - phaseStart;

      // 更新阶段状态（触发 React 重渲染用于文字标签）
      if (currentPhase !== phase) {
        setPhase(currentPhase);
      }

      renderFrame(ctx, {
        phase: currentPhase,
        elapsedInPhase,
        totalElapsed,
        width: canvas.width,
        height: canvas.height,
      });

      if (totalElapsed < 4300) {
        animFrameRef.current = requestAnimationFrame(tick);
      } else {
        // 动画结束
        setPhase("done");
        onCast(questionRef.current);
      }
    };

    animFrameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [ritualActive]); // eslint-disable-line react-hooks/exhaustive-deps

  // Canvas 尺寸管理
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(dpr, dpr);

      // idle 时重绘
      if (!ritualActive) {
        const ctx2 = canvas.getContext("2d");
        if (ctx2) {
          ctx2.save();
          ctx2.scale(dpr, dpr);
          renderFrame(ctx2, {
            phase: "idle",
            elapsedInPhase: 0,
            totalElapsed: 0,
            width: rect.width,
            height: rect.height,
          });
          ctx2.restore();
        }
      }
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [ritualActive]);

  const startRitual = useCallback(() => {
    if (ritualActive || isCasting) return;
    setPhase("breath");
  }, [ritualActive, isCasting]);

  return (
    <div className="mx-auto max-w-2xl py-8 text-center">
      <p className="mb-1 text-[10px] font-semibold tracking-[0.3em] text-ink-fade">
        一念起 · 六爻成
      </p>
      <h1 className="mb-2 text-xl font-medium tracking-[0.22em] text-ink">
        易经占卜
      </h1>
      <p className="mb-7 text-[12px] tracking-[0.1em] text-ink-soft">
        心诚则灵 · 每日免费一次
      </p>

      {/* 仪式画面区 */}
      <div
        className={`yx-rice-paper relative mx-auto mb-6 overflow-hidden rounded-sm border transition-shadow duration-1000 ${
          ritualActive
            ? "border-[#c4a050]/40 shadow-[0_0_60px_rgba(180,140,60,0.1)]"
            : "border-[#d5c9b0] shadow-[0_4px_24px_rgba(44,36,22,0.06)] hover:border-[#c4a050]/50 hover:shadow-[0_4px_32px_rgba(44,36,22,0.1)]"
        }`}
        style={{ aspectRatio: "1 / 1" }}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
          style={{ display: "block" }}
        />

        {/* 阶段标签 */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#f6f1e6] via-[#f6f1e6]/80 to-transparent pb-4 pt-14 text-center">
          <div
            key={phase}
            className="text-[11px] tracking-[0.25em] text-[#8B7355]"
            style={{ animation: "yx-fade-up 0.5s ease both" }}
          >
            {phaseLabels[phase]}
          </div>
          <div className="mt-1.5 text-[11px] tracking-[0.12em] text-ink-fade">
            {ritualActive || isCasting
              ? "请保持专注，六爻正在成象"
              : "默想问题，点击画面或下方按钮开始"}
          </div>
        </div>

        {/* 点击区域：idle 时点击画面起卦 */}
        {!ritualActive && (
          <button
            type="button"
            onClick={startRitual}
            disabled={isCasting}
            className="absolute inset-0 cursor-pointer"
            aria-label="点击开始起卦"
          />
        )}
      </div>

      {/* 问题输入 */}
      <textarea
        value={question}
        onChange={(event) => setQuestion(event.target.value)}
        placeholder="默想你的问题，可不填"
        rows={3}
        className="mb-6 w-full resize-none rounded-sm border border-divider bg-white p-4 text-sm text-ink outline-none transition placeholder:text-ink-fade focus:border-ink dark:bg-card dark:text-paper"
      />

      {/* 起卦按钮 */}
      <Button
        onClick={startRitual}
        disabled={ritualActive || isCasting}
        className="w-full"
      >
        {ritualActive || isCasting ? "起卦中" : "开始起卦"}
      </Button>
    </div>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/iching/IchingCast.tsx
git commit -m "feat: 重写易经起卦组件为宣纸水墨 Canvas 动画
"
```

---

### Task 5: 验证

- [ ] **Step 1: 类型检查**

```bash
npx tsc --noEmit
```
Expected: 无错误

- [ ] **Step 2: 运行现有测试**

```bash
npx vitest run
```
Expected: 全部通过

- [ ] **Step 3: 启动开发服务器手动验证**

```bash
npx next dev --turbo --hostname 127.0.0.1 --port 3000
```

访问 `http://127.0.0.1:3000/iching`，验证：
- 页面加载正常，看到宣纸背景 + 太极暗纹
- 点击画面触发起卦仪式
- 墨滴落下 → 墨晕扩散 → 三钱依次落下 → 爻线逐层生长 → 卦象完成
- 完成后跳转到结果页面

- [ ] **Step 4: 提交（如有修复）**

```bash
git add -A
git commit -m "fix: 起卦动画细节修复
"
```
