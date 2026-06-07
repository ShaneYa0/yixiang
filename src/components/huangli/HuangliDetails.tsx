import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";

type HuangliData = {
  solar: { year: number; month: number; day: number };
  lunar: { month: string; day: string; yearInGanZhi: string; yearInGanZhiExact: string; monthInGanZhi: string; monthInGanZhiExact: string; dayInGanZhi: string; dayInGanZhiExact: string; timeInGanZhi: string; yearShengXiao: string; solarTerm: string | null; prevSolarTerm: string; nextSolarTerm: string };
  almanac: { yi: string[]; ji: string[]; jiShen: string[]; xiongSha: string[]; pengZu: string[]; chong: string; sha: string; tai: string; xiShen: string; fuShen: string; caiShen: string; yangGui: string; yinGui: string };
};

function Tags({ items, muted = false }: { items: string[]; muted?: boolean }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={item} className={`px-2 py-1 text-[11px] tracking-[0.1em] ${muted ? "bg-divider/20 text-ink-light" : "bg-divider/40 text-ink"}`}>
          {item}
        </span>
      ))}
    </div>
  );
}

export function HuangliDetails({ data }: { data: HuangliData }) {
  return (
    <div className="space-y-5">
      <div className="text-center">
        <div className="text-xs tracking-[0.15em] text-ink-fade">
          {data.lunar.yearInGanZhiExact}年 · {data.lunar.monthInGanZhiExact}月 · {data.lunar.dayInGanZhiExact}日
        </div>
        <div className="mt-2 text-2xl font-thin tracking-[0.25em] text-ink">
          {data.lunar.month}{data.lunar.day}
        </div>
        <div className="mt-1 text-xs text-ink-soft">
          生肖{data.lunar.yearShengXiao} · {data.lunar.solarTerm ? `今日节气：${data.lunar.solarTerm}` : `节气：${data.lunar.prevSolarTerm}后，${data.lunar.nextSolarTerm}前`}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <SectionTitle>宜</SectionTitle>
          <Tags items={data.almanac.yi} />
        </Card>
        <Card>
          <SectionTitle>忌</SectionTitle>
          <Tags items={data.almanac.ji} muted />
        </Card>
        <Card>
          <SectionTitle>吉神</SectionTitle>
          {data.almanac.jiShen.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {data.almanac.jiShen.map((s) => (
                <span key={s} className="bg-emerald-50 px-2 py-0.5 text-[11px] tracking-[0.1em] text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {s}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-ink-light">—</p>
          )}
        </Card>
        <Card>
          <SectionTitle>凶煞</SectionTitle>
          {data.almanac.xiongSha.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {data.almanac.xiongSha.map((s) => (
                <span key={s} className="bg-red-50 px-2 py-0.5 text-[11px] tracking-[0.1em] text-red-700 dark:bg-red-950 dark:text-red-300">
                  {s}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-ink-light">—</p>
          )}
        </Card>
        <Card>
          <SectionTitle>冲煞</SectionTitle>
          <p className="text-[13px] leading-7 text-ink-light">冲：{data.almanac.chong} · 煞{data.almanac.sha}</p>
          <p className="mt-2 text-[12px] leading-6 text-ink-fade">占方：{data.almanac.tai}</p>
        </Card>
        <Card>
          <SectionTitle>彭祖百忌</SectionTitle>
          <p className="text-[13px] leading-7 text-ink-light">{data.almanac.pengZu.join("；")}</p>
        </Card>
        <Card className="sm:col-span-2">
          <SectionTitle>吉神方位</SectionTitle>
          <div className="grid gap-3 text-[13px] tracking-[0.08em] text-ink-light sm:grid-cols-5">
            <span>喜神：{data.almanac.xiShen}</span>
            <span>福神：{data.almanac.fuShen}</span>
            <span>财神：{data.almanac.caiShen}</span>
            <span>阳贵：{data.almanac.yangGui}</span>
            <span>阴贵：{data.almanac.yinGui}</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
