"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Button } from "@/components/ui/Button";

type AccountUser = {
  isVip: boolean;
  subscriptionTier: string | null;
  subscriptionEndsAt: string | null;
  trialEndsAt: string | null;
};

const tiers = [
  { key: "weekly", label: "7天体验", price: "¥8.8", days: 7, desc: "短期体验全部功能" },
  { key: "monthly", label: "月度会员", price: "¥18.8", days: 30, desc: "灵活按月订阅", recommended: true },
  { key: "semiAnnual", label: "半年会员", price: "¥88", days: 180, desc: "日均仅 ¥0.49" },
  { key: "annual", label: "年度会员", price: "¥138", days: 365, desc: "日均仅 ¥0.38" },
];

export function SubscriptionGuide({
  user,
  onBack,
}: {
  user: AccountUser | null;
  onBack: () => void;
}) {
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const handleSubscribe = (tier: string) => {
    if (!user) {
      window.location.href = "/login";
      return;
    }
    setLoading(tier);
    setMessage("");
    fetch("/api/subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tier }),
    })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error ?? "订阅失败");
        setMessage(`已订阅！刷新页面后即可查看深度内容。`);
      })
      .catch((e: Error) => setMessage(e.message))
      .finally(() => setLoading(null));
  };

  const isActive = user?.isVip;

  return (
    <div className="mx-auto max-w-3xl space-y-6 pt-8">
      <button
        onClick={onBack}
        className="text-[11px] tracking-[0.15em] text-ink-fade hover:text-ink dark:hover:text-paper"
      >
        ← 返回
      </button>

      {isActive && (
        <Card className="text-center ring-1 ring-amber-300/50 dark:ring-amber-500/30">
          <div className="mb-2 text-2xl">✨</div>
          <SectionTitle>您已是订阅用户</SectionTitle>
          <p className="mt-2 text-[13px] leading-7 text-ink-light">
            {user?.trialEndsAt && new Date(user.trialEndsAt) > new Date()
              ? `试用期至 ${new Date(user.trialEndsAt).toLocaleDateString("zh-CN")}`
              : `订阅至 ${user?.subscriptionEndsAt ? new Date(user.subscriptionEndsAt).toLocaleDateString("zh-CN") : "—"}`}
            。所有深度内容已解锁。
          </p>
        </Card>
      )}

      <Card>
        <SectionTitle>解锁深度内容</SectionTitle>
        <p className="mt-2 text-[13px] leading-7 text-ink-light">
          订阅后可解锁：八字深度详批、单人姻缘的正缘时机与配偶画像、双人合婚的大运同步与财官互动、专属报告保存回看。
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {tiers.map((tier) => (
            <div
              key={tier.key}
              className={`border p-5 transition-colors ${
                tier.recommended
                  ? "border-ink bg-paper dark:border-paper/60 dark:bg-card"
                  : "border-divider bg-card hover:border-ink/50 dark:hover:border-paper/30"
              }`}
            >
              {tier.recommended && (
                <div className="mb-2 text-[10px] font-semibold tracking-[0.14em] text-ink dark:text-paper">
                  ★ 推荐
                </div>
              )}
              <div className="mb-1 text-sm font-semibold tracking-[0.1em] text-ink dark:text-paper">
                {tier.label}
              </div>
              <div className="mb-1 text-3xl font-thin text-ink dark:text-paper">
                {tier.price}
              </div>
              <div className="mb-3 text-[11px] text-ink-fade">{tier.desc}</div>
              <Button
                onClick={() => handleSubscribe(tier.key)}
                disabled={loading !== null}
                className="w-full text-xs"
                variant={tier.recommended ? "primary" : "outline"}
              >
                {loading === tier.key ? "处理中" : isActive ? "续费" : "订阅"}
              </Button>
            </div>
          ))}
        </div>

        {message && (
          <p className="mt-4 text-center text-[12px] leading-6 text-ink-light">{message}</p>
        )}

        <p className="mt-4 text-center text-[10px] tracking-[0.1em] text-ink-fade">
          新注册用户自动获得 1 天免费试用 · 支付功能即将上线
        </p>
      </Card>
    </div>
  );
}
