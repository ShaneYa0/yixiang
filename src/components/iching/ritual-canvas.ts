// 宣纸水墨仪式的 Canvas 绘制函数 — 斜二测投影（cabinet oblique）

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

// ---- 斜二测投影 ----
//
//   X 轴：水平右，1:1
//   Y 轴：深度方向，屏幕垂直向上，0.5:1
//   Z 轴：垂直上，1:1
//
//   screen_x = wx
//   screen_y = baseY - (wy × 0.5 + wz)
//
//   水平面上的圆 → 竖椭圆，rx:r, ry:r×0.5

const Y_SCALE = 0.5;

/** 世界 3D → 屏幕 2D
 *  wy 越大 → screen_y 越小（越靠上，远处）
 *  wz 越大 → screen_y 越小（越靠上，悬空）
 */
function obl(wx: number, wy: number, wz: number, h: number): { x: number; y: number } {
  const baseY = h * 0.62; // 桌面基准线
  return {
    x: wx,
    y: baseY - (wy * Y_SCALE + wz),
  };
}

/** 桌面绘图变换：正圆 → 竖椭圆（rx 不变，ry 压缩到 0.5） */
function deskTransform(ctx: CanvasRenderingContext2D, ox: number = 0, oy: number = 0) {
  ctx.transform(1, 0, 0, Y_SCALE, ox, oy);
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

  // 桌面深度渐变
  const depth = ctx.createLinearGradient(0, 0, 0, h);
  depth.addColorStop(0, "rgba(0,0,0,0.08)");
  depth.addColorStop(0.3, "rgba(0,0,0,0.02)");
  depth.addColorStop(0.65, "rgba(0,0,0,0)");
  depth.addColorStop(1, "rgba(0,0,0,0.06)");
  ctx.fillStyle = depth;
  ctx.fillRect(0, 0, w, h);

  // 斜二测桌面参考线（极淡）
  ctx.strokeStyle = "rgba(160, 140, 110, 0.04)";
  ctx.lineWidth = 0.5;
  const step = h / 6;
  for (let i = 1; i < 6; i++) {
    const y = step * i;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // 太极水印（斜二测椭圆）
  drawTaijiObl(ctx, w, h);
}

function drawTaijiObl(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const p = obl(w / 2, h * 0.12, 0, h);
  const r = Math.min(w, h) * 0.16;

  ctx.save();
  ctx.globalAlpha = 0.04;
  ctx.strokeStyle = INK_COLOR;
  ctx.lineWidth = 0.8;

  // 斜二测变换后画圆 = 桌面上的正确椭圆
  ctx.save();
  deskTransform(ctx, p.x, p.y);
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.stroke();
  // S 曲线
  ctx.beginPath();
  ctx.arc(0, -r / 2, r / 2, Math.PI * 0.5, Math.PI * 1.5);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, r / 2, r / 2, -Math.PI * 0.5, Math.PI * 0.5);
  ctx.stroke();
  // 两个小圆点
  ctx.beginPath();
  ctx.arc(0, -r / 2, r * 0.1, 0, Math.PI * 2);
  ctx.arc(0, r / 2, r * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.restore();
}

// ---- 爻位虚线 ----

export function drawYaoPlaceholders(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  activeCount: number,
) {
  const lineW = w * 0.48;
  const spacing = h * 0.09;
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

// ---- 墨滴（斜二测下落） ----

export function drawInkDrop(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  progress: number,
  h: number,
) {
  const wz = 180 * (1 - progress);
  const p = obl(x, y, wz, h);
  const dropR = 3 + progress * 6; // 下落中变大

  ctx.save();
  ctx.translate(p.x, p.y);
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
  h: number,
) {
  const maxR = 180;
  const r = maxR * Math.min(progress, 1);
  const p = obl(cx, cy, 0, h);

  const layers = [
    { r, inner: "rgba(26,21,16,0.38)", outer: "rgba(26,21,16,0)" },
    { r: r * 0.55, inner: "rgba(20,16,12,0.45)", outer: "rgba(20,16,12,0.02)" },
    { r: r * 0.22, inner: "rgba(15,12,9,0.55)", outer: "rgba(15,12,9,0.05)" },
  ];

  for (const layer of layers) {
    ctx.save();
    deskTransform(ctx, p.x, p.y);

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

// ---- 铜钱阴影 ----

function drawCoinShadow(
  ctx: CanvasRenderingContext2D,
  wx: number, wy: number,
  heightAbove: number,
  h: number,
) {
  if (heightAbove <= 4) return;
  const maxH = 160;
  const t = Math.min(heightAbove / maxH, 1);
  const p = obl(wx, wy, 0, h);

  const alpha = 0.25 * t;
  const blur = 3 + t * 24;
  const r = 20 + t * 16;

  for (let i = 3; i >= 0; i--) {
    const a = alpha / 4 * (1 + i * 0.5);
    const b = blur * ((i + 1) / 4);
    ctx.fillStyle = `rgba(0,0,0,${a})`;
    ctx.beginPath();
    ctx.save();
    deskTransform(ctx, p.x, p.y);
    ctx.arc(0, 0, r + b, 0, Math.PI * 2); // deskTransform 自动变椭圆
    ctx.fill();
    ctx.restore();
  }
}

// ---- 3D 铜钱 ----

/** 画铜钱的币面细节（圆心在原点） */
function drawCoinFace(ctx: CanvasRenderingContext2D, size: number, visibility: number) {
  const innerR = 10;
  const hole = 4;
  const faceA = 0.2 + visibility * 0.8;

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

  if (visibility > 0.35) {
    const iv = (visibility - 0.35) / 0.65;
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
}

function drawCoin3D(
  ctx: CanvasRenderingContext2D,
  wx: number, wy: number, wz: number,
  rotation: number,
  flatness: number,
  h: number,
) {
  const size = 22;
  const p = obl(wx, wy, wz, h);
  const p0 = obl(wx, wy, 0, h);

  // flatness 0→1：空中侧立 → 平贴桌面
  // 空中：在屏幕空间画圆（有钱币自身的 3D 旋转）
  // 桌面：在 deskTransform 空间画圆（自动变成斜二测椭圆）

  if (flatness > 0.65) {
    // 接近桌面 → 斜二测椭圆
    const t = (flatness - 0.65) / 0.35;
    const sx = p.x + (p0.x - p.x) * t;
    const sy = p.y + (p0.y - p.y) * t;
    const vis = flatness;

    ctx.save();
    deskTransform(ctx, sx, sy);
    // 残留旋转随 flatness 淡出
    ctx.rotate(rotation * (1 - t));
    drawCoinFace(ctx, size, vis);

    // 厚度边（在空中→桌面过渡时还可见一点）
    if (t < 0.6) {
      const ev = 1 - t / 0.6;
      ctx.strokeStyle = COIN_EDGE;
      ctx.lineWidth = 4 * ev;
      ctx.beginPath();
      ctx.arc(0, 0, size, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  } else {
    // 空中：画在屏幕坐标，有钱币自身旋转
    ctx.save();
    ctx.translate(p.x, p.y);
    const sqY = 0.06 + flatness * 0.94;
    ctx.scale(1, sqY);
    ctx.rotate(rotation);

    // 边缘厚度
    if (flatness < 0.80) {
      const ev = 1 - flatness / 0.80;
      ctx.strokeStyle = COIN_EDGE;
      ctx.lineWidth = 5 * ev;
      ctx.beginPath();
      ctx.arc(0, 0, size, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = `rgba(210, 180, 130, ${ev * 0.55})`;
      ctx.lineWidth = 1.8 * ev;
      ctx.beginPath();
      ctx.arc(0, 0, size - 2, -0.2, Math.PI * 0.75);
      ctx.stroke();
    }

    drawCoinFace(ctx, size, flatness);
    ctx.restore();
  }
}

// ---- 墨迹迸溅（斜二测桌面） ----

export function drawInkSplash(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  intensity: number,
  h: number,
  seed: number = 0,
) {
  const p = obl(cx, cy, 0, h);
  const count = Math.floor(intensity * 14);

  ctx.save();
  deskTransform(ctx, p.x, p.y);

  for (let i = 0; i < count; i++) {
    const a = ((seed * 137 + i * 53) % 360) * (Math.PI / 180);
    const d = intensity * 24 * ((seed * 73 + i * 47) % 100) / 100;
    const px = Math.cos(a) * d;
    const py = Math.sin(a) * d;
    const pr = 0.5 + ((seed * 211 + i * 97) % 100) / 66;
    const alphaBase = 0.3 + ((seed * 37 + i * 59) % 100) / 250;
    ctx.fillStyle = `rgba(26,21,16,${alphaBase})`;
    ctx.beginPath();
    ctx.arc(px, py, pr, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// ---- 爻线 ----

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

  // ---- 墨（画面中上方，在静心问卦之上） ----
  if (phase !== "idle") {
    // wy 越大越靠上（远处），h*0.35 是较远处
    const inkCY = h * 0.35;
    const inkCX = w * 0.5;

    let inkProgress = 0;
    if (phase === "breath") inkProgress = clamp(elapsedInPhase / 760, 0, 1) * 0.5;
    else if (phase === "cloud") inkProgress = 0.5 + clamp(elapsedInPhase / 940, 0, 1) * 0.35;
    else inkProgress = 0.85;

    if (inkProgress > 0) {
      drawInkDiffusion(ctx, inkCX, inkCY, inkProgress, h);
    }

    if (phase === "breath") {
      drawInkDrop(ctx, inkCX, inkCY, clamp(elapsedInPhase / 760, 0, 1), h);
    }
  }

  // ---- 三枚铜钱 ----
  if (phase === "coins" || phase === "seal" || phase === "done") {
    const coinProgress = phase === "coins" ? clamp(elapsedInPhase / 1060, 0, 1) : 1;
    // 铜钱落在墨晕附近
    const coinCY = h * 0.38;

    const spacing = w * 0.10;
    const coinSpecs = [
      { wx: w * 0.5 - spacing, wy: coinCY, delay: 0, seed: 1 },
      { wx: w * 0.5, wy: coinCY, delay: 0.22, seed: 2 },
      { wx: w * 0.5 + spacing, wy: coinCY, delay: 0.44, seed: 3 },
    ];

    for (const c of coinSpecs) {
      const cp = clamp((coinProgress - c.delay) / 0.33, 0, 1);
      if (cp <= 0) continue;

      const eased = easeOutBounce(cp);
      const wz = (1 - eased) * 160;
      const flatness = eased;
      const rot = cp * Math.PI * 2.5;

      drawCoinShadow(ctx, c.wx, c.wy, wz, h);
      drawCoin3D(ctx, c.wx, c.wy, wz, rot, flatness, h);

      if (cp > 0.82) {
        drawInkSplash(ctx, c.wx, c.wy, (cp - 0.82) / 0.18, h, c.seed);
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
  const baseY = h * 0.68;
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
