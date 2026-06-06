import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "姻缘配对 - 易象",
  description: "在线姻缘合婚，输入双方出生信息，测算五行互补、生肖匹配和八字互动关系。",
  openGraph: {
    title: "姻缘配对 - 易象",
    description: "在线姻缘合婚，输入双方出生信息，测算五行互补、生肖匹配和八字互动关系。",
  },
};

export default function MarriageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
