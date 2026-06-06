import { NextRequest, NextResponse } from "next/server";
import { resolveAuthUser, authError } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { updateLocalUser } from "@/lib/local-auth";

const TIER_DURATION: Record<string, number> = {
  weekly: 7,
  monthly: 30,
  semiAnnual: 180,
  annual: 365,
};

export async function POST(req: NextRequest) {
  const user = await resolveAuthUser();
  if (!user) return authError("请先登录", 401);

  const body = await req.json().catch(() => null);
  const tier = body?.tier as string | undefined;

  if (!tier || !TIER_DURATION[tier]) {
    return NextResponse.json({ error: "无效的订阅档位" }, { status: 400 });
  }

  const days = TIER_DURATION[tier];
  const subscriptionEndsAt = new Date(Date.now() + days * 86400000);

  if (!isSupabaseConfigured()) {
    await updateLocalUser((current) => ({
      ...current,
      subscriptionTier: tier,
      subscriptionEndsAt: subscriptionEndsAt.toISOString(),
    }));
    return NextResponse.json({
      success: true,
      subscriptionTier: tier,
      subscriptionEndsAt: subscriptionEndsAt.toISOString(),
    });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionTier: tier,
      subscriptionEndsAt,
    },
  });

  return NextResponse.json({
    success: true,
    subscriptionTier: tier,
    subscriptionEndsAt: subscriptionEndsAt.toISOString(),
  });
}
