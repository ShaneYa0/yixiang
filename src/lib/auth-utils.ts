import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ensureAppUser } from "@/lib/account";
import { getLocalUser, updateLocalUser } from "@/lib/local-auth";
import { createServerSupabase, isSupabaseConfigured } from "@/lib/supabase/server";
import type { User } from "@prisma/client";

/** Unified user object returned by getAuthUser — works for both local-dev and Supabase modes. */
export type AuthUser = {
  id: string;
  email: string;
  reportCredits: number;
  isLocal: boolean;
  trialEndsAt: string | null;
  subscriptionTier: string | null;
  subscriptionEndsAt: string | null;
  isVip: boolean; // trial active or subscription active
};

/** Internal app user (from Prisma) when Supabase is configured. */
type AppUser = User;

// ---- user resolution ----

function computeIsVip(params: {
  trialEndsAt: string | null;
  subscriptionEndsAt: string | null;
}) {
  if (params.trialEndsAt && new Date(params.trialEndsAt) > new Date()) return true;
  if (params.subscriptionEndsAt && new Date(params.subscriptionEndsAt) > new Date()) return true;
  return false;
}

export async function resolveAuthUser(): Promise<AuthUser | null> {
  if (!isSupabaseConfigured()) {
    const localUser = await getLocalUser();
    if (!localUser) return null;
    const trialEndsAt = localUser.trialEndsAt ?? null;
    const subscriptionEndsAt = localUser.subscriptionEndsAt ?? null;
    return {
      id: localUser.id,
      email: localUser.email,
      reportCredits: localUser.reportCredits,
      isLocal: true,
      trialEndsAt,
      subscriptionTier: localUser.subscriptionTier ?? null,
      subscriptionEndsAt,
      isVip: computeIsVip({ trialEndsAt, subscriptionEndsAt }),
    };
  }

  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;

  const appUser = await ensureAppUser(data.user);
  const trialEndsAt = appUser.trialEndsAt?.toISOString() ?? null;
  const subscriptionEndsAt = appUser.subscriptionEndsAt?.toISOString() ?? null;
  return {
    id: appUser.id,
    email: appUser.email,
    reportCredits: appUser.reportCredits,
    isLocal: false,
    trialEndsAt,
    subscriptionTier: appUser.subscriptionTier ?? null,
    subscriptionEndsAt,
    isVip: computeIsVip({ trialEndsAt, subscriptionEndsAt }),
  };
}

// ---- response helpers ----

export function authError(message: string, status: 401 | 402 | 403 = 401) {
  return NextResponse.json({ error: message }, { status });
}

// ---- credit helpers ----

/** Decrement report credits and return updated count. Handles local vs DB transparently. */
export async function consumeReportCredit(user: AuthUser): Promise<number | null> {
  if (user.isLocal) {
    const nextUser = await updateLocalUser((current) =>
      current.reportCredits <= 0
        ? current
        : { ...current, reportCredits: Math.max(0, current.reportCredits - 1) },
    );
    return nextUser?.reportCredits ?? null;
  }

  const { prisma } = await import("@/lib/prisma");
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { reportCredits: { decrement: 1 } },
  });
  return updated.reportCredits;
}

/** Check if the user has credits available and return a 402 response if not. */
export function checkReportCredits(user: AuthUser) {
  if (user.reportCredits <= 0) {
    return authError("解读次数不足，请开通会员", 402);
  }
  return null;
}

/** Get the cookie store for reading/writing auth cookies. */
export async function getAuthCookieStore() {
  return await cookies();
}
