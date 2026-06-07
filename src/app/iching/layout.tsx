import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "六爻占卦 - 易象",
  description: "在线六爻占卦，默想问题后起卦，获得六十四卦的真实卦辞、爻辞和变卦解读。",
  openGraph: {
    title: "六爻占卦 - 易象",
    description: "在线六爻占卦，默想问题后起卦，获得六十四卦的真实卦辞、爻辞和变卦解读。",
  },
};

export default function IchingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
