"use client";

import { Check } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import type { ProductVariant } from "@/types";

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedVariant: ProductVariant | null;
  onSelect: (variant: ProductVariant) => void;
  basePrice: number;
  className?: string;
}

export function VariantSelector({
  variants,
  selectedVariant,
  onSelect,
  basePrice,
  className,
}: VariantSelectorProps) {
  // Extract unique sizes and colors from variants
  const sizes = Array.from(
    new Set(variants.map((v) => v.size).filter(Boolean))
  ) as string[];
  const colors = Array.from(
    new Map(
      variants
        .filter((v) => v.color)
        .map((v) => [v.color!, { name: v.color!, hex: v.color_hex }])
    ).values()
  );

  // Find a variant matching chosen size + color
  const findVariant = (size: string | null, color: string | null) => {
    return variants.find(
      (v) =>
        (size === null || v.size === size) &&
        (color === null || v.color === color)
    );
  };

  // Check if a specific size/color combo is available
  const isVariantAvailable = (size: string | null, color: string | null) => {
    const v = findVariant(size, color);
    return v ? v.stock > 0 && v.is_active : false;
  };

  const handleSizeSelect = (size: string) => {
    const match = findVariant(size, selectedVariant?.color ?? null) ??
      variants.find((v) => v.size === size && v.stock > 0);
    if (match) onSelect(match);
  };

  const handleColorSelect = (color: string) => {
    const match = findVariant(selectedVariant?.size ?? null, color) ??
      variants.find((v) => v.color === color && v.stock > 0);
    if (match) onSelect(match);
  };

  return (
    <div className={cn("space-y-5", className)}>
      {/* Size Selector */}
      {sizes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-foreground">
              Size
              {selectedVariant?.size && (
                <span className="ml-1.5 text-muted font-normal">
                  - {selectedVariant.size}
                </span>
              )}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const isSelected = selectedVariant?.size === size;
              const available = variants.some(
                (v) =>
                  v.size === size &&
                  v.stock > 0 &&
                  v.is_active &&
                  (selectedVariant?.color ? v.color === selectedVariant.color : true)
              );

              return (
                <button
                  key={size}
                  onClick={() => handleSizeSelect(size)}
                  disabled={!available}
                  className={cn(
                    "flex h-10 min-w-[2.75rem] items-center justify-center rounded-lg border px-3.5 text-sm font-medium transition-all cursor-pointer",
                    isSelected
                      ? "border-primary bg-primary text-white shadow-sm"
                      : available
                        ? "border-border bg-white text-foreground hover:border-primary hover:text-primary"
                        : "border-border bg-surface-2 text-muted-light cursor-not-allowed line-through opacity-60"
                  )}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Color Selector */}
      {colors.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-foreground">
              Color
              {selectedVariant?.color && (
                <span className="ml-1.5 text-muted font-normal">
                  - {selectedVariant.color}
                </span>
              )}
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            {colors.map((color) => {
              const isSelected = selectedVariant?.color === color.name;
              const available = variants.some(
                (v) =>
                  v.color === color.name &&
                  v.stock > 0 &&
                  v.is_active &&
                  (selectedVariant?.size ? v.size === selectedVariant.size : true)
              );

              return (
                <button
                  key={color.name}
                  onClick={() => handleColorSelect(color.name)}
                  disabled={!available}
                  className={cn(
                    "relative h-10 w-10 rounded-full transition-all cursor-pointer",
                    "ring-offset-2 ring-offset-background",
                    isSelected
                      ? "ring-2 ring-primary"
                      : "ring-1 ring-border hover:ring-border-hover",
                    !available && "opacity-40 cursor-not-allowed"
                  )}
                  style={{ backgroundColor: color.hex ?? undefined }}
                  aria-label={`${color.name}${isSelected ? " (selected)" : ""}${!available ? " (unavailable)" : ""}`}
                  title={color.name}
                >
                  {isSelected && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <Check
                        className={cn(
                          "h-5 w-5",
                          isLightColor(color.hex)
                            ? "text-foreground"
                            : "text-white"
                        )}
                        strokeWidth={3}
                      />
                    </span>
                  )}
                  {!available && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <div className="h-[1px] w-full rotate-45 bg-red-500" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected variant price (if different from base) */}
      {selectedVariant?.price_override &&
        selectedVariant.price_override !== basePrice && (
          <p className="text-sm text-muted">
            Selected variant:{" "}
            <span className="font-semibold text-foreground">
              {formatPrice(selectedVariant.price_override)}
            </span>
          </p>
        )}
    </div>
  );
}

/** Simple heuristic to determine if a hex color is light */
function isLightColor(hex: string | null): boolean {
  if (!hex) return false;
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6;
}
