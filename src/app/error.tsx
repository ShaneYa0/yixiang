"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg py-24 text-center">
      <div className="mb-6 text-5xl font-thin text-ink-soft">出错了</div>
      <h1 className="mb-4 text-xl font-semibold tracking-[0.16em] text-ink">
        页面加载遇到问题
      </h1>
      <p className="mb-8 text-[13px] leading-7 text-ink-light">
        请尝试刷新页面或返回首页。如果问题持续出现，可以稍后再试。
      </p>
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={reset}
          className="inline-flex min-h-9 items-center border border-ink px-5 text-[12px] font-medium tracking-[0.16em] text-ink transition-colors hover:bg-ink hover:text-paper"
        >
          重试
        </button>
        <Link
          href="/"
          className="inline-flex min-h-9 items-center bg-ink px-5 text-[12px] font-medium tracking-[0.16em] text-paper transition-opacity hover:opacity-90"
        >
          返回首页
        </Link>
      </div>
    </div>
  );
}
