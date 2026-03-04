"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductCard } from "./ProductCard";
import type { Product } from "@/types";

interface RelatedProductsCarouselProps {
  products: Product[];
}

export function RelatedProductsCarousel({
  products,
}: RelatedProductsCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.offsetWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative group/carousel">
      {/* Scroll Container */}
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory"
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="w-[260px] shrink-0 snap-start sm:w-[220px] md:w-[240px] lg:w-[260px]"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {products.length > 3 && (
        <>
          <button
            onClick={() => scroll("left")}
            className="absolute -left-3 top-[35%] -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white border border-border shadow-md text-foreground opacity-0 transition-all hover:bg-surface group-hover/carousel:opacity-100 cursor-pointer"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="absolute -right-3 top-[35%] -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white border border-border shadow-md text-foreground opacity-0 transition-all hover:bg-surface group-hover/carousel:opacity-100 cursor-pointer"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}
    </div>
  );
}
