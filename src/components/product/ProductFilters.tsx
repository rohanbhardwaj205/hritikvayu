"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  SlidersHorizontal,
  X,
  ChevronDown,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFilterStore } from "@/stores/filterStore";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Button } from "@/components/ui/Button";
import type { Category } from "@/types";

interface ProductFiltersProps {
  categories?: Category[];
  className?: string;
}

const STANDARD_SIZES = ["S", "M", "L", "XL", "XXL", "28", "30", "32", "34", "36", "38", "40"];

const COLOR_OPTIONS = [
  { name: "Black", hex: "#171717" },
  { name: "White", hex: "#FAFAFA" },
  { name: "Navy", hex: "#1E3A5F" },
  { name: "Grey", hex: "#6B7280" },
  { name: "Olive", hex: "#556B2F" },
  { name: "Blue", hex: "#2563EB" },
  { name: "Brown", hex: "#8B4513" },
];

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border pb-5">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-2 text-sm font-semibold text-foreground cursor-pointer"
      >
        {title}
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterContent({ categories }: { categories?: Category[] }) {
  const {
    category,
    minPrice,
    maxPrice,
    sizes,
    colors,
    setFilter,
    resetFilters,
  } = useFilterStore();

  const hasActiveFilters =
    category !== null ||
    minPrice !== null ||
    maxPrice !== null ||
    sizes.length > 0 ||
    colors.length > 0;

  const toggleSize = (size: string) => {
    const updated = sizes.includes(size)
      ? sizes.filter((s) => s !== size)
      : [...sizes, size];
    setFilter("sizes", updated);
  };

  const toggleColor = (color: string) => {
    const updated = colors.includes(color)
      ? colors.filter((c) => c !== color)
      : [...colors, color];
    setFilter("colors", updated);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground font-display">
          Filters
        </h3>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-hover transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            Clear All
          </button>
        )}
      </div>

      {/* Category */}
      {categories && categories.length > 0 && (
        <FilterSection title="Category">
          <div className="space-y-2">
            {categories.map((cat) => (
              <label
                key={cat.id}
                className="flex items-center gap-2.5 cursor-pointer group"
              >
                <input
                  type="radio"
                  name="category"
                  checked={category === cat.slug}
                  onChange={() =>
                    setFilter(
                      "category",
                      category === cat.slug ? null : cat.slug
                    )
                  }
                  className="h-4 w-4 rounded-full border-border text-primary focus:ring-primary accent-primary"
                />
                <span className="text-sm text-muted group-hover:text-foreground transition-colors">
                  {cat.name}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Price Range */}
      <FilterSection title="Price Range">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="text-xs text-muted mb-1 block">Min</label>
            <input
              type="number"
              placeholder="0"
              value={minPrice ?? ""}
              onChange={(e) =>
                setFilter(
                  "minPrice",
                  e.target.value ? Number(e.target.value) : null
                )
              }
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground placeholder:text-muted-light focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <span className="text-muted mt-5">-</span>
          <div className="flex-1">
            <label className="text-xs text-muted mb-1 block">Max</label>
            <input
              type="number"
              placeholder="5000"
              value={maxPrice ?? ""}
              onChange={(e) =>
                setFilter(
                  "maxPrice",
                  e.target.value ? Number(e.target.value) : null
                )
              }
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground placeholder:text-muted-light focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </FilterSection>

      {/* Sizes */}
      <FilterSection title="Size">
        <div className="flex flex-wrap gap-2">
          {STANDARD_SIZES.map((size) => {
            const isActive = sizes.includes(size);
            return (
              <button
                key={size}
                onClick={() => toggleSize(size)}
                className={cn(
                  "flex h-9 min-w-[2.5rem] items-center justify-center rounded-lg border px-3 text-xs font-medium transition-all cursor-pointer",
                  isActive
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-white text-foreground hover:border-border-hover"
                )}
              >
                {size}
              </button>
            );
          })}
        </div>
      </FilterSection>

      {/* Colors */}
      <FilterSection title="Color">
        <div className="flex flex-wrap gap-2.5">
          {COLOR_OPTIONS.map((color) => {
            const isActive = colors.includes(color.name);
            return (
              <button
                key={color.name}
                onClick={() => toggleColor(color.name)}
                className={cn(
                  "relative h-8 w-8 rounded-full transition-all cursor-pointer",
                  "ring-offset-2 ring-offset-background",
                  isActive ? "ring-2 ring-primary" : "ring-1 ring-border hover:ring-border-hover"
                )}
                style={{ backgroundColor: color.hex }}
                aria-label={`${color.name}${isActive ? " (selected)" : ""}`}
                title={color.name}
              >
                {isActive && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <svg
                      className={cn(
                        "h-4 w-4",
                        ["White", "Yellow", "Gold"].includes(color.name)
                          ? "text-foreground"
                          : "text-white"
                      )}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </FilterSection>
    </div>
  );
}

export function ProductFilters({
  categories,
  className,
}: ProductFiltersProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  // Desktop: inline sidebar
  if (isDesktop) {
    return (
      <aside className={cn("w-64 shrink-0", className)}>
        <FilterContent categories={categories} />
      </aside>
    );
  }

  // Mobile: slide-out drawer
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setMobileOpen(true)}
        className={className}
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filters
      </Button>

      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50"
              onClick={() => setMobileOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute left-0 top-0 h-full w-full max-w-sm bg-card shadow-xl flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <h2 className="font-display text-lg font-semibold text-foreground">
                  Filters
                </h2>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="rounded-full p-1.5 text-muted hover:text-foreground hover:bg-surface-2 transition-colors cursor-pointer"
                  aria-label="Close filters"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-5 py-5">
                <FilterContent categories={categories} />
              </div>

              {/* Footer */}
              <div className="border-t border-border px-5 py-4">
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => setMobileOpen(false)}
                >
                  Show Results
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
