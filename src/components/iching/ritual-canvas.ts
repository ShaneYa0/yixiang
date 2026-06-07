// 宣纸水墨仪式的 Canvas 绘制函数 — 45° 等距投影

export type RitualPhase = "idle" | "breath" | "cloud" | "coins" | "seal" | "done";

// ---- 常量 ----

const INK_COLOR = "#1a1510";
const PAPER_BG = "#f6f1e6";
const COIN_FACE = "#C4A265";
const COIN_EDGE = "#8B6914";
const COIN_RIM = "#7A5C12";

/** 45° 等距投影：水平面上的圆 → 椭圆，ry = rx × SQUASH */
const SQUASH = Math.cos(Math.PI / 4); // ≈ 0.707

/** 每阶段激活的爻位线数 */
export const ACTIVE_LINES: Record<RitualPhase, number> = {
  idle: 0, breath: 1, cloud: 2, coins: 4, seal: 6, done: 6,
};

// ---- 投影工具 ----

/** 世界 3D → 屏幕 2D（等距投影，45° 俯角）
 *  wx = 水平方向（屏幕 X）
 *  wy = 深度方向（屏幕 Y，远离观察者 = 屏幕上方）
 *  wz = 高度（垂直于水平面，0 = 贴面，正 = 悬空）
 */
function iso(wx: number, wy: number, wz: number): { x: number; y: number } {
  return {
    x: wx,
    y: wy - wz * SQUASH,
  };
}

/** 在水平面上画椭圆（等距圆） */
function isoEllipse(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  rx: number, ry: number,
) {
  ctx.ellipse(cx, cy, rx, ry * SQUASH, 0, 0, Math.PI * 2);
}

/** 径向渐变适配等距：在 ry 方向压缩 */
function isoRadialGrad(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  r: number,
): CanvasGradient {
  // 径向渐变本身是圆的，需要用 scale 来匹配椭圆视口
  // 直接在椭圆坐标系下创建渐变
  return ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
}

// ---- 宣纸桌面 ----

export function drawPaperBg(ctx: CanvasRenderingContext2D, w: number, h: number) {
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

  // 桌面渐变：远深近淡
  const depth = ctx.createLinearGradient(0, 0, 0, h);
  depth.addColorStop(0, "rgba(0,0,0,0.08)");
  depth.addColorStop(0.25, "rgba(0,0,0,0.02)");
  depth.addColorStop(0.6, "rgba(0,0,0,0)");
  depth.addColorStop(1, "rgba(0,0,0,0.06)");
  ctx.fillStyle = depth;
  ctx.fillRect(0, 0, w, h);

  // 等距参考线（极淡，暗示水平面的空间方向）
  ctx.strokeStyle = "rgba(160, 140, 110, 0.05)";
  ctx.lineWidth = 0.5;
  const step = h / 5;
  for (let i = 1; i < 5; i++) {
    const y = step * i;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // 太极水印（等距椭圆）
  drawTaijiIso(ctx, w, h);
}

function drawTaijiIso(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const cx = w / 2;
  const cy = h * 0.38;
  const r = Math.min(w, h) * 0.16;

  ctx.save();
  ctx.globalAlpha = 0.04;
  ctx.strokeStyle = INK_COLOR;
  ctx.lineWidth = 0.8;

  ctx.beginPath();
  isoEllipse(ctx, cx, cy, r, r);
  ctx.stroke();

  // S 曲线
  const ry = r * SQUASH;
  ctx.beginPath();
  ctx.arc(cx, cy - ry / 2, r / 2, Math.PI * 0.5, Math.PI * 1.5);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy + ry / 2, r / 2, -Math.PI * 0.5, Math.PI * 0.5);
  ctx.stroke();

  // 两个小圆点
  ctx.beginPath();
  isoEllipse(ctx, cx, cy - ry / 2, r * 0.1, r * 0.1);
  isoEllipse(ctx, cx, cy + ry / 2, r * 0.1, r * 0.1);
  ctx.fill();

  ctx.restore();
}

