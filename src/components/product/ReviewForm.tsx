"use client";

import { useState } from "react";
import { z } from "zod/v4";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

const reviewFormSchema = z.object({
  rating: z
    .number()
    .int()
    .min(1, "Please select a rating")
    .max(5, "Maximum rating is 5"),
  title: z.string().max(100, "Title must be 100 characters or less").optional(),
  body: z.string().max(2000, "Review must be 2000 characters or less").optional(),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

interface ReviewFormProps {
  productId: string;
  onSuccess?: () => void;
  className?: string;
}

export function ReviewForm({
  productId,
  onSuccess,
  className,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const displayRating = hoverRating || rating;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSubmitError(null);

    const data: ReviewFormValues = {
      rating,
      title: title.trim() || undefined,
      body: body.trim() || undefined,
    };

    const result = reviewFormSchema.safeParse(data);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string") {
          fieldErrors[key] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          ...result.data,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(
          errData?.error ?? "Failed to submit review. Please try again."
        );
      }

      setRating(0);
      setTitle("");
      setBody("");
      onSuccess?.();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-5", className)}>
      {/* Star Rating Input */}
      <div>
        <label className="text-sm font-semibold text-foreground mb-2 block">
          Your Rating <span className="text-error">*</span>
        </label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
              className="p-0.5 transition-transform hover:scale-110 cursor-pointer"
              aria-label={`Rate ${star} star${star !== 1 ? "s" : ""}`}
            >
              <Star
                className={cn(
                  "h-7 w-7 transition-colors",
                  star <= displayRating
                    ? "text-accent fill-accent"
                    : "text-border-hover fill-none"
                )}
              />
            </button>
          ))}
          {displayRating > 0 && (
            <span className="ml-2 text-sm text-muted">
              {displayRating === 1 && "Poor"}
              {displayRating === 2 && "Fair"}
              {displayRating === 3 && "Good"}
              {displayRating === 4 && "Very Good"}
              {displayRating === 5 && "Excellent"}
            </span>
          )}
        </div>
        {errors.rating && (
          <p className="mt-1 text-xs text-error">{errors.rating}</p>
        )}
      </div>

      {/* Title */}
      <div>
        <label
          htmlFor="review-title"
          className="text-sm font-semibold text-foreground mb-1.5 block"
        >
          Review Title
        </label>
        <input
          id="review-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your experience"
          maxLength={100}
          className={cn(
            "w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-foreground placeholder:text-muted-light transition-colors",
            "focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary",
            errors.title ? "border-error" : "border-border"
          )}
        />
        {errors.title && (
          <p className="mt-1 text-xs text-error">{errors.title}</p>
        )}
      </div>

      {/* Body */}
      <div>
        <label
          htmlFor="review-body"
          className="text-sm font-semibold text-foreground mb-1.5 block"
        >
          Your Review
        </label>
        <textarea
          id="review-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Share your detailed experience with this product..."
          rows={4}
          maxLength={2000}
          className={cn(
            "w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-foreground placeholder:text-muted-light transition-colors resize-none",
            "focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary",
            errors.body ? "border-error" : "border-border"
          )}
        />
        <div className="mt-1 flex justify-between">
          {errors.body ? (
            <p className="text-xs text-error">{errors.body}</p>
          ) : (
            <span />
          )}
          <span className="text-xs text-muted">{body.length}/2000</span>
        </div>
      </div>

      {/* Submit Error */}
      {submitError && (
        <div className="rounded-lg bg-error/10 border border-error/20 px-4 py-3 text-sm text-error">
          {submitError}
        </div>
      )}

      {/* Submit */}
      <Button type="submit" variant="primary" loading={submitting}>
        Submit Review
      </Button>
    </form>
  );
}
