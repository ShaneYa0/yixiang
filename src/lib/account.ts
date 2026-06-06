import type { User as SupabaseUser } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";

export async function ensureAppUser(user: SupabaseUser) {
  const email = user.email;
  if (!email) throw new Error("Supabase user has no email");

  return prisma.user.upsert({
    where: { id: user.id },
    update: { email },
    create: {
      id: user.id,
      email,
      reportCredits: 1,
      trialEndsAt: new Date(Date.now() + 86400000), // 1 day free trial
    },
  });
}
