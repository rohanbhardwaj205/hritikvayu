"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFilterStore } from "@/stores/filterStore";

type SortOption = "newest" | "price_asc" | "price_desc" | "popular" | "rating";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" },
  { value: "rating", label: "Highest Rated" },
];

interface ProductSortProps {
  className?: string;
}

export function ProductSort({ className }: ProductSortProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const sort = useFilterStore((s) => s.sort);
  const setFilter = useFilterStore((s) => s.setFilter);

  const currentLabel =
    SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "Sort By";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-foreground transition-colors cursor-pointer",
          "hover:border-border-hover hover:bg-surface",
          isOpen && "border-primary ring-1 ring-primary"
        )}
      >
        <span className="text-muted">Sort:</span>
        {currentLabel}
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-20 mt-2 w-52 origin-top-right overflow-hidden rounded-xl border border-border bg-card shadow-xl"
          >
            <div className="py-1">
              {SORT_OPTIONS.map((option) => {
                const isActive = sort === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => {
                      setFilter("sort", option.value);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center px-4 py-2.5 text-sm transition-colors cursor-pointer",
                      isActive
                        ? "bg-primary/5 text-primary font-medium"
                        : "text-foreground/80 hover:bg-surface hover:text-foreground"
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
