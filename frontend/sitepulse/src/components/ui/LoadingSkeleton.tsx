export function LoadingSkeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-ink/5 ${className}`} />;
}

export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="overflow-hidden rounded-lg border border-stone">
      <div className="divide-y divide-stone/70">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center gap-4 px-4 py-3.5">
            {Array.from({ length: cols }).map((__, c) => (
              <LoadingSkeleton key={c} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="card p-5">
      <LoadingSkeleton className="h-4 w-24" />
      <LoadingSkeleton className="mt-3 h-7 w-20" />
      <LoadingSkeleton className="mt-2 h-3 w-16" />
    </div>
  );
}
