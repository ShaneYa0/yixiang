import { NextRequest, NextResponse } from "next/server";
import { calculateMarriage, calculateSingleMarriage } from "@/lib/marriage";
import { getMarriageFreeReading } from "@/lib/templates/marriage";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "请提供测算信息" }, { status: 400 });
  }

  // Solo mode: single-person marriage analysis
  if (body.mode === "solo") {
    if (!body.solo?.birthDate) {
      return NextResponse.json({ error: "请填写出生信息" }, { status: 400 });
    }
    const result = calculateSingleMarriage(body.solo);
    return NextResponse.json({
      mode: "solo",
      result,
      reading: getMarriageFreeReading(result),
    });
  }

  // Pair mode (default): two-person compatibility
  if (!body.personA?.birthDate || !body.personB?.birthDate) {
    return NextResponse.json({ error: "请填写双方出生信息" }, { status: 400 });
  }

  const result = calculateMarriage(body.personA, body.personB);
  return NextResponse.json({
    mode: "pair",
    result,
    reading: getMarriageFreeReading(result),
  });
}
