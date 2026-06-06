"use client";

import { Card } from "@/components/ui/Card";
import { normalizeText } from "@/lib/normalizeText";
import type { MarriageResult as PairResult, SingleMarriageResult as SoloResult } from "@/lib/marriage";

type Props = {
  mode: "pair" | "solo";
  result: PairResult | SoloResult;
};

function display(value: unknown) {
  return normalizeText(String(value ?? ""));
}

function lines(text: string) {
  return display(text)
    .split(/\n+/)
    .map((line) => line.replace(/^[·△✓■\s]+/, "").trim())
    .filter(Boolean);
}

function ensureStop(text: string) {
  const clean = text.trim().replace(/[。；;,.，]+$/, "");
  return clean ? `${clean}。` : clean;
}

function formatEvidenceLine(line: string) {
  const text = display(line)
    .replace(/日支(.+?)\s*[·・]\s*属(.+?)\s*[·・]\s*此为配偶宫/g, "日支：$1；五行：$2；定位：配偶宫")
    .replace(/配偶星藏于地支\s*[·・]\s*缘分稍隐，节奏偏缓/g, "配偶星：藏于地支；状态：缘分稍隐；节奏：偏缓")
    .replace(/配偶星不显\s*[·・]\s*需要主动社交，等待大运引动/g, "配偶星：未明显透出；重点：主动社交，等待大运引动")
    .replace(/配偶星一位透干\s*[·・]\s*正缘清晰，方向明确/g, "配偶星：一位透干；状态：正缘方向较清晰")
    .replace(/桃花星未显\s*[·・]\s*理性克制，适合慢热发展/g, "桃花：未明显透出；节奏：理性慢热")
    .replace(/桃花位[:：]\s*(.+)$/g, "桃花位：$1")
    .replace(/\s*[·・]\s*/g, "；");

  return ensureStop(text);
}

function getSolo(result: PairResult | SoloResult) {
  return result as SoloResult;
}

function getPair(result: PairResult | SoloResult) {
  return result as PairResult;
}

