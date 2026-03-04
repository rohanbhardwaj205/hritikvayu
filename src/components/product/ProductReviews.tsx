"use client";

import { useState, useMemo } from "react";
import { Star, ThumbsUp, ShieldCheck, ChevronDown } from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { Rating } from "@/components/ui/Rating";
import { Button } from "@/components/ui/Button";
import { ReviewForm } from "./ReviewForm";
import { Pagination } from "@/components/ui/Pagination";
import type { Review } from "@/types";

interface ProductReviewsProps {
  reviews: Review[];
  productId: string;
  averageRating: number;
  totalCount: number;
  className?: string;
}

type ReviewSort = "newest" | "highest" | "lowest";

const REVIEWS_PER_PAGE = 5;

export function ProductReviews({
  reviews,
  productId,
  averageRating,
  totalCount,
  className,
}: ProductReviewsProps) {
  const [showForm, setShowForm] = useState(false);
  const [sortBy, setSortBy] = useState<ReviewSort>("newest");
  const [page, setPage] = useState(1);

  // Rating distribution
  const distribution = useMemo(() => {
    const counts = [0, 0, 0, 0, 0]; // 1-5 stars
    reviews.forEach((r) => {
      if (r.rating >= 1 && r.rating <= 5) {
        counts[r.rating - 1]++;
      }
    });
    return counts;
  }, [reviews]);

  // Sorted reviews
  const sortedReviews = useMemo(() => {
    const sorted = [...reviews];
    switch (sortBy) {
      case "newest":
        return sorted.sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        );
      case "highest":
        return sorted.sort((a, b) => b.rating - a.rating);
      case "lowest":
        return sorted.sort((a, b) => a.rating - b.rating);
      default:
        return sorted;
    }
  }, [reviews, sortBy]);

  // Paginated
  const totalPages = Math.ceil(sortedReviews.length / REVIEWS_PER_PAGE);
  const paginatedReviews = sortedReviews.slice(
    (page - 1) * REVIEWS_PER_PAGE,
    page * REVIEWS_PER_PAGE
  );

  return (
    <div id="reviews" className={cn("scroll-mt-24", className)}>
      <h2 className="font-display text-2xl font-bold text-foreground">
        Customer Reviews
      </h2>

      <div className="mt-6 grid gap-8 lg:grid-cols-[320px_1fr]">
        {/* Left: Summary */}
        <div className="space-y-6">
          {/* Average Rating */}
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <div className="text-5xl font-bold text-foreground">
              {averageRating.toFixed(1)}
            </div>
            <Rating
              value={Math.round(averageRating)}
              size="md"
              readonly
              className="mt-2 justify-center"
            />
            <p className="mt-1 text-sm text-muted">
              Based on {totalCount} review{totalCount !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Rating Bars */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = distribution[stars - 1];
              const percentage =
                totalCount > 0 ? (count / totalCount) * 100 : 0;

              return (
                <div key={stars} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-12">
                    <span className="text-sm font-medium text-foreground">
                      {stars}
                    </span>
                    <Star className="h-3.5 w-3.5 text-accent fill-accent" />
                  </div>
                  <div className="flex-1 h-2.5 rounded-full bg-surface-2 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-accent transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-xs text-muted">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Write a Review */}
          <Button
            variant="outline"
            fullWidth
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Cancel" : "Write a Review"}
          </Button>
        </div>

        {/* Right: Review List */}
        <div className="space-y-6">
          {/* Review Form */}
          {showForm && (
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-display text-lg font-semibold text-foreground mb-4">
                Write Your Review
              </h3>
              <ReviewForm
                productId={productId}
                onSuccess={() => setShowForm(false)}
              />
            </div>
          )}

          {/* Sort + Count */}
          {reviews.length > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted">
                Showing {paginatedReviews.length} of {sortedReviews.length}{" "}
                reviews
              </p>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as ReviewSort);
                    setPage(1);
                  }}
                  className="appearance-none rounded-lg border border-border bg-white px-3 py-1.5 pr-8 text-sm text-foreground cursor-pointer focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="newest">Newest First</option>
                  <option value="highest">Highest Rated</option>
                  <option value="lowest">Lowest Rated</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
              </div>
            </div>
          )}

          {/* Review Cards */}
          {paginatedReviews.length > 0 ? (
            <div className="space-y-4">
              {paginatedReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          ) : (
            !showForm && (
              <div className="rounded-xl border border-border bg-surface/50 py-12 text-center">
                <p className="text-sm font-medium text-foreground">
                  No reviews yet
                </p>
                <p className="mt-1 text-xs text-muted">
                  Be the first to share your experience with this product.
                </p>
              </div>
            )
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const date = new Date(review.created_at).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const displayName = review.profile?.full_name ?? "Anonymous";

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          {review.profile?.avatar_url ? (
            <img
              src={review.profile.avatar_url}
              alt={displayName}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {getInitials(displayName)}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">
                {displayName}
              </span>
              {review.is_verified && (
                <span className="flex items-center gap-0.5 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">
                  <ShieldCheck className="h-3 w-3" />
                  Verified
                </span>
              )}
            </div>
            <p className="text-xs text-muted">{date}</p>
          </div>
        </div>
        <Rating value={review.rating} size="sm" readonly />
      </div>

      {review.title && (
        <h4 className="mt-3 text-sm font-semibold text-foreground">
          {review.title}
        </h4>
      )}

      {review.body && (
        <p className="mt-1.5 text-sm leading-relaxed text-muted">
          {review.body}
        </p>
      )}
    </div>
  );
}
