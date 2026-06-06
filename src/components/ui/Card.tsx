export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`border border-divider bg-card p-6 ${className}`}>{children}</div>;
}
