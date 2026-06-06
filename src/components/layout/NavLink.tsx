"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** 导航链接：同路由点击时清缓存重载，确保回到初始状态 */
export function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  const handleClick = () => {
    // 清掉对应页面的缓存
    const key = href.replace("/", "yixiang:") + "-cache";
    try { sessionStorage.removeItem(key); } catch { /* ignore */ }
    if (isActive) {
      window.location.href = href;
    }
  };

  return (
    <Link
      href={href}
      onClick={isActive ? handleClick : undefined}
      className="transition-colors hover:text-ink"
    >
      {label}
    </Link>
  );
}
