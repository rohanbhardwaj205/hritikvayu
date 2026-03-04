"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type RatingSize = "sm" | "md" | "lg";

interface RatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: RatingSize;
  readonly?: boolean;
  className?: string;
}

const sizeStyles: Record<RatingSize, string> = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

const gapStyles: Record<RatingSize, string> = {
  sm: "gap-0.5",
  md: "gap-1",
  lg: "gap-1",
};

export function Rating({
  value,
  onChange,
  size = "md",
  readonly = false,
  className,
}: RatingProps) {
  const isInteractive = !readonly && !!onChange;

  return (
    <div
      className={cn("inline-flex items-center", gapStyles[size], className)}
      role={isInteractive ? "radiogroup" : "img"}
      aria-label={`Rating: ${value} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= value;
        const isHalf = star - 0.5 === value;

        return (
          <button
            key={star}
            type="button"
            disabled={!isInteractive}
            onClick={() => isInteractive && onChange(star)}
            className={cn(
              "transition-colors p-0 border-0 bg-transparent",
              isInteractive
                ? "cursor-pointer hover:scale-110 transform transition-transform"
                : "cursor-default",
              "disabled:opacity-100"
            )}
            aria-label={`${star} star${star !== 1 ? "s" : ""}`}
            role={isInteractive ? "radio" : undefined}
            aria-checked={isInteractive ? star === value : undefined}
            tabIndex={isInteractive ? 0 : -1}
          >
            <Star
              className={cn(
                sizeStyles[size],
                isFilled || isHalf
                  ? "text-accent fill-accent"
                  : "text-border-hover fill-none"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

export type { RatingProps, RatingSize };
