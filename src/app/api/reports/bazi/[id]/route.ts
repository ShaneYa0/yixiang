import { NextRequest, NextResponse } from "next/server";
import { resolveAuthUser, authError } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "本地开发模式请从当前浏览器会话读取报告" }, { status: 404 });
  }

  const user = await resolveAuthUser();
  if (!user) return authError("请先登录");

  const report = await prisma.baziDeepReport.findFirst({
    where: { id, userId: user.id },
  });

  if (!report) {
    return NextResponse.json({ error: "报告不存在" }, { status: 404 });
  }

  return NextResponse.json({ report: report.report });
}
