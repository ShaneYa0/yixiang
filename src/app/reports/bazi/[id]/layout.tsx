import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "八字深度详批 - 易象",
  description: "查看八字深度详批报告，包含命盘格局、十神组合、事业财运、感情婚姻、健康性格和大运流年详解。",
  openGraph: {
    title: "八字深度详批 - 易象",
    description: "查看八字深度详批报告，包含命盘格局、十神组合、事业财运、感情婚姻、健康性格和大运流年详解。",
  },
};

export default function BaziReportLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
