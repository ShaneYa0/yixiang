"use client";

import { useState } from "react";
import { IchingCast } from "@/components/iching/IchingCast";
import { IchingResultDisplay } from "@/components/iching/IchingResult";
import type { IchingResult, LineValue } from "@/lib/iching";

export type IchingApiResponse = IchingResult & { reading: string };

export default function IchingPage() {
  const [result, setResult] = useState<IchingApiResponse | null>(null);
  const [casting, setCasting] = useState(false);

  const cast = async (question: string, lines: LineValue[]) => {
    setCasting(true);
    const response = await fetch("/api/iching", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, lines }),
    });
    setResult(await response.json());
    setCasting(false);
  };

  if (!result) return <IchingCast onCast={cast} isCasting={casting} />;

  return (
    <div>
      <IchingResultDisplay result={result} reading={result.reading} />
      <button onClick={() => setResult(null)} className="mx-auto mt-6 block text-[11px] tracking-[0.15em] text-ink-fade hover:text-ink">
        再占一卦
      </button>
    </div>
  );
}
