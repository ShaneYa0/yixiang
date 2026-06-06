import { NextRequest, NextResponse } from "next/server";
import { getLunarDate } from "@/lib/calendar";
import { cacheGetOrSet, dailyKey } from "@/lib/cache";

// Cache TTL: 1 hour (daily almanac data doesn't change within a day)
const TTL = 3600;

export async function GET(req: NextRequest) {
  const dateStr = new URL(req.url).searchParams.get("date");
  const date = dateStr ? new Date(`${dateStr}T12:00:00`) : new Date();
  const key = dailyKey("huangli", date);

  const lunar = await cacheGetOrSet(key, TTL, () => getLunarDate(date));

  return NextResponse.json({
    solar: { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() },
    lunar: {
      year: lunar.year,
      month: lunar.lunarMonthName,
      day: lunar.lunarDayName,
      yearInGanZhi: lunar.yearInGanZhi,
      yearInGanZhiExact: lunar.yearInGanZhiExact,
      monthInGanZhi: lunar.monthInGanZhi,
      monthInGanZhiExact: lunar.monthInGanZhiExact,
      dayInGanZhi: lunar.dayInGanZhi,
      dayInGanZhiExact: lunar.dayInGanZhiExact,
      timeInGanZhi: lunar.timeInGanZhi,
      yearShengXiao: lunar.yearShengXiao,
      solarTerm: lunar.solarTerm,
      prevSolarTerm: lunar.prevSolarTerm,
      nextSolarTerm: lunar.nextSolarTerm,
    },
    almanac: {
      yi: lunar.dayYi,
      ji: lunar.dayJi,
      jiShen: lunar.dayJiShen,
      xiongSha: lunar.dayXiongSha,
      pengZu: lunar.pengZu,
      chong: lunar.chong,
      sha: lunar.sha,
      tai: lunar.tai,
      xiShen: lunar.dayPosition.xi,
      fuShen: lunar.dayPosition.fu,
      caiShen: lunar.dayPosition.cai,
      yangGui: lunar.dayPosition.yangGui,
      yinGui: lunar.dayPosition.yinGui,
    },
  });
}
