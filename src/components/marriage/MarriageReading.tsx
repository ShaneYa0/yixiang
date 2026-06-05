import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";

export function MarriageReading({
  reading,
  mode,
}: {
  reading: string;
  mode: "pair" | "solo";
}) {
  return (
    <Card>
      <SectionTitle>{mode === "pair" ? "合婚解读" : "姻缘解读"}</SectionTitle>
      <div className="whitespace-pre-line text-[13px] leading-7 text-ink-light">{reading}</div>
    </Card>
  );
}
