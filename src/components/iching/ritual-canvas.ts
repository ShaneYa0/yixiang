// 宣纸水墨仪式的 Canvas 绘制函数 — 透视桌面

export type RitualPhase = "idle" | "breath" | "cloud" | "coins" | "seal" | "done";

// ---- 常量 ----

const INK_COLOR = "#1a1510";
const PAPER_BG = "#f6f1e6";
const COIN_FACE = "#C4A265";
const COIN_EDGE = "#8B6914";
const COIN_RIM = "#7A5C12";

/** 每阶段激活的爻位线数 */
export const ACTIVE_LINES: Record<RitualPhase, number> = {
  idle: 0, breath: 1, cloud: 2, coins: 4, seal: 6, done: 6,
};

// ---- 透视引擎 ----

/**
 * 桌面透视：Y 越大（越靠近屏幕下方）= 离观察者越近 = 物体越大
 * top (y=0)     → depth = MAX_DEPTH → scale ≈ 0.45
 * bottom (y=h)  → depth = 0         → scale = 1.0
 */
const MAX_DEPTH = 250;
const FOCAL = 320;

/** 屏幕 Y → 透视缩放因子 */
function pScale(y: number, h: number): number {
  const depth = (y / h) * MAX_DEPTH;
  return FOCAL / (FOCAL + depth);
}

/** 在透视平面上画椭圆（Y 轴压缩以匹配透视） */
function pEllipse(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  rx: number, ry: number,
  h: number,
) {
  const s = pScale(cy, h);
  const sy = ry * s;
  ctx.ellipse(cx, cy, rx * s, sy, 0, 0, Math.PI * 2);
}

// ---- 宣纸桌面背景 ----

export function drawPaperBg(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // 底色
  ctx.fillStyle = PAPER_BG;
  ctx.fillRect(0, 0, w, h);

  // 纸纤维肌理
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

  // 桌面深度渐变：远处深、近处亮（水平面光照）
  const depth = ctx.createLinearGradient(0, 0, 0, h);
  depth.addColorStop(0, "rgba(0,0,0,0.10)");
  depth.addColorStop(0.15, "rgba(0,0,0,0.06)");
  depth.addColorStop(0.40, "rgba(0,0,0,0.015)");
  depth.addColorStop(0.75, "rgba(0,0,0,0)");
  depth.addColorStop(1, "rgba(0,0,0,0.03)");
  ctx.fillStyle = depth;
  ctx.fillRect(0, 0, w, h);

  // 桌沿阴影（底部）— 强调"这是桌子的近边"
  const edge = ctx.createLinearGradient(0, h * 0.85, 0, h);
  edge.addColorStop(0, "rgba(0,0,0,0)");
  edge.addColorStop(0.5, "rgba(0,0,0,0.04)");
  edge.addColorStop(1, "rgba(0,0,0,0.12)");
  ctx.fillStyle = edge;
  ctx.fillRect(0, h * 0.85, w, h * 0.15);

  // 透视参考线（极淡，暗示水平面的延伸方向）
  ctx.strokeStyle = "rgba(160, 140, 110, 0.06)";
  ctx.lineWidth = 0.5;
  const vpX = w * 0.5;
  const vpY = h * (-0.35); // 消失点在画面上方
  for (let i = 1; i <= 5; i++) {
    const baseX = w * (i / 6);
    ctx.beginPath();
    ctx.moveTo(baseX, h);
    ctx.lineTo(vpX + (baseX - vpX) * 0.15, vpY + (h - vpY) * 0.15);
    ctx.stroke();
  }

  // 太极水印（带透视缩放）
  drawTaijiPersp(ctx, w, h);
}

