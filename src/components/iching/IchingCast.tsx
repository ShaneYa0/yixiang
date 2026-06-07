"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";

type RitualPhase = "idle" | "breath" | "cloud" | "coins" | "seal" | "done";

const phaseLabels: Record<RitualPhase, string> = {
  idle: "静心问卦",
  breath: "一念初定",
  cloud: "阴阳成旋",
  coins: "三钱定爻",
  seal: "六爻成象",
  done: "卦象已成",
};

const activeLineCount: Record<RitualPhase, number> = {
  idle: 0,
  breath: 1,
  cloud: 2,
  coins: 4,
  seal: 6,
  done: 6,
};

const yaoPattern = [false, true, false, true, true, false];

export function IchingCast({ onCast, isCasting }: { onCast: (question: string) => void; isCasting: boolean }) {
  const [question, setQuestion] = useState("");
  const [phase, setPhase] = useState<RitualPhase>("idle");
  const questionRef = useRef("");
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    questionRef.current = question;
  }, [question]);

  const ritualActive = phase !== "idle";

  useEffect(() => {
    if (!ritualActive) return;

    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
      video.playbackRate = 1.2;
      void video.play();
    }

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
    setPhase("breath");
  };

  return (
    <div className="mx-auto max-w-2xl py-8 text-center">
      <p className="mb-2 text-[10px] font-semibold tracking-[0.3em] text-ink-fade">一念起 · 六爻成</p>
      <h1 className="mb-2 text-xl font-medium tracking-[0.22em] text-ink">易经占卜</h1>
      <p className="mb-7 text-[12px] tracking-[0.1em] text-ink-soft">心诚则灵 · 每日免费一次</p>

      <button
        type="button"
        onClick={startRitual}
        disabled={ritualActive || isCasting}
        aria-label={ritualActive ? "正在起卦" : "点击开始起卦"}
        className={`group relative mx-auto mb-7 block aspect-video w-full overflow-hidden rounded-sm border border-[#604923] bg-[#0b0907] text-left shadow-[0_28px_90px_rgba(44,36,22,0.22)] transition duration-700 ${
          ritualActive ? "ring-1 ring-[#d2ae66]/60" : "hover:border-[#a57c38] hover:shadow-[0_30px_100px_rgba(94,65,25,0.3)]"
        }`}
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/ritual-render.svg"
          className={`absolute inset-0 h-full w-full object-cover transition duration-1000 ${
            ritualActive ? "scale-[1.025] opacity-100 saturate-125" : "opacity-80 saturate-75 group-hover:opacity-95"
          }`}
        >
          <source src="/videos/iching-ritual.mp4" type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_25%,rgba(9,8,7,0.12)_58%,rgba(9,8,7,0.72)_100%)]" />
        <div className={`absolute inset-0 transition duration-1000 ${ritualActive ? "bg-[#d4a84d]/[0.04]" : "bg-black/[0.08]"}`} />

        <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-[#d7b66e]/25 bg-black/20 px-3 py-2 backdrop-blur-sm">
          <span className={`h-1.5 w-1.5 rounded-full bg-[#e0be72] ${ritualActive ? "animate-pulse shadow-[0_0_12px_#e0be72]" : ""}`} />
          <span className="text-[9px] tracking-[0.24em] text-[#ddc58f]">六爻问象</span>
        </div>

        <div className="absolute right-5 top-5 flex w-16 flex-col gap-1.5">
          {yaoPattern.map((broken, index) => {
            const lit = index < activeLineCount[phase];
            return (
              <div key={`${broken}-${index}`} className="flex h-1.5 gap-1">
                {broken ? (
                  <>
                    <span className={`flex-1 rounded-full transition duration-700 ${lit ? "bg-[#f0d18a] shadow-[0_0_10px_#c79845]" : "bg-[#b59c70]/25"}`} />
                    <span className={`flex-1 rounded-full transition duration-700 ${lit ? "bg-[#f0d18a] shadow-[0_0_10px_#c79845]" : "bg-[#b59c70]/25"}`} />
                  </>
                ) : (
                  <span className={`flex-1 rounded-full transition duration-700 ${lit ? "bg-[#f0d18a] shadow-[0_0_10px_#c79845]" : "bg-[#b59c70]/25"}`} />
                )}
              </div>
            );
          })}
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#080705] via-[#080705]/75 to-transparent px-6 pb-6 pt-20 text-center">
          <div className="text-[10px] tracking-[0.28em] text-[#e4c77e]">{phaseLabels[phase]}</div>
          <div className="mt-2 text-xs tracking-[0.14em] text-[#cbb993]">
            {ritualActive || isCasting ? "请保持专注，六爻正在成象" : "默想问题，点击画面或下方按钮开始"}
          </div>
        </div>
      </button>

      <textarea
        value={question}
        onChange={(event) => setQuestion(event.target.value)}
        placeholder="默想你的问题，可不填"
        rows={3}
        className="mb-6 w-full resize-none rounded-sm border border-divider bg-white p-4 text-sm text-ink outline-none transition placeholder:text-ink-fade focus:border-ink dark:bg-card dark:text-paper"
      />
      <Button onClick={startRitual} disabled={ritualActive || isCasting} className="w-full">
        {ritualActive || isCasting ? "起卦中" : "开始起卦"}
      </Button>
    </div>
  );
}
