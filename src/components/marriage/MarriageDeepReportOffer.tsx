"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type AccountUser = {
  id: string;
};

export function MarriageDeepReportOffer({
  mode,
  result,
  lastInput,
}: {
  mode: "pair" | "solo";
  result?: unknown;
  lastInput?: unknown;
}) {
  const isPair = mode === "pair";
  const router = useRouter();
  const [account, setAccount] = useState<AccountUser | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((data) => setAccount(data.user ?? null))
      .catch(() => setAccount(null))
      .finally(() => setLoaded(true));
  }, []);

  const handleViewReport = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/reports/marriage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          result,
          ...(mode === "solo" ? { input: lastInput } : { inputs: lastInput }),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "加载失败");
      window.sessionStorage.setItem(`yixiang:marriage-report:${data.report.id}`, JSON.stringify(data.report));
      setErrMsg(null);
      router.push(`/reports/marriage/${data.report.id}`);
    } catch (e) {
      setLoading(false);
      setErrMsg(e instanceof Error ? e.message : "网络异常，请稍后重试");
    }
  };

  if (!loaded) return null;

  // Logged in → show deep report button
  if (account) {
    return (
      <div className="overflow-hidden rounded-2xl border border-divider bg-card px-6 py-6 text-center sm:px-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-fade">
          {isPair ? "合盘深度解读" : "感情深度解读"}
        </p>
        <p className="mt-2 text-[13px] leading-relaxed text-ink-light">
          {isPair ? "查看完整合盘分析，涵盖日柱关系、五行互补、大运同步与相处要点。" : "查看完整感情分析，涵盖感情节奏、伴侣特质、关键时段与相处方向。"}
        </p>
        <button
          onClick={handleViewReport}
          disabled={loading}
          className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-ink px-8 py-3 text-sm font-medium tracking-[0.14em] text-paper transition-opacity hover:opacity-90 disabled:opacity-50 dark:bg-paper dark:text-ink"
        >
          {loading ? "加载中..." : "查看深度解读"}
        </button>
        {errMsg && (
          <p className="mt-3 text-[12px] text-red-600/80 dark:text-red-400/80">{errMsg}</p>
        )}
      </div>
    );
  }

  // Not logged in
  return (
    <div className="overflow-hidden rounded-2xl border border-divider bg-card">
      <div className="px-6 py-6 sm:px-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-fade">
          {isPair ? "合盘深度解读" : "感情深度解读"}
        </p>
        <h2 className="mt-2 max-w-lg text-xl font-semibold leading-snug tracking-[0.08em] text-ink dark:text-paper">
          {isPair ? "这段关系能走多远？" : "想更深入地了解自己的感情走向？"}
        </h2>
        <p className="mt-2 max-w-lg text-[13px] leading-[1.8] text-ink-light">
          {isPair
            ? "展开日柱关系、五行互补、大运同步与相处要点，从命理角度看清这段关系的底层结构。"
            : "展开感情节奏、伴侣特质、关键时段与相处方向，适合保存后反复回看。"}
        </p>

        <div className="mt-5 flex items-center justify-between rounded-xl bg-divider/20 px-5 py-4 dark:bg-divider/10">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-fade">深度解读</p>
            <p className="text-[13px] leading-relaxed text-ink-light">
              登录后即可免费查看
            </p>
          </div>
          <Link
            href="/login"
            className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-xl border border-ink bg-ink px-5 py-2.5 text-sm font-medium tracking-[0.14em] text-paper transition-opacity hover:opacity-90 dark:border-paper dark:bg-paper dark:text-ink"
          >
            登录查看
          </Link>
        </div>
      </div>
    </div>
  );
}
