"use client";

import { cn, formatPrice } from "@/lib/utils";

type PriceSize = "sm" | "md" | "lg";

interface PriceTagProps {
  price: number;
  comparePrice?: number;
  size?: PriceSize;
  className?: string;
}

const sizeStyles: Record<PriceSize, { price: string; compare: string; badge: string }> = {
  sm: {
    price: "text-sm font-semibold",
    compare: "text-xs",
    badge: "text-[10px] px-1.5 py-0.5",
  },
  md: {
    price: "text-lg font-bold",
    compare: "text-sm",
    badge: "text-xs px-2 py-0.5",
  },
  lg: {
    price: "text-2xl font-bold",
    compare: "text-base",
    badge: "text-xs px-2 py-1",
  },
};

function calculateDiscount(price: number, comparePrice: number): number {
  if (comparePrice <= 0) return 0;
  return Math.round(((comparePrice - price) / comparePrice) * 100);
}

export function PriceTag({
  price,
  comparePrice,
  size = "md",
  className,
}: PriceTagProps) {
  const styles = sizeStyles[size];
  const discount =
    comparePrice && comparePrice > price
      ? calculateDiscount(price, comparePrice)
      : 0;

  return (
    <div className={cn("inline-flex items-center gap-2 flex-wrap", className)}>
      <span className={cn(styles.price, "text-foreground")}>
        {formatPrice(price)}
      </span>

      {comparePrice && comparePrice > price && (
        <>
          <span
            className={cn(
              styles.compare,
              "text-muted line-through"
            )}
          >
            {formatPrice(comparePrice)}
          </span>

          {discount > 0 && (
            <span
              className={cn(
                styles.badge,
                "bg-success/10 text-success font-semibold rounded-md"
              )}
            >
              {discount}% off
            </span>
          )}
        </>
      )}
    </div>
  );
}

export type { PriceTagProps, PriceSize };
