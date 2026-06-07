import { isChanging, isYin, type LineValue } from "@/lib/iching";

export const YAO_POSITION_NAMES = ["初爻", "二爻", "三爻", "四爻", "五爻", "上爻"] as const;

const LINE_NAMES: Record<LineValue, string> = { 0: "老阴", 1: "少阴", 2: "少阳", 3: "老阳" };

export function HexagramLines({
  lines,
  activeIndex,
  compact = false,
}: {
  lines: readonly (LineValue | undefined)[];
  activeIndex?: number;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "space-y-2.5" : "space-y-3"}>
      {[5, 4, 3, 2, 1, 0].map((index) => {
        const value = lines[index];
        const revealed = value !== undefined;
        const yin = revealed && isYin(value);
        const changing = revealed && isChanging(value);
        const active = activeIndex === index;

        return (
          <div key={index} className={`grid grid-cols-[3rem_1fr_4.25rem] items-center gap-4 rounded-sm px-3 transition duration-500 ${compact ? "min-h-9" : "min-h-11"} ${active ? "bg-[#b68a3a]/10 ring-1 ring-[#b68a3a]/25" : ""}`}>
            <span className={`text-right text-[10px] tracking-[0.18em] ${active ? "text-[#9a712e]" : "text-ink-fade"}`}>
              {YAO_POSITION_NAMES[index]}
            </span>
            <div className={`flex items-center ${compact ? "h-5" : "h-6"}`}>
              {!revealed ? (
                <div className="w-full border-b border-dashed border-ink/15" />
              ) : yin ? (
                <div className="flex w-full gap-[18%]"><YaoBar changing={changing} /><YaoBar changing={changing} /></div>
              ) : (
                <YaoBar changing={changing} />
              )}
            </div>
            <span className={`text-[10px] tracking-[0.12em] ${changing ? "text-[#a85d44]" : revealed ? "text-ink-light" : "text-transparent"}`}>
              {revealed ? LINE_NAMES[value] : "未定"}
              {changing && <span className="ml-1 text-xs">{value === 0 ? "×" : "○"}</span>}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function HexagramMark({ lines }: { lines: readonly LineValue[] }) {
  return (
    <div className="mx-auto mb-5 flex w-20 flex-col gap-1.5" aria-label="本卦六爻缩略图">
      {[5, 4, 3, 2, 1, 0].map((index) => {
        const value = lines[index];
        const yin = isYin(value);
        const changing = isChanging(value);
        const color = changing ? "bg-[#a85d44]" : "bg-ink";
        return (
          <div key={index} className="flex h-1.5 w-full gap-3">
            {yin ? (
              <>
                <span className={`flex-1 rounded-full ${color}`} />
                <span className={`flex-1 rounded-full ${color}`} />
              </>
            ) : (
              <span className={`flex-1 rounded-full ${color}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function YaoBar({ changing }: { changing: boolean }) {
  return <span className={`block h-[5px] flex-1 rounded-full transition duration-500 ${changing ? "bg-[#a85d44] shadow-[0_0_12px_rgba(168,93,68,0.22)]" : "bg-ink shadow-[0_1px_0_rgba(255,255,255,0.18)] dark:bg-paper/85"}`} />;
}
