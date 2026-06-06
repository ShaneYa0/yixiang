"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import type { RitualPhase } from "@/components/iching/IchingRitualScene";

const IchingRitualScene = dynamic(
  () => import("@/components/iching/IchingRitualScene").then((module) => module.IchingRitualScene),
  {
    ssr: false,
    loading: () => <div className="flex h-full items-center justify-center text-[11px] tracking-[0.2em] text-[#d8c29a]">铜炉载入</div>,
  },
);

const phaseLabels: Record<RitualPhase, string> = {
  idle: "静心问卦",
  breath: "炉火初明",
  cloud: "阴阳成旋",
  coins: "铜钱定爻",
  seal: "六爻铸成",
  done: "卦象已成",
};

export function IchingCast({ onCast, isCasting }: { onCast: (question: string) => void; isCasting: boolean }) {
  const [question, setQuestion] = useState("");
  const [phase, setPhase] = useState<RitualPhase>("idle");
  const [startedAt, setStartedAt] = useState(0);
  const questionRef = useRef("");

  useEffect(() => {
    questionRef.current = question;
  }, [question]);

  const ritualActive = phase !== "idle";

  useEffect(() => {
    if (!ritualActive) return;

    const timers = [
      window.setTimeout(() => setPhase("cloud"), 760),
      window.setTimeout(() => setPhase("coins"), 1700),
      window.setTimeout(() => setPhase("seal"), 2760),
      window.setTimeout(() => setPhase("done"), 3800),
      window.setTimeout(() => onCast(questionRef.current), 4300),
    ];

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [onCast, ritualActive]);

  const startRitual = () => {
    if (ritualActive || isCasting) return;
    setStartedAt(performance.now());
    setPhase("breath");
  };

  return (
    <div className="mx-auto max-w-2xl py-8 text-center">
      <h1 className="mb-2 text-sm font-semibold tracking-[0.25em] text-ink">易经占卜</h1>
      <p className="mb-6 text-[12px] tracking-[0.1em] text-ink-soft">心诚则灵 · 每日免费一次</p>

      <div
        className="relative mx-auto mb-7 h-[390px] overflow-hidden border border-divider shadow-[0_24px_80px_rgba(44,36,22,0.14),inset_0_0_90px_rgba(246,208,130,0.12)] sm:h-[450px]"
        style={{
          background:
            "radial-gradient(circle at 50% 34%, rgba(238, 194, 99, 0.28), rgba(56, 38, 22, 0.96) 48%, rgba(20, 17, 14, 0.98) 100%)",
        }}
      >
        <IchingRitualScene phase={phase} startedAt={startedAt} />
        <div className="pointer-events-none absolute inset-x-0 bottom-5 text-center">
          <div className="text-[10px] tracking-[0.24em] text-[#e7c77d]">{phaseLabels[phase]}</div>
          <div className="mt-2 text-xs tracking-[0.16em] text-[#d8c29a]">
            {ritualActive || isCasting ? "铜炉开卦，六爻将成" : "默想问题，点击后完成起卦仪式"}
          </div>
        </div>
      </div>

      <textarea
        value={question}
        onChange={(event) => setQuestion(event.target.value)}
        placeholder="默想你的问题，可不填"
        rows={3}
        className="mb-6 w-full resize-none border border-divider bg-white p-4 text-sm text-ink outline-none placeholder:text-ink-fade focus:border-ink dark:bg-card dark:text-paper"
      />
      <Button onClick={startRitual} disabled={ritualActive || isCasting} className="w-full">
        {ritualActive || isCasting ? "起卦中" : "开始起卦"}
      </Button>
    </div>
  );
}
