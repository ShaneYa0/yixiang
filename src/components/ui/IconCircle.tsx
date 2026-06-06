export function IconCircle({ symbol }: { symbol: string }) {
  return (
    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink text-base text-ink">
      {symbol}
    </span>
  );
}
