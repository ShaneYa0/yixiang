"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function VIPGate({
  children,
  isVip,
  featureName,
  onSubscribe,
}: {
  children: React.ReactNode;
  isVip: boolean;
  featureName: string;
  onSubscribe?: () => void;
}) {
  if (isVip) return <>{children}</>;

  return (
    <Card className="mt-6 border-dashed py-8 text-center">
      <div className="mb-3 text-3xl">🔒</div>
      <h4 className="mb-2 text-xs font-semibold tracking-[0.2em] text-ink">{featureName}为订阅专属内容</h4>
      <p className="mx-auto mb-4 max-w-md text-[12px] leading-relaxed text-ink-light">
        订阅后可解锁深度解读与长期运势分析。新用户注册即送 1 天免费体验。
      </p>
      {onSubscribe ? (
        <button
          onClick={onSubscribe}
          className="border border-ink px-6 py-2 text-xs tracking-[0.14em] text-ink transition-colors hover:bg-ink hover:text-paper dark:border-paper dark:text-paper dark:hover:bg-paper dark:hover:text-ink"
        >
          查看订阅方案 · 7天¥8.8起
        </button>
      ) : (
        <Button variant="primary" className="text-xs">
          了解订阅方案 · 7天¥8.8起
        </Button>
      )}
    </Card>
  );
}
