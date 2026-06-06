import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "八字排盘 - 易象",
  description: "在线八字排盘，输入出生日期和时辰即可获得四柱八字、五行分析、十神关系和大运流年。",
  openGraph: {
    title: "八字排盘 - 易象",
    description: "在线八字排盘，输入出生日期和时辰即可获得四柱八字、五行分析、十神关系和大运流年。",
  },
};

export default function BaziLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
