import { NextRequest, NextResponse } from "next/server";
import { calculateBazi } from "@/lib/bazi";
import { buildBaziDeepReport } from "@/lib/bazi-deep-report";
import { resolveAuthUser, authError } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.birthDate || typeof body.birthHour !== "number") {
    return NextResponse.json({ error: "请提供有效的出生信息" }, { status: 400 });
  }

  const input = {
    birthDate: body.birthDate as string,
    birthHour: body.birthHour as number,
    gender: body.gender === "female" ? ("female" as const) : ("male" as const),
  };

  const user = await resolveAuthUser();
  if (!user) return authError("请先登录后查看深度详批");

  const result = calculateBazi(input);
  const report = buildBaziDeepReport(result);

  // Persist report to DB when Supabase is configured
  if (isSupabaseConfigured()) {
    try {
      await prisma.baziDeepReport.create({
        data: {
          id: report.id,
          userId: user.id,
          birthDate: new Date(`${input.birthDate}T${String(input.birthHour).padStart(2, "0")}:00:00`),
          birthHour: input.birthHour,
          gender: input.gender,
          report: report as unknown as object,
        },
      });
    } catch {
      // DB save is optional — report still returns to user
    }
  }

  return NextResponse.json({ report });
}
