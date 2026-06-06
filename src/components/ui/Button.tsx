"use client";

import Link from "next/link";

type Props = {
  children: React.ReactNode;
  variant?: "primary" | "outline";
  href?: string;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
};

export function Button({
  children,
  variant = "primary",
  href,
  onClick,
  className = "",
  type = "button",
  disabled = false,
}: Props) {
  const base =
    "inline-flex min-h-11 items-center justify-center px-7 py-3 text-sm font-medium tracking-[0.14em] transition-colors disabled:cursor-not-allowed disabled:opacity-50";
  const styles =
    variant === "primary"
      ? "bg-ink text-paper hover:bg-ink-light"
      : "border border-ink text-ink hover:bg-divider/40";

  if (href) {
    return (
      <Link href={href} className={`${base} ${styles} ${className}`}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${styles} ${className}`}>
      {children}
    </button>
  );
}
