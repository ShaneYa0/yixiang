import Link from "next/link";
import { resolveAuthUser } from "@/lib/auth-utils";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { NavLink } from "@/components/layout/NavLink";

const links = [
  { href: "/fortune", label: "运势" },
  { href: "/bazi", label: "八字" },
  { href: "/marriage", label: "姻缘" },
  { href: "/iching", label: "易经" },
  { href: "/huangli", label: "黄历" },
];

export async function Navbar() {
  const user = await resolveAuthUser();

  return (
    <nav className="mx-auto flex max-w-5xl flex-col gap-4 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
      <Link href="/" className="text-xl font-semibold tracking-[0.35em] text-ink">
        易象
      </Link>
      <div className="flex flex-wrap items-center gap-x-7 gap-y-3 text-[13px] tracking-[0.2em] text-ink-fade">
        {links.map((link) => (
          <NavLink key={link.href} href={link.href} label={link.label} />
        ))}
        <Link
          href={user ? "/me" : "/login"}
          className="inline-flex min-h-9 items-center border border-ink px-4 text-[12px] font-medium tracking-[0.16em] text-ink transition-colors hover:bg-ink hover:text-paper"
        >
          {user ? "我的" : "登录 / 我的"}
        </Link>
        <ThemeToggle />
      </div>
    </nav>
  );
}
