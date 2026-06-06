"use client";

import { useState } from "react";
import { BirthDatePicker, BirthHourPicker } from "@/components/ui/BirthSelectors";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export type BaziForm = { birthDate: string; birthHour: number; gender: "male" | "female" };

export function BaziInput({ onSubmit, loading }: { onSubmit: (data: BaziForm) => void; loading: boolean }) {
  const [birthDate, setBirthDate] = useState("1994-06-12");
  const [birthHour, setBirthHour] = useState(8);
  const [gender, setGender] = useState<"male" | "female">("male");

  return (
    <Card className="mx-auto mt-8 max-w-md">
      <h1 className="mb-6 text-center text-sm font-semibold tracking-[0.25em] text-ink">生辰八字</h1>
      <div className="space-y-4">
        <BirthDatePicker value={birthDate} onChange={setBirthDate} />
        <BirthHourPicker value={birthHour} onChange={setBirthHour} />
        <div className="grid grid-cols-2 gap-3">
          {(["male", "female"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setGender(value)}
              className={`border p-3 text-sm tracking-[0.15em] ${
                gender === value ? "border-ink bg-divider/40 text-ink" : "border-divider text-ink-light"
              }`}
            >
              {value === "male" ? "男" : "女"}
            </button>
          ))}
        </div>
        <Button onClick={() => onSubmit({ birthDate, birthHour, gender })} disabled={loading} className="w-full">
          {loading ? "排盘中" : "开始排盘"}
        </Button>
      </div>
    </Card>
  );
}
