import { NextResponse } from "next/server";
import { resolveAuthUser, authError } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export async function POST() {
  const user = await resolveAuthUser();
  if (!user) return authError("请先登录后购买详批");

  if (!isSupabaseConfigured() || user.isLocal) {
    return NextResponse.json({
      payment: {
        id: `local-order-${Date.now()}`,
        amountCents: 880,
        currency: "CNY",
        status: "pending",
        provider: "unconfigured",
      },
      message: "本地开发模式已创建待支付订单。接入真实支付渠道后，支付成功会发放 1 次详批次数。",
    });
  }

  const payment = await prisma.payment.create({
    data: {
      userId: user.id,
      reportType: "bazi",
      amountCents: 880,
      status: "pending",
      provider: process.env.PAYMENT_PROVIDER ?? "unconfigured",
    },
  });

  return NextResponse.json({
    payment: {
      id: payment.id,
      amountCents: payment.amountCents,
      currency: payment.currency,
      status: payment.status,
      provider: payment.provider,
    },
    message: "订单已创建。配置真实支付渠道和回调后，支付成功会自动发放 1 次详批次数。",
  });
}
