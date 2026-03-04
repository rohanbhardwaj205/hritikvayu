import { Skeleton } from "@/components/ui/Skeleton";

export default function ProductDetailLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb Skeleton */}
      <div className="mb-6 flex items-center gap-2">
        <Skeleton variant="text" className="h-4 w-12" />
        <Skeleton variant="text" className="h-4 w-4" />
        <Skeleton variant="text" className="h-4 w-12" />
        <Skeleton variant="text" className="h-4 w-4" />
        <Skeleton variant="text" className="h-4 w-24" />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Gallery Skeleton */}
        <div className="space-y-4">
          <Skeleton
            variant="rectangular"
            className="aspect-square w-full rounded-xl"
          />
          <div className="flex gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                className="h-20 w-20 rounded-lg"
              />
            ))}
          </div>
        </div>

        {/* Info Skeleton */}
        <div className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Skeleton variant="text" className="h-8 w-3/4" />
            <Skeleton variant="text" className="h-4 w-32" />
          </div>

          {/* Price */}
          <Skeleton variant="text" className="h-8 w-40" />

          {/* Description */}
          <div className="space-y-2">
            <Skeleton variant="text" className="h-4 w-full" />
            <Skeleton variant="text" className="h-4 w-5/6" />
            <Skeleton variant="text" className="h-4 w-2/3" />
          </div>

          {/* Variant Selector */}
          <div className="space-y-3">
            <Skeleton variant="text" className="h-4 w-16" />
            <div className="flex gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton
                  key={i}
                  variant="rectangular"
                  className="h-10 w-11 rounded-lg"
                />
              ))}
            </div>
          </div>

          {/* Color swatches */}
          <div className="space-y-3">
            <Skeleton variant="text" className="h-4 w-16" />
            <div className="flex gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} variant="circular" className="h-10 w-10" />
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Skeleton variant="text" className="h-4 w-20" />
            <Skeleton
              variant="rectangular"
              className="h-9 w-32 rounded-lg"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <Skeleton
              variant="rectangular"
              className="h-12 flex-1 rounded-lg"
            />
            <Skeleton
              variant="rectangular"
              className="h-12 w-14 rounded-lg"
            />
          </div>

          {/* Stock & delivery info */}
          <Skeleton variant="text" className="h-4 w-24" />
          <Skeleton
            variant="rectangular"
            className="h-32 w-full rounded-xl"
          />
        </div>
      </div>

      {/* Reviews Skeleton */}
      <div className="mt-16 border-t border-border pt-12">
        <Skeleton variant="text" className="h-8 w-48 mb-6" />
        <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
          <div className="space-y-4">
            <Skeleton
              variant="rectangular"
              className="h-40 w-full rounded-xl"
            />
            <Skeleton
              variant="rectangular"
              className="h-32 w-full rounded-xl"
            />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                className="h-32 w-full rounded-xl"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
