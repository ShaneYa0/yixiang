declare module "lunar-javascript" {
  export class Solar {
    static fromYmdHms(year: number, month: number, day: number, hour: number, minute: number, second: number): Solar;
    getLunar(): Lunar;
    toYmd(): string;
  }

  export class Lunar {
    toString(): string;
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getYearInGanZhi(): string;
    getYearInGanZhiExact(): string;
    getMonthInGanZhi(): string;
    getMonthInGanZhiExact(): string;
    getDayInGanZhi(): string;
    getDayInGanZhiExact(): string;
    getTimeInGanZhi(): string;
    getYearShengXiao(): string;
    getMonthInChinese(): string;
    getDayInChinese(): string;
    getJieQi(): string;
    getPrevJieQi(): { toString(): string };
    getNextJieQi(): { toString(): string };
    getDayYi(sect?: number): string[];
    getDayJi(sect?: number): string[];
    getDayJiShen(): string[];
    getDayXiongSha(): string[];
    getPengZuGan(): string;
    getPengZuZhi(): string;
    getDayChongDesc(): string;
    getDaySha(): string;
    getDayPositionXiDesc(): string;
    getDayPositionFuDesc(sect?: number): string;
    getDayPositionCaiDesc(): string;
    getDayPositionYangGuiDesc(): string;
    getDayPositionYinGuiDesc(): string;
    getDayPositionTai(): string;
    getEightChar(): EightChar;
  }

  export class EightChar {
    getYear(): string;
    getMonth(): string;
    getDay(): string;
    getTime(): string;
    getYearNaYin(): string;
    getMonthNaYin(): string;
    getDayNaYin(): string;
    getTimeNaYin(): string;
    getYearShiShenGan(): string;
    getMonthShiShenGan(): string;
    getDayShiShenGan(): string;
    getTimeShiShenGan(): string;
    getYearShiShenZhi(): string[];
    getMonthShiShenZhi(): string[];
    getDayShiShenZhi(): string[];
    getTimeShiShenZhi(): string[];
    getTaiYuan(): string;
    getMingGong(): string;
    getShenGong(): string;
    getYearXunKong(): string;
    getMonthXunKong(): string;
    getDayXunKong(): string;
    getTimeXunKong(): string;
    getYun(gender: number, sect?: number): Yun;
  }

  export class Yun {
    getStartYear(): number;
    getStartMonth(): number;
    getStartDay(): number;
    getStartHour(): number;
    getStartSolar(): Solar;
    getDaYun(count?: number): DaYun[];
  }

  export class DaYun {
    getIndex(): number;
    getGanZhi(): string;
    getStartYear(): number;
    getEndYear(): number;
    getStartAge(): number;
    getEndAge(): number;
    getLiuNian(count?: number): LiuNian[];
  }

  export class LiuNian {
    getYear(): number;
    getAge(): number;
    getGanZhi(): string;
  }
}