function SoloResultView({ result }: { result: SoloResult }) {
  const palace = lines(result.details.marriagePalace?.text ?? "");
  const spouseStar = lines(result.details.spouseStar?.text ?? "");
  const romance = lines(result.details.romanceLuck?.text ?? "");
  const { pastYears, currentYear, futureYears, yearReasons } = result.timing;
  const portraitStarNames = result.spousePortrait.starNames ?? [];
  const portraitStarLabel = result.spousePortrait.starLabel ?? "配偶星";
  const portraitSurfaceCount = result.spousePortrait.surfaceCount ?? 0;
  const portraitHiddenCount = result.spousePortrait.hiddenCount ?? 0;

  return (
    <div className="space-y-5">
      <Card className="p-0">
        <div className="border-b border-divider px-6 py-6">
          <p className="text-[11px] font-medium tracking-[0.18em] text-ink-fade">姻缘解读</p>
          <h1 className="mt-2 text-3xl font-light tracking-[0.12em] text-ink dark:text-paper">
            {display(result.yuanType)}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-ink-light">{display(result.summary)}</p>
        </div>
        <div className="grid border-b border-divider md:grid-cols-4">
          {([
            ["日主", display(result.person.dayMaster), "命主自身，合婚参照核心"],
            ["主气", display(result.person.dominantElement), "五行属性，看元素互补"],
            ["生肖", display(result.person.zodiac), "属相匹配，看地支关系"],
            ["日支", display(result.person.dayBranch), "配偶宫位，看婚姻根基"],
          ] as const).map(([label, value, desc]) => (
            <div key={label} className="border-b border-divider px-6 py-5 md:border-b-0 md:border-r last:md:border-r-0">
              <p className="text-[11px] font-semibold tracking-[0.16em] text-ink-fade">{label}</p>
              <p className="mt-2 text-2xl font-light text-ink dark:text-paper">{value}</p>
              <p className="mt-1 text-[10px] leading-relaxed tracking-[0.08em] text-ink-fade">{desc}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <InsightCard
          number="01"
          title="婚姻宫"
          subtitle="关系相处的底色"
          evidence={formatEvidenceLine(palace[0] ?? "婚姻宫：平和稳定")}
          points={palace.slice(1, 3).map(formatEvidenceLine)}
          advice="婚姻宫看的是关系落地后的相处状态。若见冲、害、刑等信号，不代表关系不好，而是提醒感情中要重视沟通方式、边界感和情绪稳定度。"
        />
        <InsightCard
          number="02"
          title="配偶星"
          subtitle="伴侣缘分的节奏"
          evidence={formatEvidenceLine(spouseStar[0] ?? "配偶星：需要结合大运流年观察")}
          points={spouseStar.slice(1, 3).map(formatEvidenceLine)}
          advice="配偶星透出时，伴侣的特质更容易被看见；藏于地支时，往往需要更长的相处才能确认。适合从日常陪伴、合作或长期了解中逐渐显现。"
        />
        <InsightCard
          number="03"
          title="桃花运"
          subtitle="人际温度与机遇"
          evidence={formatEvidenceLine(romance[0] ?? "桃花位：需结合命盘判断")}
          points={romance.slice(1, 3).map(formatEvidenceLine)}
          advice="桃花看人际吸引力和感情机遇，不等于最终关系的质量。桃花强时要筛选，桃花弱时要主动创造连接场景，能否稳定下来仍需回到婚姻宫与配偶星共同判断。"
        />
      </div>

      <Card className="overflow-hidden p-0">
        {/* Header */}
        <div className="border-b border-divider px-6 py-5">
          <p className="text-[11px] font-medium tracking-[0.18em] text-ink-fade">感情节奏</p>
          <h2 className="mt-2 text-xl font-semibold tracking-[0.08em] text-ink dark:text-paper">大运流年引动</h2>
        </div>

        {/* 主叙述 */}
        <div className="border-b border-divider px-6 py-5">
          <p className="text-[14px] leading-[1.85] text-ink-light">{display(result.timing.text)}</p>
        </div>

        {/* 引动年份 */}
        <div className="px-6 py-5">
          {currentYear || futureYears.length > 0 ? (
            <div className="space-y-5">
              {/* 今年 */}
              {currentYear && (
                <div>
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-fade">今年</p>
                  <div className="flex items-start gap-4 rounded-lg bg-divider/30 px-5 py-4 dark:bg-divider/20">
                    <span className="mt-0.5 shrink-0 text-3xl font-light tracking-[0.04em] text-ink dark:text-paper">
                      {currentYear}
                    </span>
                    <div>
                      <p className="text-[14px] font-medium leading-[1.6] text-ink dark:text-paper">
                        {(yearReasons[currentYear] ?? "桃花或日支引动").split(" · ")[0]}
                      </p>
                      <p className="mt-1 text-[12px] leading-[1.7] text-ink-light">
                        {(yearReasons[currentYear] ?? "").split(" · ")[1] ?? "当前大运中的关键时段，感情层面的能见度提升，适合主动推进重要关系。"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 未来 */}
              {futureYears.length > 0 && (
                <div>
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-fade">
                    关注时段
                    {pastYears.length > 0 && (
                      <span className="ml-2 font-normal normal-case tracking-normal text-ink-fade">
                        过去参考：{pastYears.join("、")}
                      </span>
                    )}
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {futureYears.map((year) => (
                      <div
                        key={year}
                        className="flex items-center gap-4 rounded-lg bg-divider/30 px-5 py-4 dark:bg-divider/20"
                      >
                        <span className="shrink-0 text-2xl font-light tracking-[0.04em] text-ink dark:text-paper">
                          {year}
                        </span>
                        <span className="min-w-0 text-[12px] leading-[1.6]">
                          {(yearReasons[year] ?? "桃花或日支引动").split(" · ").map((part, i) =>
                            i === 0 ? (
                              <span key={i} className="text-ink dark:text-paper">{part}</span>
                            ) : (
                              <span key={i} className="text-ink-light"><br />{part}</span>
                            ),
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-lg bg-divider/30 px-5 py-5 text-center dark:bg-divider/20">
              <p className="text-[13px] leading-[1.7] text-ink-light">
                当前大运中暂无显著桃花星或日支合相引动，感情的节奏更多由日常经营和个人选择主导，不必强求某个固定节点。
              </p>
            </div>
          )}
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="border-b border-divider px-6 py-5">
          <p className="text-[11px] font-medium tracking-[0.18em] text-ink-fade">传统子平法参考</p>
          <h2 className="mt-2 text-xl font-semibold tracking-[0.08em] text-ink dark:text-paper">配偶星与配偶宫</h2>
        </div>

        {/* 五行 + 描述：左右并排 */}
        <div className="border-b border-divider px-6 py-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex shrink-0 items-center justify-center self-start rounded-xl bg-divider/30 px-10 py-7 dark:bg-divider/20">
              <div className="text-center">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-fade">配偶星类别</p>
                <p className="mt-2 text-3xl font-light tracking-[0.08em] text-ink dark:text-paper">{display(portraitStarLabel)}</p>
              </div>
            </div>
            <p className="self-center text-[14px] leading-[1.85] text-ink-light">
              {display(result.spousePortrait.text)}
            </p>
          </div>
        </div>

        {/* 四项命盘依据 */}
        <div className="grid sm:grid-cols-2">
          <PortraitItem title="配偶星" text={`${display(portraitStarLabel)}：${portraitStarNames.map(display).join("、") || "请重新测算以更新"}`} />
          <PortraitItem title="天干透出" text={`${portraitSurfaceCount} 次；透干表示配偶星信息较显。`} />
          <PortraitItem title="地支藏干" text={`${portraitHiddenCount} 次；藏支表示信息较隐，需结合时运。`} />
          <PortraitItem title="配偶宫" text={result.spousePortrait.inPalace ? "日支藏有配偶星，两者存在直接联系。" : "日支未藏配偶星，不宜仅凭配偶宫推断伴侣特质。"} />
        </div>
      </Card>
    </div>
  );
}

function PairResultView({ result }: { result: PairResult }) {
  const dims = result.dimensions ?? [];
  const rizhu = dims[0]; // 日柱关系
  const wuxing = dims[1]; // 五行互补
  const rest = dims.slice(2); // 纳音、生肖、大运、财官

  return (
    <div className="space-y-4">
      {/* 顶部：双方信息 + 判定 */}
      <div className="overflow-hidden rounded-2xl border border-divider bg-card">
        {/* 双人信息 */}
        <div className="grid md:grid-cols-2">
          {result.people.map((person, i) => (
            <div
              key={display(person.name)}
              className={`px-6 py-5 ${i === 0 ? "border-b border-divider md:border-b-0 md:border-r" : ""}`}
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-fade">
                {display(person.name)}
                <span className="ml-2 font-normal normal-case tracking-normal text-ink-fade">
                  {person.gender === "male" ? "男" : "女"} · {display(person.birthDate)} · {person.birthHour}时
                </span>
              </p>

              {/* 四柱八字 */}
              <div className="mt-3 flex gap-1.5">
                {(["年", "月", "日", "时"] as const).map((label, j) => (
                  <div key={label} className="flex-1 rounded-md bg-divider/20 px-2 py-1.5 text-center dark:bg-divider/10">
                    <p className="text-[9px] uppercase tracking-[0.12em] text-ink-fade">{label}</p>
                    <p className="mt-0.5 text-[13px] font-medium tracking-[0.04em] text-ink dark:text-paper">
                      {person.pillars?.[j] ?? "—"}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-ink-light">
                <span>日主{display(person.dayMaster)}</span>
                <span>主气{person.dominantElement}</span>
                <span>生肖{display(person.zodiac)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* 判定 + 指标 */}
        <div className="border-t border-divider px-6 py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="shrink-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-fade">合盘判定</p>
              <p className="mt-2 text-2xl font-semibold tracking-[0.08em] text-ink dark:text-paper">
                {display(result.yuanType)}
              </p>
            </div>
            <div className="min-w-0 flex-1 pt-[1.35rem]">
              <p className="text-[13px] leading-[1.8] text-ink-light">{display(result.summary)}</p>
              {/* 关键指标 */}
              <div className="mt-3 flex flex-wrap gap-2">
                {(dims[0]?.findings ?? []).concat(dims[1]?.findings ?? []).filter((f) => f.level === "吉").slice(0, 3).map((f) => (
                  <span key={f.label} className="rounded-lg bg-ink px-2.5 py-1 text-[11px] font-medium text-paper dark:bg-paper dark:text-ink">
                    {f.label}
                  </span>
                ))}
                {(dims[0]?.findings ?? []).concat(dims[1]?.findings ?? []).filter((f) => f.level === "慎").slice(0, 2).map((f) => (
                  <span key={f.label} className="rounded-lg border border-divider px-2.5 py-1 text-[11px] font-medium text-ink-light">
                    {f.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 日柱关系 — 核心大卡 */}
      {rizhu && (
        <div className="overflow-hidden rounded-2xl border border-divider bg-card">
          <div className="border-b border-divider px-6 py-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-fade">核心匹配</p>
            <h2 className="mt-1 text-lg font-semibold tracking-[0.08em] text-ink dark:text-paper">{rizhu.title}</h2>
          </div>
          <div className="px-6 py-5">
            {/* 对比 */}
            <div className="flex flex-wrap gap-4">
              {rizhu.compare.map((row) => (
                <div key={row.label} className="flex items-center gap-2 rounded-lg bg-divider/20 px-4 py-2 dark:bg-divider/10">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-ink-fade">{row.label}</span>
                  <span className="text-[13px] font-medium text-ink dark:text-paper">{row.a}</span>
                  <span className="text-[11px] text-ink-fade">—</span>
                  <span className="text-[13px] font-medium text-ink dark:text-paper">{row.b}</span>
                </div>
              ))}
            </div>
            {/* 发现 */}
            <div className="mt-4 flex flex-wrap gap-2">
              {rizhu.findings.map((f) => (
                <span
                  key={f.label}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium ${
                    f.level === "吉"
                      ? "bg-ink text-paper dark:bg-paper dark:text-ink"
                      : f.level === "慎"
                        ? "border border-divider bg-divider/20 text-ink dark:text-paper"
                        : "text-ink-fade"
                  }`}
                >
                  {f.label}：{f.detail}
                </span>
              ))}
            </div>
            {/* 解读 */}
            <p className="mt-4 text-[13px] leading-[1.85] text-ink-light">{display(rizhu.text)}</p>
          </div>
        </div>
      )}

      {/* 五行关系 */}
      {wuxing && (
        <div className="animate-yx-fade-up overflow-hidden rounded-2xl border border-divider bg-card" style={{ animationDelay: "160ms" }}>
          <div className="border-b border-divider px-6 py-4">
            <h2 className="text-lg font-semibold tracking-[0.08em] text-ink dark:text-paper">五行关系</h2>
          </div>
          <div className="px-6 py-5">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex shrink-0 items-center gap-3">
                <ElementCard
                  name={result.people[0]?.name}
                  element={wuxing.compare[0]?.a ?? ""}
                />
                <span className="text-lg text-ink-fade">→</span>
                <ElementCard
                  name={result.people[1]?.name}
                  element={wuxing.compare[0]?.b ?? ""}
                />
              </div>
              <div className="min-w-0 flex-1 self-center">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-fade">关系判断</p>
                <p className="mt-1 text-[15px] font-medium text-ink dark:text-paper">
                  {display(wuxing.text).split(" · ")[0]}
                </p>
                <p className="mt-2 text-[13px] leading-[1.8] text-ink-light">
                  {display(wuxing.text).split(" · ").slice(1).join(" · ")}
                </p>
                {/* 五行分布 */}
                {wuxing.compare.length > 1 && wuxing.compare[1] && (
                  <div className="animate-yx-fade-up mt-3 flex flex-wrap gap-2">
                    {([
                      ["木", "#4A9E4A"],
                      ["火", "#D94A4A"],
                      ["土", "#C4A24A"],
                      ["金", "#C4B94A"],
                      ["水", "#4A7AB5"],
                    ] as const).map(([el, color]) => {
                      const matchA = (wuxing.compare[1]?.a ?? "").match(new RegExp(`(\\d+)${el}`));
                      const matchB = (wuxing.compare[1]?.b ?? "").match(new RegExp(`(\\d+)${el}`));
                      return (
                        <span
                          key={el}
                          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px]"
                          style={{ backgroundColor: `${color}15`, color }}
                        >
                          <span
                            className="inline-block h-2 w-2 shrink-0 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                          {el}
                          <span className="tabular-nums">{matchA?.[1] ?? "-"}</span>
                          <span className="text-[9px] opacity-50">/</span>
                          <span className="tabular-nums">{matchB?.[1] ?? "-"}</span>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 其余四项 — 两两并排 */}
      <div className="grid gap-4 sm:grid-cols-2">
        {rest.map((dim, i) => (
          <div key={dim.title} className="animate-yx-fade-up overflow-hidden rounded-2xl border border-divider bg-card" style={{ animationDelay: `${240 + i * 80}ms` }}>
            <div className="border-b border-divider px-5 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold tracking-[0.08em] text-ink dark:text-paper">{dim.title}</h3>
                <div className="flex gap-1.5">
                  {dim.findings.map((f) => (
                    <span
                      key={f.label}
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] ${
                        f.level === "合"
                          ? "bg-divider/40 text-ink dark:bg-divider/30 dark:text-paper"
                          : f.level === "吉"
                            ? "bg-divider/30 text-ink dark:bg-divider/20 dark:text-paper"
                            : f.level === "冲"
                              ? "border border-divider text-ink dark:text-paper"
                              : f.level === "慎"
                                ? "text-ink-light dark:text-ink-fade"
                                : "text-ink-fade"
                      }`}
                    >
                      {f.level}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-5 py-4">
              {dim.compare.map((row) => (
                <div key={row.label} className="mb-2 flex items-baseline gap-2 text-[12px]">
                  <span className="shrink-0 text-ink-fade">{row.label}</span>
                  <span className="font-medium text-ink dark:text-paper">{row.a}</span>
                  <span className="text-ink-fade">·</span>
                  <span className="font-medium text-ink dark:text-paper">{row.b}</span>
                </div>
              ))}
              <p className="mt-3 text-[12px] leading-[1.75] text-ink-light">{display(dim.text)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InsightCard({
  number,
  title,
  subtitle,
  evidence,
  points,
  advice,
}: {
  number: string;
  title: string;
  subtitle: string;
  evidence: string;
  points: string[];
  advice: string;
}) {
  return (
    <Card className="overflow-hidden p-0">
      {/* Header */}
      <div className="border-b border-divider px-6 py-5">
        <div className="flex items-baseline gap-3">
          <span className="text-[10px] font-semibold tracking-[0.2em] text-ink-fade">{number}</span>
          <h2 className="text-lg font-semibold tracking-[0.08em] text-ink dark:text-paper">{title}</h2>
        </div>
        <p className="mt-1.5 text-[13px] leading-6 text-ink-light">{subtitle}</p>
      </div>

      {/* Evidence — highlighted block */}
      <div className="mx-5 mt-5 rounded-lg bg-divider/30 px-4 py-4 dark:bg-divider/20">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-fade">命理依据</p>
        <p className="text-[14px] font-medium leading-[1.85] text-ink dark:text-paper">{evidence}</p>
      </div>

      {/* Points */}
      {points.length > 0 && (
        <div className="mx-5 mt-4">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-fade">判断重点</p>
          <div className="space-y-2">
            {points.map((point) => (
              <p key={point} className="border-l-2 border-divider pl-4 text-[13px] leading-[1.75] text-ink-light">
                {point}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Advice — soft footer */}
      <div className="mx-5 mb-5 mt-4 rounded-lg border border-divider bg-paper/60 px-4 py-4 dark:bg-paper/5">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-fade">关系建议</p>
        <p className="text-[13px] leading-[1.8] text-ink-light">{advice}</p>
      </div>
    </Card>
  );
}


const elementColor: Record<string, string> = {
  "木": "#4A9E4A",
  "火": "#D94A4A",
  "土": "#C4A24A",
  "金": "#C4B94A",
  "水": "#4A7AB5",
};

const elementIcon: Record<string, string> = {
  "木": "🌱",
  "火": "🔥",
  "土": "⛰",
  "金": "✦",
  "水": "💧",
};

function ElementCard({ name, element }: { name?: string; element: string }) {
  const color = elementColor[element] ?? "#999";
  return (
    <div className="relative rounded-xl bg-divider/20 px-5 py-3.5 text-center dark:bg-divider/10">
      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-ink-fade">
        {name ?? ""}
      </p>
      <p
        className="mt-1.5 text-3xl font-light tracking-[0.04em]"
        style={{ color }}
      >
        {element}
      </p>
      <span className="absolute bottom-1.5 right-1.5 text-[11px] leading-none opacity-50">
        {elementIcon[element] ?? ""}
      </span>
    </div>
  );
}

function PortraitItem({ title, text }: { title: string; text: string }) {
  return (
    <div className="border-b border-divider px-5 py-5 sm:odd:border-r">
      <span className="inline-block rounded-lg border border-divider px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-ink-fade">
        {title}
      </span>
      <p className="mt-3 text-[13px] leading-[1.75] text-ink-light">{text}</p>
    </div>
  );
}

export function MarriageResult({ mode, result }: Props) {
  if (mode === "solo") {
    return <SoloResultView result={getSolo(result)} />;
  }

  return <PairResultView result={getPair(result)} />;
}
