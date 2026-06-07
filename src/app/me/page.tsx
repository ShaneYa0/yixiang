import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { resolveAuthUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "我的账户 - 易象",
};

export default async function MePage() {
  const user = await resolveAuthUser();

  if (!user) {
    return (
      <div className="mx-auto mt-10 max-w-md space-y-5">
        <div className="rounded-2xl border border-divider bg-divider/20 px-6 py-6 text-center dark:bg-divider/10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-fade">我的账户</p>
          <p className="mt-2 text-2xl font-light tracking-[0.06em] text-ink dark:text-paper">
            登录后查看
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-light">
            登录后可查看解读记录与账户信息
          </p>
          <Link
            href="/login"
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-ink px-8 py-3 text-sm font-medium tracking-[0.14em] text-paper transition-opacity hover:opacity-90 dark:bg-paper dark:text-ink"
          >
            去登录
          </Link>
        </div>
      </div>
    );
  }

  let reports: { id: string; birthDate: Date; birthHour: number }[] = [];
  if (!user.isLocal) {
    try {
      reports = await prisma.baziDeepReport.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 10,
      });
    } catch {
      reports = [];
    }
  }

  return (
    <div className="space-y-5 pt-6">
      {/* 账户信息 */}
      <Card className="overflow-hidden p-0">
        <div className="border-b border-divider px-6 py-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-fade">我的账户</p>
        </div>
        <div className="space-y-3 px-6 py-5">
          <div className="flex items-baseline justify-between">
            <span className="text-[12px] text-ink-fade">邮箱</span>
            <span className="text-[13px] font-medium text-ink dark:text-paper">{user.email}</span>
          </div>
        </div>
        <div className="border-t border-divider px-6 py-3">
          <form action="/auth/signout" method="post">
            <button className="text-[11px] tracking-[0.12em] text-ink-fade transition-colors hover:text-ink dark:hover:text-paper">
              退出登录
            </button>
          </form>
        </div>
      </Card>

      {/* 解读记录 */}
      <Card className="overflow-hidden p-0">
        <div className="border-b border-divider px-6 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-fade">解读记录</p>
        </div>
        {reports.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <p className="text-[13px] leading-relaxed text-ink-fade">还没有解读记录</p>
            <Link
              href="/bazi"
              className="mt-3 inline-block text-[12px] tracking-[0.08em] text-ink underline underline-offset-4 hover:opacity-70 dark:text-paper"
            >
              去开始第一次解读
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-divider">
            {reports.map((report) => (
              <div key={report.id} className="px-6 py-4">
                <p className="text-[13px] font-medium text-ink dark:text-paper">八字深度解读</p>
                <p className="mt-1 text-[12px] leading-relaxed text-ink-light">
                  {new Date(report.birthDate).toLocaleDateString("zh-CN")} · {report.birthHour}时
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
