"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  type RitualPhase,
  renderFrame,
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

const TOTAL_DURATION = 4300;

export function IchingCast({ onCast, isCasting }: { onCast: (question: string) => void; isCasting: boolean }) {
  const [question, setQuestion] = useState("");
  const [phase, setPhase] = useState<RitualPhase>("idle");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const questionRef = useRef("");
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 });

  useEffect(() => {
    questionRef.current = question;
  }, [question]);

  const ritualActive = phase !== "idle";

  // 绘制一帧（统一处理 DPR 缩放）
  const drawFrame = useCallback((phase: RitualPhase, elapsedInPhase: number, totalElapsed: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { w, h, dpr } = sizeRef.current;

    ctx.save();
    ctx.scale(dpr, dpr);
    renderFrame(ctx, {
      phase,
      elapsedInPhase,
      totalElapsed,
      width: w,
      height: h,
    });
    ctx.restore();
  }, []);

  // 动画循环
  useEffect(() => {
    if (!ritualActive) {
      drawFrame("idle", 0, 0);
      return;
    }

    startTimeRef.current = performance.now();

    const tick = (now: number) => {
      const totalElapsed = now - startTimeRef.current;

      // 确定当前阶段
      let currentPhase: RitualPhase = "done";
      let phaseStart = TOTAL_DURATION;
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
      }

      if (totalElapsed >= 3800) {
        currentPhase = "done";
        phaseStart = 3800;
      }

      const elapsedInPhase = totalElapsed - phaseStart;

      // 更新阶段状态
      setPhase((prev) => (prev !== currentPhase ? currentPhase : prev));

      drawFrame(currentPhase, elapsedInPhase, totalElapsed);

      if (totalElapsed < TOTAL_DURATION) {
        animFrameRef.current = requestAnimationFrame(tick);
      } else {
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

    const updateSize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      sizeRef.current = { w: rect.width, h: rect.height, dpr };
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      // 重绘 idle 帧
      if (!ritualActive) {
        drawFrame("idle", 0, 0);
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [ritualActive, drawFrame]);

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

      {/* 仪式画面区 — 桌面透视 */}
      <div
        className={`yx-rice-paper relative mx-auto mb-6 overflow-hidden rounded-sm border transition-all duration-1000 ${
          ritualActive
            ? "border-[#c4a050]/40 shadow-[0_4px_20px_rgba(44,36,22,0.12),0_0_80px_rgba(180,140,60,0.1)]"
            : "border-[#d5c9b0] shadow-[0_2px_12px_rgba(44,36,22,0.08),0_8px_32px_rgba(44,36,22,0.04)] hover:border-[#c4a050]/50 hover:shadow-[0_4px_20px_rgba(44,36,22,0.12),0_12px_40px_rgba(44,36,22,0.06)]"
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

        {/* 点击区域 */}
        {!ritualActive && !isCasting && (
          <button
            type="button"
            onClick={startRitual}
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
