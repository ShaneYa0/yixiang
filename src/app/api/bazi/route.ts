import { NextRequest, NextResponse } from "next/server";
import { calculateBazi } from "@/lib/bazi";
import { getBaziFreeReading } from "@/lib/templates/bazi";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.birthDate || typeof body.birthHour !== "number") {
    return NextResponse.json({ error: "请填写出生日期和时辰" }, { status: 400 });
  }

  const result = calculateBazi({
    birthDate: body.birthDate,
    birthHour: body.birthHour,
    gender: body.gender === "female" ? "female" : "male",
  });

  return NextResponse.json({ ...result, reading: getBaziFreeReading(result) });
}
