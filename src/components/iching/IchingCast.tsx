"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import { HexagramLines, YAO_POSITION_NAMES } from "@/components/iching/HexagramLines";
import { Button } from "@/components/ui/Button";
import type { LineValue } from "@/lib/iching";

const COIN_LABEL: Record<LineValue, string> = { 0: "三反 · 老阴", 1: "一正两反 · 少阴", 2: "两正一反 · 少阳", 3: "三正 · 老阳" };

type State = {
  lines: (LineValue | undefined)[];
  step: number;
  phase: "idle" | "tossing" | "result";
  coinFaces: boolean[];
  tossResult: LineValue | null;
};

const INIT: State = { lines: Array.from({ length: 6 }, () => undefined), step: 0, phase: "idle", coinFaces: [], tossResult: null };
type Action = { type: "START_TOSS" } | { type: "DONE_TOSS"; value: LineValue; faces: boolean[] } | { type: "CLEAR_RESULT" } | { type: "RESET" };

function reducer(state: State, action: Action): State {
  if (action.type === "START_TOSS") return { ...state, phase: "tossing", coinFaces: [], tossResult: null };
  if (action.type === "CLEAR_RESULT") return { ...state, phase: "idle", coinFaces: [], tossResult: null };
  if (action.type === "RESET") return INIT;
  if (action.type === "DONE_TOSS") {
    const lines = [...state.lines];
    lines[state.step] = action.value;
    return { ...state, lines, step: state.step + 1, phase: "result", coinFaces: action.faces, tossResult: action.value };
  }
  return state;
}

export function IchingCast({ onCast, isCasting }: { onCast: (question: string, lines: LineValue[]) => void; isCasting: boolean }) {
  const [state, dispatch] = useReducer(reducer, INIT);
  const [question, setQuestion] = useState("");
  const questionRef = useRef("");
  const timerRef = useRef<number | null>(null);
  const submitRef = useRef(onCast);

  useEffect(() => {
    questionRef.current = question;
    submitRef.current = onCast;
  }, [onCast, question]);

  useEffect(() => () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
  }, []);

  const toss = () => {
    if (state.phase !== "idle" || state.step >= 6) return;
    dispatch({ type: "START_TOSS" });
    timerRef.current = window.setTimeout(() => {
      const faces = Array.from({ length: 3 }, () => Math.random() < 0.5);
      const value = faces.filter(Boolean).length as LineValue;
      const finalLines = [...state.lines];
      finalLines[state.step] = value;
      dispatch({ type: "DONE_TOSS", value, faces });
      timerRef.current = window.setTimeout(() => {
        if (state.step === 5) submitRef.current(questionRef.current, finalLines as LineValue[]);
        else dispatch({ type: "CLEAR_RESULT" });
      }, 650);
    }, 850);
  };

  const { lines, step, phase, coinFaces, tossResult } = state;
  const currentIndex = Math.min(step, 5);
  const currentName = YAO_POSITION_NAMES[currentIndex];

  return (
    <div className="mx-auto max-w-2xl py-8">
      <header className="mb-7 text-center">
        <p className="mb-2 text-[10px] font-semibold tracking-[0.32em] text-[#aa8b55]">一念起 · 六爻成</p>
        <h1 className="text-2xl font-medium tracking-[0.22em] text-ink">六爻占卜</h1>
        <p className="mt-3 text-xs tracking-[0.1em] text-ink-soft">三钱一掷，自初爻向上依次成卦</p>
      </header>

      <section className="overflow-hidden rounded-sm border border-[#d9cdb8] bg-white shadow-[0_20px_70px_rgba(73,55,25,0.08)] dark:bg-card">
        <div className="grid md:grid-cols-[1.15fr_0.85fr]">
          <div className="relative border-b border-divider px-5 py-6 md:border-b-0 md:border-r md:px-7 md:py-8">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#80643c] via-[#cfad68] to-[#80643c]" />
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] tracking-[0.2em] text-ink-fade">本卦 · 实时成象</p>
                <p className="mt-1 text-sm text-ink">{step === 0 ? "尚未起爻" : `已成 ${step} 爻`}</p>
              </div>
              <div className="flex gap-1.5">
                {Array.from({ length: 6 }, (_, index) => <span key={index} className={`h-1.5 w-5 rounded-full transition duration-500 ${index < step ? "bg-[#b68a3a]" : "bg-divider"}`} />)}
              </div>
            </div>
            <HexagramLines lines={lines} activeIndex={step < 6 ? step : undefined} />
          </div>

          <div className="flex min-h-[300px] flex-col justify-between bg-[#faf7f1] px-6 py-7 dark:bg-[#28231e]">
            <div>
              <p className="text-[10px] tracking-[0.22em] text-[#aa8b55]">{step < 6 ? `第 ${step + 1} 次 · ${currentName}` : "六爻已成"}</p>
              <h2 className="mt-3 text-lg font-medium tracking-[0.12em] text-ink">
                {phase === "tossing" ? "铜钱旋转，静候落定" : phase === "result" && tossResult !== null ? COIN_LABEL[tossResult] : step === 0 ? "从初爻开始" : `继续摇${currentName}`}
              </h2>
              {phase === "tossing" && <p className="mt-3 text-xs leading-6 text-ink-light">保持心念不移，静候铜钱落定。</p>}
            </div>
            <div className="my-7 flex min-h-20 items-center justify-center gap-4">
              {[0, 1, 2].map((index) => <CopperCoin key={index} face={phase === "result" ? coinFaces[index] : null} spinning={phase === "tossing"} />)}
            </div>
            <p className="border-t border-divider pt-4 text-center text-[10px] tracking-[0.18em] text-ink-fade">{step >= 6 ? "卦象已提交，正在解卦" : "顺序固定：初爻 → 二爻 → 三爻 → 四爻 → 五爻 → 上爻"}</p>
          </div>
        </div>
      </section>

      {step === 0 && <textarea value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="默想你的问题，可不填" rows={2} className="mt-5 w-full resize-none rounded-sm border border-divider bg-white p-4 text-sm text-ink outline-none transition placeholder:text-ink-fade focus:border-[#a37a38] dark:bg-card dark:text-paper" />}

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
        <Button onClick={toss} disabled={phase !== "idle" || step >= 6 || isCasting} className="w-full">
          {isCasting ? "解卦中" : phase === "tossing" ? `正在摇${currentName}` : step === 0 ? "开始摇初爻" : step < 6 ? `摇${currentName} · 第 ${step + 1}/6 次` : "六爻已成"}
        </Button>
        {step > 0 && <Button variant="outline" onClick={() => dispatch({ type: "RESET" })} disabled={phase === "tossing" || isCasting}>重新起卦</Button>}
      </div>
    </div>
  );
}

function CopperCoin({ face, spinning }: { face: boolean | null; spinning: boolean }) {
  return (
    <div className={`relative flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-[#b18742] bg-[radial-gradient(circle_at_35%_30%,#f3dfad,#b78a43_58%,#6e4a20)] shadow-[0_6px_16px_rgba(73,48,16,0.22)] ${spinning ? "animate-[spin_700ms_linear_infinite]" : ""}`}>
      <span className="absolute inset-1 rounded-full border border-[#745323]/60" />
      <span className="h-5 w-5 rounded-[3px] bg-[#342717] shadow-[inset_0_1px_3px_rgba(0,0,0,0.7)]" />
      {face !== null && <span className="absolute -bottom-5 text-[9px] tracking-[0.12em] text-ink-fade">{face ? "正" : "反"}</span>}
    </div>
  );
}
