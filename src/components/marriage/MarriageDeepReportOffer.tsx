"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type AccountUser = {
  isVip: boolean;
};

const plans = [
  { label: "7天体验", price: "¥8.8", desc: "适合想先了解自己感情结构的朋友" },
  { label: "月度会员", price: "¥18.8", desc: "短期内有感情疑问时随时查看" },
  { label: "半年会员", price: "¥98.8", desc: "持续关注大运流年对感情的引动" },
  { label: "年度会员", price: "¥158.8", desc: "长期跟踪感情节奏与关键时段变化" },
];

function PlanModal({ open, onClose, isLoggedIn }: { open: boolean; onClose: () => void; isLoggedIn: boolean }) {
  const [selected, setSelected] = useState<string | null>(null);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/25 px-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded-2xl border border-divider bg-card shadow-[0_24px_64px_rgba(44,36,22,0.08)]"
        onClick={(e) => e.stopPropagation()}
      >
        {!isLoggedIn && (
          <div className="border-b border-divider bg-divider/20 px-6 py-5 text-center dark:bg-divider/10">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-fade">新用户注册</p>
            <p className="mt-2 text-xl font-semibold tracking-[0.06em] text-ink dark:text-paper">当日免费体验</p>
            <p className="mt-1 text-[12px] leading-relaxed text-ink-light">注册即享当日不限次数解读，到期后按需选择方案</p>
          </div>
        )}
        {isLoggedIn && (
          <div className="border-b border-divider px-6 py-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-fade">开通会员</p>
            <p className="mt-1 text-[12px] leading-relaxed text-ink-light">选择方案即可开通</p>
          </div>
        )}

        <div className="space-y-1.5 px-5 py-4">
          {plans.map((plan) => {
            const isSelected = selected === plan.label;
            return (
              <button
                key={plan.label}
                type="button"
                onClick={() => setSelected(isSelected ? null : plan.label)}
                className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition-all ${
                  isSelected
                    ? "bg-ink text-paper dark:bg-paper dark:text-ink"
                    : "bg-divider/20 text-ink hover:bg-divider/30 dark:bg-divider/10 dark:text-paper dark:hover:bg-divider/20"
                }`}
              >
                <div>
                  <p className="text-[13px] font-medium tracking-[0.06em]">{plan.label}</p>
                  <p className={`mt-0.5 text-[11px] ${isSelected ? "opacity-70" : "text-ink-fade"}`}>{plan.desc}</p>
                </div>
                <span className="shrink-0 text-[15px] font-semibold tracking-[0.04em]">{plan.price}</span>
              </button>
            );
          })}
        </div>

        <div className="border-t border-divider px-5 py-4">
          <Link
            href={isLoggedIn ? "/me" : "/register"}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-ink px-7 py-3 text-sm font-medium tracking-[0.14em] text-paper transition-opacity hover:opacity-90 dark:bg-paper dark:text-ink"
          >
            {isLoggedIn ? "立即开通" : "注册并开通"}{selected ? ` · ${plans.find((p) => p.label === selected)?.price}` : ""}
          </Link>
          <button
            onClick={onClose}
            className="mt-2.5 w-full text-center text-[11px] tracking-[0.1em] text-ink-fade transition-colors hover:text-ink dark:hover:text-paper"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}

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
  const [planOpen, setPlanOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((data) => setAccount(data.user ?? null))
      .catch(() => setAccount(null))
      .finally(() => setLoaded(true));
  }, []);

  const canAccess = account?.isVip ?? false;

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

  // 已登录且有权限 → 只显示查看按钮
  if (canAccess) {
    return (
      <div className="overflow-hidden rounded-2xl border border-divider bg-card px-6 py-6 text-center sm:px-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-fade">
          {isPair ? "合盘深度解读" : "感情深度解读"}
        </p>
        <p className="mt-2 text-[13px] leading-relaxed text-ink-light">
          {isPair ? "已解锁，可查看完整合盘分析。" : "已解锁，可查看完整感情分析。"}
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

  // 已登录无权限或未登录
  return (
    <>
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
              ? "解锁后展开日柱关系、五行互补、大运同步与相处要点，从命理角度看清这段关系的底层结构。"
              : "解锁后展开感情节奏、伴侣特质、关键时段与相处方向，适合保存后反复回看。"}
          </p>

          <div className="mt-5 flex items-center justify-between rounded-xl bg-divider/20 px-5 py-4 dark:bg-divider/10">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-fade">深度解读</p>
              <p className="text-2xl font-light tracking-[0.04em] text-ink dark:text-paper">
                ¥8.8 <span className="text-[11px] font-normal tracking-normal text-ink-fade">
                  {account ? "起 · 选择方案开通" : "起 · 注册当日免费体验"}
                </span>
              </p>
            </div>
            <button
              onClick={() => setPlanOpen(true)}
              className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-xl border border-ink bg-ink px-5 py-2.5 text-sm font-medium tracking-[0.14em] text-paper transition-opacity hover:opacity-90 dark:border-paper dark:bg-paper dark:text-ink"
            >
              解锁深度解读
            </button>
          </div>
        </div>
      </div>

      <PlanModal open={planOpen} onClose={() => setPlanOpen(false)} isLoggedIn={!!account} />
    </>
  );
}
