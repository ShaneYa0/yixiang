"use client";

import { useState } from "react";
import { MarriageInput, type MarriageFormData } from "@/components/marriage/MarriageInput";
import { MarriageResult } from "@/components/marriage/MarriageResult";
import { MarriageReading } from "@/components/marriage/MarriageReading";
import { MarriageDeepReportOffer } from "@/components/marriage/MarriageDeepReportOffer";
import type { MarriageResult as MarriageResultData, SingleMarriageResult } from "@/lib/marriage";

type MarriageApiResponse = {
  mode: "pair" | "solo";
  result: MarriageResultData | SingleMarriageResult;
  reading: string;
};

export default function MarriagePage() {
  const [result, setResult] = useState<MarriageApiResponse | null>(null);
  const [lastInput, setLastInput] = useState<MarriageFormData | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (data: MarriageFormData) => {
    setLoading(true);
    setLastInput(data);
    const response = await fetch("/api/marriage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setResult(await response.json());
    setLoading(false);
  };

  if (!result) return <MarriageInput onSubmit={submit} loading={loading} />;

  return (
    <div className="space-y-5">
      <MarriageResult mode={result.mode} result={result.result} />
      <MarriageReading reading={result.reading} mode={result.mode} />
      {lastInput && <MarriageDeepReportOffer mode={result.mode} />}
      <button
        onClick={() => setResult(null)}
        className="mx-auto mt-6 block text-[11px] tracking-[0.15em] text-ink-fade hover:text-ink dark:hover:text-paper"
      >
        重新测算
      </button>
    </div>
  );
}
