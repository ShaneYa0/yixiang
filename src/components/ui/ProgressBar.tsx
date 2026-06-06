export function ProgressBar({ label, value }: { label: string; value: number }) {
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <div>
      <div className="mb-1.5 h-1 w-full bg-divider">
        <div className="h-1 bg-ink" style={{ width: `${safeValue}%` }} />
      </div>
      <div className="flex justify-between text-[10px] tracking-[0.12em] text-ink-fade">
        <span>{label}</span>
        <span>{safeValue}</span>
      </div>
    </div>
  );
}