// ---- 爻位虚线 ----

export function drawYaoPlaceholders(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  activeCount: number,
) {
  const lineW = w * 0.48;
  const spacing = h * 0.088;
  const baseY = h * 0.66;

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

// ---- 墨滴（从空中落到桌面） ----

export function drawInkDrop(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  progress: number,
) {
  // 墨滴从高度 160 落到 0
  const wz = 160 * (1 - progress);
  const p = iso(x, y, wz);

  // 下落中接近球形，落桌面后变成等距椭圆
  const surfaceRatio = progress;
  const dropR = 2 + progress * 4;

  ctx.save();
  ctx.translate(p.x, p.y);
  // 下落时是圆，触面时逐渐变成椭圆
  const sq = 1 - (1 - SQUASH) * surfaceRatio * 0.6;
  ctx.scale(1, sq);
  ctx.fillStyle = INK_COLOR;
  ctx.beginPath();
  ctx.arc(0, 0, dropR, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawInkDiffusion(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  progress: number,
) {
  const maxR = 140;
  const r = maxR * Math.min(progress, 1);
  const ry = r * SQUASH;

  const layers = [
    { r: r, inner: "rgba(26,21,16,0.40)", outer: "rgba(26,21,16,0)" },
    { r: r * 0.55, inner: "rgba(20,16,12,0.48)", outer: "rgba(20,16,12,0.02)" },
    { r: r * 0.22, inner: "rgba(15,12,9,0.58)", outer: "rgba(15,12,9,0.05)" },
  ];

  for (const layer of layers) {
    // 径向渐变需要适配椭圆：在 scale 过的坐标系中绘制
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(1, SQUASH);

    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, layer.r);
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
      const px = Math.cos(angle) * pr;
      const py = Math.sin(angle) * pr;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

// ---- 铜钱阴影（等距投影到桌面） ----

function drawCoinShadow(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  heightAbove: number,
) {
  if (heightAbove <= 3) return;
  const maxH = 150;
  const t = Math.min(heightAbove / maxH, 1);
  // 阴影在桌面上：等距椭圆，离地越高越模糊越大
  const alpha = 0.28 * t;
  const blur = 3 + t * 22;
  const offsetY = t * 4; // 高处往下落一点影子偏移
  const sx = 20 + t * 14;
  const sy = (20 + t * 14) * SQUASH;

  // 软阴影：多层椭圆
  for (let i = 3; i >= 0; i--) {
    const a = alpha / 4 * (1 + i * 0.5);
    const b = blur * ((i + 1) / 4);
    ctx.fillStyle = `rgba(0,0,0,${a})`;
    ctx.beginPath();
    ctx.ellipse(x, y + offsetY, sx + b, sy + b * SQUASH, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ---- 3D 铜钱 ----

function drawCoin3D(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  rotation: number,
  flatness: number,
) {
  const size = 22;
  const innerR = 10;
  const hole = 4;

  ctx.save();
  ctx.translate(x, y);

  // 扁平度 → Y 轴压缩
  const sqY = 0.06 + flatness * 0.94;
  ctx.scale(1, sqY);
  ctx.rotate(rotation);

  // ---- 边缘厚度（侧立时可见） ----
  if (flatness < 0.80) {
    const ev = 1 - flatness / 0.80;
    ctx.strokeStyle = COIN_EDGE;
    ctx.lineWidth = 5 * ev;
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.stroke();

    // 边缘高光
    ctx.strokeStyle = `rgba(210, 180, 130, ${ev * 0.55})`;
    ctx.lineWidth = 1.8 * ev;
    ctx.beginPath();
    ctx.arc(0, 0, size - 2, -0.2, Math.PI * 0.75);
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
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.arc(0, 0, size, 0, Math.PI * 2);
  ctx.stroke();

  // ---- 内圈 & 方孔 ----
  if (flatness > 0.35) {
    const iv = (flatness - 0.35) / 0.65;
    ctx.globalAlpha = faceA * iv;

    ctx.strokeStyle = `rgba(100, 75, 35, ${0.7 * iv})`;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.arc(0, 0, innerR, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = PAPER_BG;
    ctx.beginPath();
    ctx.rect(-hole, -hole, hole * 2, hole * 2);
    ctx.fill();

    ctx.strokeStyle = `rgba(100, 75, 35, ${0.3 * iv})`;
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // 字痕
    ctx.strokeStyle = `rgba(90, 72, 50, ${0.35 * iv})`;
    ctx.lineWidth = 0.5;
    for (const a of [0, Math.PI / 2, Math.PI, Math.PI * 1.5]) {
      const mx = Math.cos(a) * (innerR + 3.5);
      const my = Math.sin(a) * (innerR + 3.5);
      ctx.beginPath();
      ctx.moveTo(mx - 2.5, my);
      ctx.lineTo(mx + 2.5, my);
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
  seed: number = 0,
) {
  const count = Math.floor(intensity * 14);
  for (let i = 0; i < count; i++) {
    const a = ((seed * 137 + i * 53) % 360) * (Math.PI / 180);
    const d = intensity * 22 * ((seed * 73 + i * 47) % 100) / 100;
    const px = cx + Math.cos(a) * d;
    // 等距桌面上迸溅：Y 方向压缩
    const py = cy + Math.sin(a) * d * SQUASH;
    const pr = 0.5 + ((seed * 211 + i * 97) % 100) / 66;
    const alphaBase = 0.3 + ((seed * 37 + i * 59) % 100) / 250;
    ctx.fillStyle = `rgba(26,21,16,${alphaBase})`;
    ctx.beginPath();
    ctx.ellipse(px, py, pr, pr * SQUASH, 0, 0, Math.PI * 2);
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

  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.quadraticCurveTo(midX, midY, x2, y2);
  ctx.setLineDash([totalLen * progress, totalLen]);
  ctx.lineDashOffset = 0;
  ctx.stroke();

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

  // ---- 墨 ----
  if (phase !== "idle") {
    const inkY = h * 0.46;
    let inkProgress = 0;
    if (phase === "breath") inkProgress = clamp(elapsedInPhase / 760, 0, 1) * 0.5;
    else if (phase === "cloud") inkProgress = 0.5 + clamp(elapsedInPhase / 940, 0, 1) * 0.35;
    else inkProgress = 0.85;

    if (inkProgress > 0) {
      drawInkDiffusion(ctx, w / 2, inkY, inkProgress);
    }

    if (phase === "breath") {
      drawInkDrop(ctx, w / 2, inkY, clamp(elapsedInPhase / 760, 0, 1));
    }
  }

  // ---- 三枚铜钱（等距投影下落） ----
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
      const wz = (1 - eased) * 150; // 高度 150→0
      const flatness = eased;
      const p = iso(c.x, surfaceY, wz);
      const rot = cp * Math.PI * 2.5;

      // 阴影投在桌面
      drawCoinShadow(ctx, c.x, surfaceY, wz);

      // 铜钱
      drawCoin3D(ctx, p.x, p.y, rot, flatness);

      // 落地墨迹
      if (cp > 0.82) {
        drawInkSplash(ctx, c.x, surfaceY, (cp - 0.82) / 0.18, c.seed);
      }
    }
  }

  // ---- 爻线 ----
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
  const lineW = w * 0.48;
  const yaoPattern = [false, true, false, true, true, false];

  for (let i = 0; i < fullLines; i++) {
    const y = baseY - i * (h * 0.088);
    drawYaoLine(ctx, (w - lineW) / 2, y, (w + lineW) / 2, y, 1, yaoPattern[i] ?? false);
  }

  if (partialProgress > 0 && fullLines < 6) {
    const i = fullLines;
    const y = baseY - i * (h * 0.088);
    drawYaoLine(ctx, (w - lineW) / 2, y, (w + lineW) / 2, y, partialProgress, yaoPattern[i] ?? false);
  }
}

// ---- 工具 ----

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
