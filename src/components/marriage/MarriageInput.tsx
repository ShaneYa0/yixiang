"use client";

import { useState } from "react";
import { BirthDatePicker, BirthHourPicker } from "@/components/ui/BirthSelectors";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { PersonInput, SingleMarriageInput } from "@/lib/marriage";

export type MarriageFormData =
  | { mode: "pair"; personA: PersonInput; personB: PersonInput }
  | { mode: "solo"; solo: SingleMarriageInput };

function defaultPerson(gender: "male" | "female"): PersonInput {
  return {
    name: "",
    gender,
    birthDate: gender === "male" ? "1992-08-18" : "1995-03-06",
    birthHour: gender === "male" ? 9 : 15,
  };
}

function ModeTab({
  active,
  label,
  description,
  onClick,
}: {
  active: boolean;
  label: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-16 flex-1 items-center gap-3 border px-4 text-left transition-colors ${
        active
          ? "border-ink bg-paper/70 text-ink shadow-[inset_0_0_0_1px_rgba(44,36,22,0.06)] dark:border-paper dark:bg-paper/10 dark:text-paper"
          : "border-divider bg-card text-ink-light hover:border-ink/40 hover:text-ink dark:bg-card dark:hover:text-paper"
      }`}
    >
      <span className="text-base leading-none">{active ? "◈" : "◇"}</span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold tracking-[0.14em]">{label}</span>
        <span className="mt-1 block text-xs tracking-[0.08em] text-ink-fade">{description}</span>
      </span>
    </button>
  );
}

function GenderSwitch({
  value,
  onChange,
}: {
  value: "male" | "female";
  onChange: (value: "male" | "female") => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {(["male", "female"] as const).map((gender) => (
        <button
          key={gender}
          type="button"
          onClick={() => onChange(gender)}
          className={`min-h-12 border px-4 text-sm font-medium tracking-[0.16em] transition-colors ${
            value === gender
              ? "border-ink bg-ink text-paper dark:border-paper dark:bg-paper dark:text-ink"
              : "border-divider bg-white text-ink-light hover:border-ink/40 hover:text-ink dark:bg-card dark:hover:text-paper"
          }`}
        >
          {gender === "male" ? "男" : "女"}
        </button>
      ))}
    </div>
  );
}

function PersonFields({
  person,
  onChange,
  title,
  note,
}: {
  person: PersonInput;
  onChange: (person: PersonInput) => void;
  title: string;
  note: string;
}) {
  return (
    <section className="space-y-4">
      {(title || note) && (
        <div className="border-b border-divider pb-3">
          {title && <h2 className="text-sm font-semibold tracking-[0.18em] text-ink">{title}</h2>}
          {note && <p className="mt-1 text-xs leading-5 text-ink-fade">{note}</p>}
        </div>
      )}

      <label className="block">
        <span className="mb-1.5 block text-[11px] font-medium tracking-[0.12em] text-ink-fade">姓名</span>
        <input
          value={person.name}
          onChange={(event) => onChange({ ...person, name: event.target.value })}
          placeholder=""
          className="min-h-12 w-full border border-divider bg-white px-3.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-fade focus:border-ink dark:bg-card dark:text-paper"
        />
      </label>

      <div>
        <span className="mb-1.5 block text-[11px] font-medium tracking-[0.12em] text-ink-fade">性别</span>
        <GenderSwitch value={person.gender} onChange={(gender) => onChange({ ...person, gender })} />
      </div>

      <BirthDatePicker value={person.birthDate} onChange={(birthDate) => onChange({ ...person, birthDate })} />
      <BirthHourPicker value={person.birthHour} onChange={(birthHour) => onChange({ ...person, birthHour })} />
    </section>
  );
}

export function MarriageInput({
  onSubmit,
  loading,
}: {
  onSubmit: (data: MarriageFormData) => void;
  loading: boolean;
}) {
  const [mode, setMode] = useState<"pair" | "solo">("solo");
  const [personA, setPersonA] = useState(defaultPerson("male"));
  const [personB, setPersonB] = useState(defaultPerson("female"));
  const [solo, setSolo] = useState<SingleMarriageInput>({
    name: "",
    gender: "male",
    birthDate: "1992-08-18",
    birthHour: 9,
  });

  const handleSubmit = () => {
    if (mode === "pair") {
      onSubmit({ mode: "pair", personA, personB });
      return;
    }

    onSubmit({ mode: "solo", solo });
  };

  const buttonLabel = mode === "pair" ? (loading ? "测算中" : "测算契合度") : loading ? "测算中" : "开始测算";

  return (
    <Card className={`mx-auto mt-8 max-w-md ${mode === "pair" ? "md:max-w-4xl" : ""}`}>
      <div className="border-b border-divider px-5 py-5 sm:px-8">
        <div className="grid gap-3 sm:grid-cols-2">
          <ModeTab active={mode === "solo"} label="姻缘解读" description="看个人感情结构" onClick={() => setMode("solo")} />
          <ModeTab active={mode === "pair"} label="合盘解读" description="看双方关系结构" onClick={() => setMode("pair")} />
        </div>
      </div>

      <div className="px-5 py-7 sm:px-8">
        <div className="mb-7 text-center">
          <p className="text-xs font-medium tracking-[0.2em] text-ink-fade">{mode === "pair" ? "双人命盘参照" : "个人感情分析"}</p>
          <h1 className="mt-2 text-xl font-semibold tracking-[0.18em] text-ink">{mode === "pair" ? "关系分析" : "感情分析"}</h1>
        </div>

        {mode === "pair" ? (
          <div className="grid gap-8 md:grid-cols-2">
            <PersonFields person={personA} onChange={setPersonA} title="" note="" />
            <PersonFields person={personB} onChange={setPersonB} title="" note="" />
          </div>
        ) : (
          <div className="mx-auto max-w-md">
            <PersonFields
              person={{ name: solo.name, gender: solo.gender, birthDate: solo.birthDate, birthHour: solo.birthHour }}
              onChange={(person) =>
                setSolo({
                  ...solo,
                  name: person.name,
                  gender: person.gender,
                  birthDate: person.birthDate,
                  birthHour: person.birthHour,
                })
              }
              title=""
              note=""
            />
          </div>
        )}

        <div className="mt-8 border-t border-divider pt-5">
          <Button onClick={handleSubmit} disabled={loading} className="w-full">
            {buttonLabel}
          </Button>
        </div>
      </div>
    </Card>
  );
}
