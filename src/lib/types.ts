export type ElementName = "木" | "火" | "土" | "金" | "水";

export type Pillar = {
  label: string;
  ganZhi: string;
  nayin: string;
  element: ElementName;
  tenGod: string;
  hiddenTenGods: string[];
  xunKong: string;
};

export type BaziResult = {
  birthDate: string;
  birthHour: number;
  gender: "male" | "female";
  lunarText: string;
  zodiac: string;
  solarTerm: string;
  prevSolarTerm: string;
  nextSolarTerm: string;
  dayMaster: string;
  pillars: Pillar[];
  elements: Record<ElementName, number>;
  dominantElement: ElementName;
  missingElements: ElementName[];
  strength: "偏弱" | "中和" | "偏旺";
  usefulElements: ElementName[];
  taiYuan: string;
  mingGong: string;
  shenGong: string;
  professionalReport: {
    structure: string;
    dayMaster: string;
    career: string;
    wealth: string;
    relationship: string;
    health: string;
  };
  luck: {
    startText: string;
    currentCycle?: LuckCycle;
    cycles: LuckCycle[];
  };
  summary: string;
};

export type LuckCycle = {
  index: number;
  ganZhi: string;
  startYear: number;
  endYear: number;
  startAge: number;
  endAge: number;
  element: ElementName;
  theme: string;
  years: {
    year: number;
    age: number;
    ganZhi: string;
  }[];
};

export type FortuneResult = {
  date: string;
  lunarDate: string;
  dayPillar: string;
  dayElement: string;
  dayNayin: string;
  dayLu: string;
  level: string;
  score: number;
  summary: string;
  keywords: string[];
  proverb: string;
  luckyHours: string[];
  luckyColor: string;
  luckyDirection: string;
  zodiacGuide: {
    clash: string;
    harmony: string;
    tripleHarmony: string;
  };
  details: { label: string; value: number; text: string }[];
};
