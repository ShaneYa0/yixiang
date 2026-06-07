import { NextRequest, NextResponse } from "next/server";
import { castIching, getIchingFreeReading } from "@/lib/iching";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const result = castIching(body.question ?? "", body.yao);
  return NextResponse.json({ ...result, reading: getIchingFreeReading(result) });
}
