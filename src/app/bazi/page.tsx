"use client";

import { useState } from "react";
import { BaziInput, type BaziForm } from "@/components/bazi/BaziInput";
import { BaziDeepReportOffer } from "@/components/bazi/BaziDeepReportOffer";
import { BaziReading } from "@/components/bazi/BaziReading";
import { BaziResult } from "@/components/bazi/BaziResult";
import type { BaziResult as BaziResultData } from "@/lib/types";

export type BaziApiResponse = BaziResultData & { reading: string };

export default function BaziPage() {
  const [result, setResult] = useState<BaziApiResponse | null>(null);
  const [lastInput, setLastInput] = useState<BaziForm | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (data: BaziForm) => {
    setLoading(true);
    setLastInput(data);
    const response = await fetch("/api/bazi", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    setResult(await response.json());
    setLoading(false);
  };

  if (!result) return <BaziInput onSubmit={submit} loading={loading} />;

  return (
    <div className="space-y-5">
      <BaziResult result={result} />
      <BaziReading reading={result.reading} />
      {lastInput && <BaziDeepReportOffer result={result} input={lastInput} />}
      <button onClick={() => setResult(null)} className="mx-auto block text-[11px] tracking-[0.15em] text-ink-fade hover:text-ink">
        重新排盘
      </button>
    </div>
  );
}
