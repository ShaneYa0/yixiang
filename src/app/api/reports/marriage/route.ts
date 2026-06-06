import { NextRequest, NextResponse } from "next/server";
import { resolveAuthUser, authError } from "@/lib/auth-utils";
import { buildSoloDeepReport, buildPairDeepReport } from "@/lib/marriage-deep-report";
import { prisma } from "@/lib/prisma";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.result) {
    return NextResponse.json({ error: "请提供测算结果" }, { status: 400 });
  }

  const user = await resolveAuthUser();
  if (!user) return authError("请先登录后查看深度解读");
  if (!user.isVip) return authError("深度解读为会员专属内容，请先开通会员", 402);

  let report;

  if (body.mode === "solo") {
    const input = body.input?.solo ?? body.input;
    report = buildSoloDeepReport(body.result, input);
  } else if (body.mode === "pair") {
    const inputs = body.inputs ?? body.input;
    report = buildPairDeepReport(body.result, inputs);
  } else {
    return NextResponse.json({ error: "请提供有效的模式" }, { status: 400 });
  }

  if (isSupabaseConfigured()) {
    try {
      await prisma.baziDeepReport.create({
        data: {
          id: report.id,
          userId: user.id,
          birthDate: new Date(),
          birthHour: 0,
          gender: "male",
          source: "subscription",
          priceCents: 0,
          report: report as unknown as object,
        },
      });
    } catch { /* non-critical */ }
  }

  return NextResponse.json({ report });
}
