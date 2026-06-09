import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ensureAppUser } from "@/lib/account";
import { getLocalUser } from "@/lib/local-auth";
import { createServerSupabase, isSupabaseConfigured } from "@/lib/supabase/server";

/** Unified user object returned by resolveAuthUser — works for both local-dev and Supabase modes. */
export type AuthUser = {
  id: string;
  email: string;
  isLocal: boolean;
};

// ---- user resolution ----

export async function resolveAuthUser(): Promise<AuthUser | null> {
  try {
    if (!isSupabaseConfigured()) {
      const localUser = await getLocalUser();
      if (!localUser) return null;
      return {
        id: localUser.id,
        email: localUser.email,
        isLocal: true,
      };
    }

    const supabase = await createServerSupabase();
    const { data } = await supabase.auth.getUser();
    if (!data.user) return null;

    const appUser = await ensureAppUser(data.user);
    return {
      id: appUser.id,
      email: appUser.email,
      isLocal: false,
    };
  } catch {
    // Supabase / Prisma 外网请求可能因为网络波动、冷启动等失败，
    // 返回 null 让页面正常渲染，用户看到未登录状态即可
    return null;
  }
}

// ---- response helpers ----

export function authError(message: string, status: 401 | 402 | 403 = 401) {
  return NextResponse.json({ error: message }, { status });
}

// ---- cookie helpers ----

/** Get the cookie store for reading/writing auth cookies. */
export async function getAuthCookieStore() {
  return await cookies();
}
