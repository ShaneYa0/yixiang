import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";

export function BaziReading({ reading }: { reading: string }) {
  return (
    <Card>
      <SectionTitle>基础解读</SectionTitle>
      <div className="whitespace-pre-line text-[13px] leading-7 text-ink-light">{reading}</div>
    </Card>
  );
}
