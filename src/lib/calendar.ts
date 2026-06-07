import { Solar } from "lunar-javascript";

export function getLunarDate(date: Date) {
  const lunar = Solar.fromYmdHms(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
  ).getLunar();
  const jieQi = lunar.getJieQi();

  return {
    year: lunar.getYear(),
    month: lunar.getMonth(),
    day: lunar.getDay(),
    yearInGanZhi: lunar.getYearInGanZhi(),
    yearInGanZhiExact: lunar.getYearInGanZhiExact(),
    monthInGanZhi: lunar.getMonthInGanZhi(),
    monthInGanZhiExact: lunar.getMonthInGanZhiExact(),
    dayInGanZhi: lunar.getDayInGanZhi(),
    dayInGanZhiExact: lunar.getDayInGanZhiExact(),
    timeInGanZhi: lunar.getTimeInGanZhi(),
    yearShengXiao: lunar.getYearShengXiao(),
    dayNaYin: (lunar as unknown as { getDayNaYin: () => string }).getDayNaYin(),
    dayLu: (lunar as unknown as { getDayLu: () => string }).getDayLu(),
    lunarText: lunar.toString(),
    lunarMonthName: `${lunar.getMonthInChinese()}月`,
    lunarDayName: lunar.getDayInChinese(),
    solarTerm: jieQi || null,
    prevSolarTerm: lunar.getPrevJieQi().toString(),
    nextSolarTerm: lunar.getNextJieQi().toString(),
    dayYi: lunar.getDayYi(),
    dayJi: lunar.getDayJi(),
    dayJiShen: lunar.getDayJiShen(),
    dayXiongSha: lunar.getDayXiongSha(),
    pengZu: [lunar.getPengZuGan(), lunar.getPengZuZhi()],
    chong: lunar.getDayChongDesc(),
    sha: lunar.getDaySha(),
    tai: lunar.getDayPositionTai(),
    dayPosition: {
      xi: lunar.getDayPositionXiDesc(),
      fu: lunar.getDayPositionFuDesc(),
      cai: lunar.getDayPositionCaiDesc(),
      yangGui: lunar.getDayPositionYangGuiDesc(),
      yinGui: lunar.getDayPositionYinGuiDesc(),
    },
  };
}
