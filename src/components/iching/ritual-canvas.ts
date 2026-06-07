// 宣纸水墨仪式的 Canvas 绘制函数（纯函数，无副作用）

export type RitualPhase = "idle" | "breath" | "cloud" | "coins" | "seal" | "done";

// ---- 常量 ----

const INK_COLOR = "#1a1510";
const PAPER_BG = "#f6f1e6";
const COIN_COLOR = "#8B7355";
const COIN_RIM = "#6B5740";

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
  progress: number,
) {
  const dropY = y - 60 + progress * 60;
  const dropR = 2 + progress * 2;

  ctx.fillStyle = INK_COLOR;
  ctx.beginPath();
  ctx.arc(x, dropY, dropR, 0, Math.PI * 2);
  ctx.fill();
}

export function drawInkDiffusion(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  progress: number,
) {
  const maxR = 160;
  const r = maxR * Math.min(progress, 1);

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

  // 简化的字痕
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

/** 在落点绘制墨迹迸溅粒子（确定性种子避免闪烁） */
export function drawInkSplash(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  intensity: number,
  seed: number = 0,
) {
  const count = Math.floor(intensity * 12);
  for (let i = 0; i < count; i++) {
    const a = ((seed * 137 + i * 53) % 360) * (Math.PI / 180);
    const d = intensity * 18 * ((seed * 73 + i * 47) % 100) / 100;
    const px = cx + Math.cos(a) * d;
    const py = cy + Math.sin(a) * d;
    const pr = 0.5 + ((seed * 211 + i * 97) % 100) / 66;
    const alphaBase = 0.3 + ((seed * 37 + i * 59) % 100) / 250;
    ctx.fillStyle = `rgba(26,21,16,${alphaBase})`;
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
    const gap = len * 0.12;
    const segLen = (len - gap) / 2;
    drawBrushSegment(ctx, x1, y1, x1 + dx * (segLen / len), y1 + dy * (segLen / len), progress, len / 2);
    drawBrushSegment(ctx, x2 - dx * (segLen / len), y2 - dy * (segLen / len), x2, y2, Math.max(0, progress - 0.5) * 2, len / 2);
  } else {
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
  const midY = (y1 + y2) / 2 - 2.5;

  ctx.save();
  ctx.strokeStyle = INK_COLOR;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // 主笔触
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.quadraticCurveTo(midX, midY, x2, y2);
  ctx.setLineDash([totalLen * progress, totalLen]);
  ctx.lineDashOffset = 0;
  ctx.stroke();

  // 枯笔飞白
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
  const alpha = Math.sin(progress * Math.PI) * 0.12;
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
  elapsedInPhase: number;
  totalElapsed: number;
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
      { x: w / 2 - spacing, delay: 0, seed: 1 },
      { x: w / 2, delay: 0.25, seed: 2 },
      { x: w / 2 + spacing, delay: 0.5, seed: 3 },
    ];
    for (const c of coins) {
      const cp = clamp((coinProgress - c.delay) / 0.33, 0, 1);
      if (cp <= 0) continue;
      const eased = easeOutBounce(cp);
      const drawY = coinY - 80 + eased * 80;
      const rot = eased * Math.PI * 3;
      drawCoin(ctx, c.x, drawY, rot, 1);
      if (cp > 0.85) {
        drawInkSplash(ctx, c.x, coinY, (cp - 0.85) / 0.15, c.seed);
      }
    }
  }

  // 阶段 3-5：爻线
  if (phase === "coins" || phase === "seal" || phase === "done") {
    let linesToDraw = 0;
    if (phase === "coins") linesToDraw = 1;
    else if (phase === "seal") linesToDraw = 1 + clamp(elapsedInPhase / 1040, 0, 1) * 5;
    else linesToDraw = 6;

    drawYaoLinesStack(ctx, w, h, Math.floor(linesToDraw), Math.min(linesToDraw % 1, 0.999));
  }

  // 完成微光
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
  const yaoPattern = [false, true, false, true, true, false];

  for (let i = 0; i < fullLines; i++) {
    const y = baseY - i * spacing;
    drawYaoLine(ctx, (w - lineW) / 2, y, (w + lineW) / 2, y, 1, yaoPattern[i] ?? false);
  }

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
