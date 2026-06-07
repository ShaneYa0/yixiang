import { Card } from "@/components/ui/Card";
import { IconCircle } from "@/components/ui/IconCircle";
import Link from "next/link";

const features = [
  { href: "/fortune", icon: "☀", title: "今日运势", text: "吉凶、宜忌、吉时与行动提示。" },
  { href: "/bazi", icon: "☯", title: "生辰八字", text: "四柱排盘与五行分布。" },
  { href: "/marriage", icon: "⚭", title: "姻缘配对", text: "合婚指数与关系简评。" },
  { href: "/iching", icon: "☰", title: "六爻占卜", text: "起卦、动爻与方向解读。" },
  { href: "/huangli", icon: "☷", title: "每日黄历", text: "农历、宜忌、吉神方位。" },
];

export function FeatureCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {features.map((feature) => (
        <Link key={feature.href} href={feature.href} className="block">
          <Card className="h-full transition-colors hover:border-ink/40">
            <div className="mb-5 flex items-center gap-3">
              <IconCircle symbol={feature.icon} />
              <h2 className="text-sm font-semibold tracking-[0.2em] text-ink">{feature.title}</h2>
            </div>
            <p className="text-[13px] leading-relaxed text-ink-light">{feature.text}</p>
          </Card>
        </Link>
      ))}
    </div>
  );
}
