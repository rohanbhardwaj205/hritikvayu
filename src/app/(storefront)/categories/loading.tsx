export default function CategoriesLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb Skeleton */}
      <div className="mb-6 flex items-center gap-2">
        <div className="h-4 w-12 animate-pulse rounded bg-surface-2" />
        <div className="h-4 w-4 animate-pulse rounded bg-surface-2" />
        <div className="h-4 w-20 animate-pulse rounded bg-surface-2" />
      </div>

      {/* Page Title Skeleton */}
      <div className="mb-8">
        <div className="h-9 w-64 animate-pulse rounded-md bg-surface-2" />
        <div className="mt-2 h-4 w-80 max-w-full animate-pulse rounded bg-surface-2" />
      </div>

      {/* Category Cards Grid Skeleton */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-xl border border-border bg-card"
          >
            {/* Image Placeholder */}
            <div className="aspect-[4/5] w-full animate-pulse bg-surface-2" />

            {/* Text Line Placeholders */}
            <div className="space-y-2 p-4">
              <div className="h-5 w-2/3 animate-pulse rounded bg-surface-2" />
              <div className="h-3 w-full animate-pulse rounded bg-surface-2" />
              <div className="h-3 w-1/3 animate-pulse rounded bg-surface-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
