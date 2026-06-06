"use client";

import { useMemo, useState } from "react";

type DropdownOption = {
  value: number;
  label: string;
};

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: currentYear - 1900 + 1 }, (_, index) => {
  const year = currentYear - index;
  return { value: year, label: `${year} 年` };
});
const monthOptions = Array.from({ length: 12 }, (_, index) => {
  const month = index + 1;
  return { value: month, label: `${month} 月` };
});
const hourLabels = [
  "子时",
  "丑时",
  "丑时",
  "寅时",
  "寅时",
  "卯时",
  "卯时",
  "辰时",
  "辰时",
  "巳时",
  "巳时",
  "午时",
  "午时",
  "未时",
  "未时",
  "申时",
  "申时",
  "酉时",
  "酉时",
  "戌时",
  "戌时",
  "亥时",
  "亥时",
  "子时",
];

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function parseBirthDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return {
    year: Number.isFinite(year) ? year : 1992,
    month: Number.isFinite(month) ? month : 1,
    day: Number.isFinite(day) ? day : 1,
  };
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function buildBirthDate(year: number, month: number, day: number) {
  return `${year}-${pad(month)}-${pad(day)}`;
}

function CompactDropdown({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: DropdownOption[];
  value: number;
  onChange: (value: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value) ?? options[0];

  return (
    <div
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false);
        }
      }}
    >
      <span className="mb-1.5 block text-[11px] font-medium tracking-[0.12em] text-ink-fade">{label}</span>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex min-h-12 w-full items-center justify-between border border-divider bg-white px-3.5 text-left text-sm text-ink outline-none transition-colors hover:border-ink/40 focus:border-ink dark:bg-card dark:text-paper"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{selected?.label}</span>
        <span className={`text-[10px] text-ink-fade transition-transform ${open ? "rotate-180" : ""}`}>⌄</span>
      </button>
      {open ? (
        <div
          className="absolute left-0 top-[calc(100%+4px)] z-30 max-h-[432px] w-full overflow-y-auto border border-divider bg-card shadow-[0_16px_35px_rgba(44,36,22,0.12)] dark:bg-card"
          role="listbox"
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={`flex min-h-9 w-full items-center px-3 text-left text-sm transition-colors hover:bg-paper dark:hover:bg-paper/10 ${
                option.value === value ? "bg-paper font-medium text-ink dark:bg-paper/10 dark:text-paper" : "text-ink-light"
              }`}
              role="option"
              aria-selected={option.value === value}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function BirthDatePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const date = parseBirthDate(value);
  const dayOptions = useMemo(
    () =>
      Array.from({ length: daysInMonth(date.year, date.month) }, (_, index) => {
        const day = index + 1;
        return { value: day, label: `${day} 日` };
      }),
    [date.month, date.year],
  );

  const updateDate = (next: Partial<typeof date>) => {
    const year = next.year ?? date.year;
    const month = next.month ?? date.month;
    const maxDay = daysInMonth(year, month);
    const day = Math.min(next.day ?? date.day, maxDay);
    onChange(buildBirthDate(year, month, day));
  };

  return (
    <div className="grid grid-cols-[1.35fr_1fr_1fr] gap-2">
      <CompactDropdown label="出生年份" options={yearOptions} value={date.year} onChange={(year) => updateDate({ year })} />
      <CompactDropdown label="月份" options={monthOptions} value={date.month} onChange={(month) => updateDate({ month })} />
      <CompactDropdown label="日期" options={dayOptions} value={date.day} onChange={(day) => updateDate({ day })} />
    </div>
  );
}

export function BirthHourPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  const hourOptions = useMemo(
    () =>
      Array.from({ length: 24 }, (_, hour) => ({
        value: hour,
        label: `${hour} 点 · ${hourLabels[hour]}`,
      })),
    [],
  );

  return <CompactDropdown label="出生小时" options={hourOptions} value={value} onChange={onChange} />;
}
