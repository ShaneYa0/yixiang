import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "登录 - 易象",
  description: "登录易象账户，查看八字深度详批历史、管理订单和详批次数。",
  openGraph: {
    title: "登录 - 易象",
    description: "登录易象账户，查看八字深度详批历史、管理订单和详批次数。",
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
