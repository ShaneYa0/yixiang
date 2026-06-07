import { NextRequest, NextResponse } from "next/server";
import { castIching, getIchingFreeReading, type LineValue } from "@/lib/iching";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const question: string = body.question ?? "";
  const lines: LineValue[] = body.lines ?? [];

  if (!Array.isArray(lines) || lines.length !== 6) {
    return NextResponse.json({ error: "需要6条爻值（0-3）" }, { status: 400 });
  }

  const result = castIching(lines);
  const reading = getIchingFreeReading(result);

  return NextResponse.json({ ...result, reading });
}
