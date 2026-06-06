"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MarriageDeepReportOffer } from "@/components/marriage/MarriageDeepReportOffer";
import { MarriageInput, type MarriageFormData } from "@/components/marriage/MarriageInput";
import { MarriageReading } from "@/components/marriage/MarriageReading";
import { MarriageResult } from "@/components/marriage/MarriageResult";
import type { MarriageResult as MarriageResultData, SingleMarriageResult } from "@/lib/marriage";

const CACHE_KEY = "yixiang:/marriage-cache";

type MarriageApiResponse = {
  mode: "pair" | "solo";
  result: MarriageResultData | SingleMarriageResult;
  reading: string;
};

export default function MarriagePage() {
  const searchParams = useSearchParams();
  const fromReport = searchParams.get("from") === "report";

  const [result, setResult] = useState<MarriageApiResponse | null>(null);
  const [lastInput, setLastInput] = useState<MarriageFormData | null>(null);
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // 仅从深度报告返回时恢复缓存
  useEffect(() => {
    if (fromReport) {
      try {
        const cached = sessionStorage.getItem(CACHE_KEY);
        if (cached) {
          const { result: r, lastInput: li } = JSON.parse(cached);
          setResult(r);
          setLastInput(li);
        }
      } catch { /* ignore */ }
    }
    setHydrated(true);
  }, [fromReport]);

  const submit = async (data: MarriageFormData) => {
    setLoading(true);
    setLastInput(data);
    const response = await fetch("/api/marriage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const r = await response.json();
    setResult(r);
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ result: r, lastInput: data }));
    setLoading(false);
  };

  const handleReset = () => {
    setResult(null);
    setLastInput(null);
    sessionStorage.removeItem(CACHE_KEY);
  };

  if (!hydrated) return null;
  if (!result) return <MarriageInput onSubmit={submit} loading={loading} />;

  return (
    <div className="space-y-5">
      <MarriageResult mode={result.mode} result={result.result} />
      <MarriageReading reading={result.reading} mode={result.mode} />
      {lastInput && (
        <MarriageDeepReportOffer
          mode={result.mode}
          result={result.result}
          lastInput={lastInput}
        />
      )}
      <button
        onClick={handleReset}
        className="mx-auto mt-6 block text-[11px] tracking-[0.15em] text-ink-fade hover:text-ink dark:hover:text-paper"
      >
        重新测算
      </button>
    </div>
  );
}
