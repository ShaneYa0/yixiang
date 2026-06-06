import { NextRequest, NextResponse } from "next/server";
import { generateFortuneReport } from "@/lib/ai";

export async function POST(req: NextRequest) {
  const { type, userData, isVip } = await req.json().catch(() => ({}));

  if (!isVip) {
    return NextResponse.json({ error: "此功能为 VIP 专属" }, { status: 403 });
  }
  if (!["bazi", "marriage", "iching", "fortune"].includes(type)) {
    return NextResponse.json({ error: "无效的报告类型" }, { status: 400 });
  }

  try {
    const report = await generateFortuneReport(type, userData);
    return NextResponse.json({ report });
  } catch {
    return NextResponse.json({ error: "深度解读准备失败，请稍后重试" }, { status: 500 });
  }
}
