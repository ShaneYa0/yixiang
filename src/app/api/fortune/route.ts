import { NextResponse } from "next/server";
import { getDailyFortune } from "@/lib/templates/fortune";
import { cacheGetOrSet, dailyKey } from "@/lib/cache";

// Cache TTL: 1 hour (daily fortune doesn't change within a day)
const TTL = 3600;

export async function GET() {
  const today = new Date();
  const key = dailyKey("fortune", today);

  const fortune = await cacheGetOrSet(key, TTL, () => getDailyFortune(today));
  return NextResponse.json(fortune);
}
