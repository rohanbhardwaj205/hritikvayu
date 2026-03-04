export default function ProductsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb Skeleton */}
      <div className="mb-6 flex items-center gap-2">
        <div className="h-4 w-12 animate-pulse rounded bg-surface-2" />
        <div className="h-4 w-4 animate-pulse rounded bg-surface-2" />
        <div className="h-4 w-16 animate-pulse rounded bg-surface-2" />
      </div>

      {/* Page Title Skeleton */}
      <div className="mb-8">
        <div className="h-9 w-72 animate-pulse rounded-md bg-surface-2" />
        <div className="mt-2 h-4 w-96 max-w-full animate-pulse rounded bg-surface-2" />
      </div>

      {/* Filter Bar Skeleton */}
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <div className="h-10 w-28 animate-pulse rounded-lg bg-surface-2" />
        <div className="h-10 w-32 animate-pulse rounded-lg bg-surface-2" />
        <div className="h-10 w-24 animate-pulse rounded-lg bg-surface-2" />
        <div className="ml-auto h-10 w-36 animate-pulse rounded-lg bg-surface-2" />
      </div>

      {/* Product Grid Skeleton */}
      <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-xl border border-border bg-card">
            {/* Image Placeholder */}
            <div className="aspect-[3/4] w-full animate-pulse bg-surface-2" />

            {/* Text Line Placeholders */}
            <div className="space-y-2 p-4">
              <div className="h-4 w-3/4 animate-pulse rounded bg-surface-2" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-surface-2" />
              <div className="h-4 w-1/3 animate-pulse rounded bg-surface-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
