"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useFilterStore } from "@/stores/filterStore";
import { ProductFilters } from "@/components/product/ProductFilters";
import { ProductSort } from "@/components/product/ProductSort";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Pagination } from "@/components/ui/Pagination";
import type { Product, Category } from "@/types";

interface ProductCatalogClientProps {
  products: Product[];
  categories: Category[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
}

export function ProductCatalogClient({
  products,
  categories,
  totalPages,
  currentPage,
  totalCount,
}: ProductCatalogClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(page));
      router.push(`/products?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Sidebar Filters */}
      <ProductFilters categories={categories} />

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Top Bar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted">
            Showing{" "}
            <span className="font-medium text-foreground">{totalCount}</span>{" "}
            product{totalCount !== 1 ? "s" : ""}
          </p>
          <ProductSort />
        </div>

        {/* Product Grid */}
        <ProductGrid products={products} />

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            className="mt-8"
          />
        )}
      </div>
    </div>
  );
}
