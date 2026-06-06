export function PillarCard({
  label,
  ganZhi,
  nayin,
  tenGod,
  hiddenTenGods,
  xunKong,
}: {
  label: string;
  ganZhi: string;
  nayin: string;
  tenGod?: string;
  hiddenTenGods?: string[];
  xunKong?: string;
}) {
  return (
    <div className="min-w-0 flex-1 border border-divider bg-card px-2 py-5 text-center">
      <div className="mb-2 text-[9px] tracking-[0.15em] text-ink-fade">{label}</div>
      <div className="mb-1 text-3xl font-thin text-ink">{ganZhi}</div>
      {tenGod && <div className="mb-2 text-[11px] tracking-[0.08em] text-ink-light">{tenGod}</div>}
      <div className="text-[10px] text-ink-soft">{nayin}</div>
      {hiddenTenGods && hiddenTenGods.length > 0 && (
        <div className="mt-3 border-t border-divider pt-3 text-[10px] leading-5 text-ink-fade">
          藏干：{hiddenTenGods.join("、")}
        </div>
      )}
      {xunKong && <div className="mt-1 text-[10px] text-ink-fade">旬空：{xunKong}</div>}
    </div>
  );
}
