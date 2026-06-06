import type { Metadata } from "next";
import { HuangliCalendar } from "@/components/huangli/HuangliCalendar";
import { HuangliDetails } from "@/components/huangli/HuangliDetails";
import { getLunarDate } from "@/lib/calendar";

export const metadata: Metadata = {
  title: "黄历 - 易象",
  description: "查询每日黄历，包含农历干支、节气、宜忌、吉神凶煞、喜神财神方位等传统择日信息。",
  openGraph: {
    title: "黄历 - 易象",
    description: "查询每日黄历，包含农历干支、节气、宜忌、吉神凶煞、喜神财神方位等传统择日信息。",
  },
};

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function buildHuangliData(date: Date) {
  const lunar = getLunarDate(date);

  return {
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
  };
}

export default async function HuangliPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const params = await searchParams;
  const selectedDate = params.date ?? formatDate(new Date());
  const date = new Date(`${selectedDate}T12:00:00`);
  const data = buildHuangliData(date);

  return (
    <div className="pt-4">
      <HuangliCalendar date={selectedDate} />
      <HuangliDetails data={data} />
    </div>
  );
}
