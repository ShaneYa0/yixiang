import type { User as SupabaseUser } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";

export async function ensureAppUser(user: SupabaseUser) {
  const email = user.email;
  if (!email) throw new Error("Supabase user has no email");

  try {
    return await prisma.user.upsert({
      where: { id: user.id },
      update: { email },
      create: {
        id: user.id,
        email,
      },
    });
  } catch {
    // Return Supabase user data if Prisma DB is unreachable
    return {
      id: user.id,
      email,
      createdAt: new Date(),
    };
  }
}
