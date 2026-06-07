export function ProgressBar({ label, value, displayValue, color = "#2C2416" }: { label: string; value: number; displayValue?: number; color?: string }) {
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <div>
      <div className="mb-1.5 h-1 w-full bg-divider">
        <div className="h-1" style={{ width: `${safeValue}%`, backgroundColor: color }} />
      </div>
      <div className="flex justify-between text-[10px] tracking-[0.12em] text-ink-fade">
        <span>{label}</span>
        <span>{displayValue ?? Math.round(safeValue)}</span>
      </div>
    </div>
  );
}
