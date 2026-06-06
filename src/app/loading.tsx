export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl py-16" aria-label="加载中">
      {/* Header skeleton */}
      <div className="mb-10 text-center">
        <div className="mx-auto mb-3 h-3 w-32 animate-pulse bg-divider" />
        <div className="mx-auto mb-5 h-10 w-48 animate-pulse bg-divider" />
        <div className="mx-auto h-4 w-80 animate-pulse bg-divider" />
      </div>

      {/* Card skeletons */}
      <div className="grid gap-5 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border border-divider bg-card p-6">
            <div className="mb-3 h-3 w-20 animate-pulse bg-divider" />
            <div className="mb-4 h-5 w-36 animate-pulse bg-divider" />
            <div className="space-y-2">
              <div className="h-3 w-full animate-pulse bg-divider" />
              <div className="h-3 w-3/4 animate-pulse bg-divider" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
