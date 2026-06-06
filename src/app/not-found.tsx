import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-lg py-24 text-center">
      <div className="mb-6 text-6xl font-thin text-ink-soft">404</div>
      <h1 className="mb-4 text-xl font-semibold tracking-[0.16em] text-ink">
        页面未找到
      </h1>
      <p className="mb-8 text-[13px] leading-7 text-ink-light">
        你访问的页面不存在或已被移走。可以返回首页，或者试试其他功能。
      </p>
      <Link
        href="/"
        className="inline-flex min-h-9 items-center bg-ink px-7 py-3 text-sm font-medium tracking-[0.14em] text-paper transition-opacity hover:opacity-90"
      >
        返回首页
      </Link>
    </div>
  );
}
