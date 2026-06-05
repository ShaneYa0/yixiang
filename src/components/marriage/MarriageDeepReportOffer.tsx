"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";

const modules = ["合婚格局详解", "日柱深度分析", "大运同步推演", "财官互动精解", "相处模式建议", "关键年份提醒"];
const deliverables = [
  { value: "深度详批", label: "完整解读", note: "比基础合婚看得更深更细" },
  { value: "命盘图解", label: "重点清晰", note: "双方四柱、五行、十神对比呈现" },
  { value: "阶段指引", label: "大运流年", note: "看清不同阶段的相处重点" },
  { value: "长期保存", label: "随时复看", note: "登录后可回到我的查看" },
];

export function MarriageDeepReportOffer({ mode }: { mode: "pair" | "solo" }) {
  const title = mode === "pair" ? "合婚深度详批" : "姻缘深度详批";

  return (
    <Card className="border-ink/40 bg-card">
      <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
        <div>
          <SectionTitle>{title}</SectionTitle>
          <h3 className="mb-4 text-3xl font-thin leading-tight tracking-[0.12em] text-ink sm:text-4xl">
            {mode === "pair"
              ? "把两人的命理连结讲透，也把相处的节奏讲明白"
              : "把姻缘的来龙去脉讲清，也把等待的节奏讲明白"}
          </h3>
          <p className="max-w-2xl text-[13px] leading-7 text-ink-light">
            {mode === "pair"
              ? "免费版继续保留六维度合婚分析和缘型判定。深度详批会把日柱关系、大运同步、财官互动和相处建议进一步展开，结合双方完整的四柱八字做交叉解读，适合保存后反复查看。"
              : "免费版继续保留婚姻宫、配偶星、桃花运分析和缘型判定。深度详批会将正缘时机、配偶画像和关键大运阶段进一步展开，结合完整四柱八字做深入解读，适合保存后反复查看。"}
          </p>
          <div className="mt-6 border-l border-ink pl-4">
            <div className="mb-2 text-[11px] font-semibold tracking-[0.16em] text-ink">
              {mode === "pair" ? "本次合婚核心" : "本次姻缘核心"}
            </div>
            <p className="text-[13px] leading-7 text-ink-light">
              深度详批在免费解读的基础上，进一步结合双方十神配置、大运流年的同步度和关键时间节点，给出更具体的相处建议和阶段预判。
            </p>
          </div>
        </div>

        <div className="border border-ink bg-paper p-5 dark:bg-card">
          <div className="mb-4">
            <div className="mb-1 text-[11px] tracking-[0.14em] text-ink-fade">登录后即可查看</div>
            <div className="text-[13px] leading-6 text-ink-light">深度详批功能即将推出，敬请期待</div>
          </div>
          <Link
            href="/me"
            className="inline-flex w-full min-h-11 items-center justify-center border border-ink px-7 py-3 text-sm font-medium tracking-[0.14em] text-ink transition-colors hover:bg-divider/40 dark:border-paper dark:text-paper dark:hover:bg-paper/10"
          >
            查看我的账户
          </Link>
        </div>
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-4">
        {deliverables.map((item) => (
          <div key={item.label} className="border border-divider bg-paper/50 p-4 dark:bg-card/50">
            <div className="mb-1 text-xl font-thin text-ink dark:text-paper">{item.value}</div>
            <div className="mb-1 text-[11px] font-semibold tracking-[0.14em] text-ink">{item.label}</div>
            <div className="text-[11px] leading-5 text-ink-fade">{item.note}</div>
          </div>
        ))}
      </div>

      <div className="mt-5 border border-divider bg-paper/40 p-4 dark:bg-card/40">
        <div className="mb-3 text-[11px] font-semibold tracking-[0.16em] text-ink">深度详批内容</div>
        <div className="grid gap-2 sm:grid-cols-3">
          {modules.map((m) => (
            <div key={m} className="border border-divider px-3 py-2 text-center text-[11px] tracking-[0.12em] text-ink-light">
              {m}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
