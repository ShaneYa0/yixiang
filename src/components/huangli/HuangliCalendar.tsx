"use client";

import { useRouter } from "next/navigation";

export function HuangliCalendar({ date }: { date: string }) {
  const router = useRouter();

  const onChange = (nextDate: string) => {
    router.push(`/huangli?date=${nextDate}`);
  };

  const move = (days: number) => {
    const next = new Date(`${date}T12:00:00`);
    next.setDate(next.getDate() + days);
    onChange(next.toISOString().slice(0, 10));
  };

  return (
    <div className="flex items-center justify-center gap-4 py-6">
      <button onClick={() => move(-1)} className="h-10 w-10 border border-divider text-ink-fade hover:border-ink hover:text-ink" aria-label="前一天">
        ‹
      </button>
      <input type="date" value={date} onChange={(e) => onChange(e.target.value)} className="border border-divider bg-white p-3 text-center text-sm text-ink outline-none focus:border-ink" />
      <button onClick={() => move(1)} className="h-10 w-10 border border-divider text-ink-fade hover:border-ink hover:text-ink" aria-label="后一天">
        ›
      </button>
    </div>
  );
}