function drawTaijiPersp(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const cx = w / 2;
  const cy = h * 0.40;
  const s = pScale(cy, h);
  const r = Math.min(w, h) * 0.16 * s;

  ctx.save();
  ctx.globalAlpha = 0.04;
  ctx.strokeStyle = INK_COLOR;
  ctx.lineWidth = 0.8;

  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy - r / 2, r / 2, Math.PI * 0.5, Math.PI * 1.5);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy + r / 2, r / 2, -Math.PI * 0.5, Math.PI * 0.5);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy - r / 2, r * 0.1, 0, Math.PI * 2);
  ctx.arc(cx, cy + r / 2, r * 0.1, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// ---- 爻位虚线（带透视） ----

export function drawYaoPlaceholders(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  activeCount: number,
) {
  const lineW = w * 0.42;
  const baseY = h * 0.66;

  for (let i = 0; i < 6; i++) {
    const worldY = baseY - i * (h * 0.09); // Y 位置
    const s = pScale(worldY, h);
    const y = worldY;
    const ww = lineW * s;
    const lw = 0.8 * s;
    const alpha = (i < activeCount ? 0.18 + i * 0.02 : 0.05);

    ctx.strokeStyle = `rgba(26, 21, 16, ${alpha})`;
    ctx.lineWidth = lw;
    ctx.setLineDash([4 * s, 10 * s]);
    ctx.beginPath();
    ctx.moveTo((w - ww) / 2, y);
    ctx.lineTo((w + ww) / 2, y);
    ctx.stroke();
  }
  ctx.setLineDash([]);
}

// ---- 墨滴（从空中落到桌面） ----

export function drawInkDrop(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  progress: number,
  h: number,
) {
  // progress 0→1：墨滴从空中落到桌面
  const airHeight = 200; // 空中高度（世界单位）
  const zAbove = airHeight * (1 - progress); // 当前离桌面高度
  const screenY = y - zAbove * 0.35; // 高度映射到屏幕 Y
  const s = pScale(screenY, h);
  const r = (1.5 + progress * 4) * s;

  // 下落中的墨滴（球形，略扁）
  const squash = 0.5 + progress * 0.5;
  ctx.save();
  ctx.translate(x, screenY);
  ctx.scale(1, squash);
  ctx.fillStyle = INK_COLOR;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawInkDiffusion(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  progress: number,
  h: number,
) {
  const s = pScale(cy, h);
  const maxR = 150 * s;
  const r = maxR * Math.min(progress, 1);
  const rx = r;
  const ry = r * 0.75; // 透视椭圆

  const layers = [
    { r: r, inner: "rgba(26,21,16,0.40)", outer: "rgba(26,21,16,0)" },
    { r: r * 0.55, inner: "rgba(20,16,12,0.48)", outer: "rgba(20,16,12,0.02)" },
    { r: r * 0.22, inner: "rgba(15,12,9,0.58)", outer: "rgba(15,12,9,0.05)" },
  ];

  for (const layer of layers) {
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, layer.r);
    grad.addColorStop(0, layer.inner);
    grad.addColorStop(0.65, layer.outer.replace("0)", "0.10)"));
    grad.addColorStop(1, layer.outer);

    ctx.fillStyle = grad;
    ctx.beginPath();
    const points = 48;
    for (let i = 0; i < points; i++) {
      const angle = (i / points) * Math.PI * 2;
      const noise = 1 + Math.sin(i * 7.3 + 1.8) * 0.08 + Math.cos(i * 11.7 + 3.1) * 0.05;
      const pr = layer.r * noise;
      const px = cx + Math.cos(angle) * pr * (rx / r);
      const py = cy + Math.sin(angle) * pr * (ry / r);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }
}

// ---- 铜钱阴影 ----

function drawCoinShadow(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  heightAbove: number,
  h: number,
) {
  if (heightAbove <= 2) return;
  const maxH = 140;
  const t = Math.min(heightAbove / maxH, 1);
  const s = pScale(y, h);
  const alpha = 0.30 * t;
  const blur = (3 + t * 20) * s;
  const offsetY = (2 + t * 16) * s;
  const sx = (18 + t * 12) * s;
  const sy = (6 + t * 6) * s * 0.75;

  for (let i = 3; i >= 0; i--) {
    const a = alpha / 4 * (1 + i * 0.5);
    const b = blur * ((i + 1) / 4);
    ctx.fillStyle = `rgba(0,0,0,${a})`;
    ctx.beginPath();
    ctx.ellipse(x, y + offsetY, sx + b, sy + b * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ---- 3D 铜钱（带透视缩放） ----

function drawCoin3D(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  rotation: number,
  flatness: number,
  h: number,
) {
  const s = pScale(y, h);
  const size = 22 * s;
  const innerR = 10 * s;
  const hole = 4 * s;

  ctx.save();
  ctx.translate(x, y);

  // 旋转 + 扁平度
  const sqY = 0.06 + flatness * 0.94;
  ctx.scale(1, sqY);
  ctx.rotate(rotation);

  // ---- 边缘厚度（侧立时可见） ----
  if (flatness < 0.80) {
    const ev = 1 - flatness / 0.80;
    ctx.strokeStyle = COIN_EDGE;
    ctx.lineWidth = 5 * ev * s;
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.stroke();

    // 边缘高光弧
    ctx.strokeStyle = `rgba(210, 180, 130, ${ev * 0.55})`;
    ctx.lineWidth = 1.8 * ev * s;
    ctx.beginPath();
    ctx.arc(0, 0, size - 2 * s, -0.2, Math.PI * 0.75);
    ctx.stroke();
  }

  // ---- 币面 ----
  const faceA = 0.2 + flatness * 0.8;
  ctx.fillStyle = COIN_FACE;
  ctx.globalAlpha = faceA;
  ctx.beginPath();
  ctx.arc(0, 0, size, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = COIN_RIM;
  ctx.lineWidth = 1.3 * s;
  ctx.beginPath();
  ctx.arc(0, 0, size, 0, Math.PI * 2);
  ctx.stroke();

  // ---- 内圈 & 方孔（足够平时可见） ----
  if (flatness > 0.35) {
    const iv = (flatness - 0.35) / 0.65;
    ctx.globalAlpha = faceA * iv;

    ctx.strokeStyle = `rgba(100, 75, 35, ${0.7 * iv})`;
    ctx.lineWidth = 0.8 * s;
    ctx.beginPath();
    ctx.arc(0, 0, innerR, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = PAPER_BG;
    ctx.beginPath();
    ctx.rect(-hole, -hole, hole * 2, hole * 2);
    ctx.fill();

    ctx.strokeStyle = `rgba(100, 75, 35, ${0.3 * iv})`;
    ctx.lineWidth = 0.5 * s;
    ctx.stroke();

    // 字痕
    ctx.strokeStyle = `rgba(90, 72, 50, ${0.35 * iv})`;
    ctx.lineWidth = 0.5 * s;
    for (const a of [0, Math.PI / 2, Math.PI, Math.PI * 1.5]) {
      const mx = Math.cos(a) * (innerR + 3.5 * s);
      const my = Math.sin(a) * (innerR + 3.5 * s);
      ctx.beginPath();
      ctx.moveTo(mx - 2.5 * s, my);
      ctx.lineTo(mx + 2.5 * s, my);
      ctx.stroke();
    }
  }

  ctx.globalAlpha = 1;
  ctx.restore();
}

// ---- 墨迹迸溅 ----

export function drawInkSplash(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  intensity: number,
  h: number,
  seed: number = 0,
) {
  const s = pScale(cy, h);
  const count = Math.floor(intensity * 14);
  for (let i = 0; i < count; i++) {
    const a = ((seed * 137 + i * 53) % 360) * (Math.PI / 180);
    const d = intensity * 22 * s * ((seed * 73 + i * 47) % 100) / 100;
    const px = cx + Math.cos(a) * d;
    const py = cy + Math.sin(a) * d * 0.55;
    const pr = (0.5 + ((seed * 211 + i * 97) % 100) / 66) * s;
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

  // ---- 阶段 1+：墨 ----
  if (phase !== "idle") {
    const inkY = h * 0.46;
    let inkProgress = 0;
    if (phase === "breath") inkProgress = clamp(elapsedInPhase / 760, 0, 1) * 0.5;
    else if (phase === "cloud") inkProgress = 0.5 + clamp(elapsedInPhase / 940, 0, 1) * 0.35;
    else inkProgress = 0.85;

    if (inkProgress > 0) {
      drawInkDiffusion(ctx, w / 2, inkY, inkProgress, h);
    }

    if (phase === "breath") {
      drawInkDrop(ctx, w / 2, inkY, clamp(elapsedInPhase / 760, 0, 1), h);
    }
  }

  // ---- 阶段 3+：三枚铜钱 ----
  if (phase === "coins" || phase === "seal" || phase === "done") {
    const coinProgress = phase === "coins" ? clamp(elapsedInPhase / 1060, 0, 1) : 1;
    const surfaceY = h * 0.54;
    const spacing = w * 0.12;

    const coins = [
      { x: w / 2 - spacing, delay: 0, seed: 1 },
      { x: w / 2, delay: 0.22, seed: 2 },
      { x: w / 2 + spacing, delay: 0.44, seed: 3 },
    ];

    for (const c of coins) {
      const cp = clamp((coinProgress - c.delay) / 0.33, 0, 1);
      if (cp <= 0) continue;

      const eased = easeOutBounce(cp);
      const heightAbove = (1 - eased) * 140;
      const flatness = eased;
      const drawY = surfaceY - heightAbove * 0.38;
      const rot = cp * Math.PI * 2.5;

      drawCoinShadow(ctx, c.x, surfaceY, heightAbove, h);
      drawCoin3D(ctx, c.x, drawY, rot, flatness, h);

      if (cp > 0.82) {
        drawInkSplash(ctx, c.x, surfaceY, (cp - 0.82) / 0.18, h, c.seed);
      }
    }
  }

  // ---- 阶段 3-5：爻线 ----
  if (phase === "coins" || phase === "seal" || phase === "done") {
    let linesToDraw = 0;
    if (phase === "coins") linesToDraw = 1;
    else if (phase === "seal") linesToDraw = 1 + clamp(elapsedInPhase / 1040, 0, 1) * 5;
    else linesToDraw = 6;

    drawYaoLinesStack(ctx, w, h, Math.floor(linesToDraw), Math.min(linesToDraw % 1, 0.999));
  }

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
  const baseY = h * 0.66;
  const yaoPattern = [false, true, false, true, true, false];

  for (let i = 0; i < fullLines; i++) {
    const y = baseY - i * (h * 0.09);
    const s = pScale(y, h);
    const lw = w * 0.42 * s;
    drawYaoLine(ctx, (w - lw) / 2, y, (w + lw) / 2, y, 1, yaoPattern[i] ?? false);
  }

  if (partialProgress > 0 && fullLines < 6) {
    const i = fullLines;
    const y = baseY - i * (h * 0.09);
    const s = pScale(y, h);
    const lw = w * 0.42 * s;
    drawYaoLine(ctx, (w - lw) / 2, y, (w + lw) / 2, y, partialProgress, yaoPattern[i] ?? false);
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
