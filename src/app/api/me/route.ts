import { NextResponse } from "next/server";
import { resolveAuthUser } from "@/lib/auth-utils";

export async function GET() {
  const user = await resolveAuthUser();

  if (!user) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      isVip: user.isVip,
      isLocal: user.isLocal,
      trialEndsAt: user.trialEndsAt,
      subscriptionTier: user.subscriptionTier,
      subscriptionEndsAt: user.subscriptionEndsAt,
      reportCredits: user.reportCredits,
    },
  });
}
