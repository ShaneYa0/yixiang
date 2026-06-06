"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";
import type { BaziForm } from "@/components/bazi/BaziInput";
import type { BaziDeepReport } from "@/lib/bazi-deep-report";
import type { BaziResult } from "@/lib/types";

type AccountUser = {
  id: string;
  email: string;
  isVip: boolean;
  trialEndsAt: string | null;
  subscriptionTier: string | null;
  subscriptionEndsAt: string | null;
  reportCredits: number;
};

const modules = ["格局用神", "十神关系", "事业财运", "感情婚姻", "健康性格", "大运流年"];

export function BaziDeepReportOffer({ result, input }: { result: BaziResult; input: BaziForm }) {
  const router = useRouter();
  const [account, setAccount] = useState<AccountUser | null>(null);
  const [accountLoaded, setAccountLoaded] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/me")
      .then((response) => response.json())
      .then((data: { user: AccountUser | null }) => setAccount(data.user))
      .catch(() => setMessage("账户状态读取失败，请刷新后重试。"))
      .finally(() => setAccountLoaded(true));
  }, []);

  const canAccess = account?.isVip;

  const cta = useMemo(() => {
    if (!account) return "登录后查看完整详批";
    if (canAccess) return "查看本次完整详批";
    return "解锁完整详批";
  }, [account, canAccess]);

  const handlePrimaryAction = () => {
    if (!account) {
      window.location.href = "/login";
      return;
    }

    if (canAccess) {
      setLoading(true);
      setMessage("");
      fetch("/api/reports/bazi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      })
        .then(async (response) => {
          const data = await response.json();
          if (!response.ok) throw new Error(data.error ?? "详批准备失败，请稍后再试");
          const nextReport = data.report as BaziDeepReport;
          window.sessionStorage.setItem(`yixiang:bazi-report:${nextReport.id}`, JSON.stringify(nextReport));
          router.push(`/reports/bazi/${nextReport.id}`);
        })
        .catch((error: Error) => setMessage(error.message))
        .finally(() => setLoading(false));
      return;
    }

    window.location.href = "/me";
  };

  const currentLuck = result.luck.currentCycle?.ganZhi ?? "未起运";

  return (
    <Card className="border-ink/40 bg-card">
      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <SectionTitle>八字深度详批</SectionTitle>
          <h3 className="mb-4 text-3xl font-thin leading-tight tracking-[0.12em] text-ink sm:text-4xl">
            解锁完整命盘详批
          </h3>
          <p className="max-w-xl text-[13px] leading-7 text-ink-light">
            不只看排盘。完整详批会把格局、用神、十神和大运流年拆开讲清，直接告诉你：优势在哪里，风险在哪里，接下来该怎么走。
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              ["命盘核心", `${result.dayMaster}日主 · ${result.strength}`],
              ["当前阶段", `${currentLuck}大运`],
              ["重点方向", result.usefulElements.join("、")],
            ].map(([title, text]) => (
              <div key={title} className="border border-divider bg-paper/40 p-4 dark:bg-card/40">
                <div className="mb-2 text-[11px] font-semibold tracking-[0.16em] text-ink">{title}</div>
                <p className="text-[13px] leading-6 text-ink-light">{text}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            {modules.map((module) => (
              <div key={module} className="border border-divider px-3 py-2 text-center text-[11px] tracking-[0.12em] text-ink-light">
                {module}
              </div>
            ))}
          </div>
        </div>

        <div className="border border-ink bg-paper p-5 dark:bg-card">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <div className="mb-1 text-[11px] tracking-[0.14em] text-ink-fade">完整详批</div>
              <div className="text-[13px] leading-6 text-ink-light">
                {canAccess ? "你已解锁，可直接查看。" : "注册首份免费，后续单次报告 ¥8.8。"}
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-thin text-ink dark:text-paper">{canAccess ? "已解锁" : "免费"}</div>
              <div className="text-[11px] tracking-[0.12em] text-ink-fade">{canAccess ? "当前账户" : "首份报告"}</div>
            </div>
          </div>

          {account && (
            <div className="mb-4 border border-divider bg-card p-3 text-[12px] leading-6 text-ink-light">
              当前账户：{account.email}
              <br />
              状态：{canAccess ? "已解锁深度内容" : "未订阅"}
              {account.trialEndsAt && new Date(account.trialEndsAt) > new Date() && (
                <>
                  <br />
                  试用截止：{new Date(account.trialEndsAt).toLocaleDateString("zh-CN")}
                </>
              )}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Button onClick={handlePrimaryAction} disabled={!accountLoaded || loading} className="w-full">
              {loading ? "处理中" : cta}
            </Button>
            <Link
              href="/me"
              className="inline-flex min-h-11 items-center justify-center border border-ink px-7 py-3 text-sm font-medium tracking-[0.14em] text-ink transition-colors hover:bg-divider/40 dark:border-paper dark:text-paper dark:hover:bg-paper/10"
            >
              查看已存详批
            </Link>
          </div>
        </div>
      </div>

      {message && <p className="mt-4 text-[12px] leading-6 text-ink-light">{message}</p>}
    </Card>
  );
}
