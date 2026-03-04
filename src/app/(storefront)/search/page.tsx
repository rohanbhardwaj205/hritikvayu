import type { Metadata } from "next";
import { Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ITEMS_PER_PAGE } from "@/constants/config";
import type { Product } from "@/types";

interface SearchPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : "";

  return {
    title: query ? `Search results for "${query}"` : "Search",
    description: `Search results for "${query}" at Vastrayug.`,
  };
}

async function searchProducts(query: string): Promise<Product[]> {
  if (!query.trim()) return [];

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      category:categories(*),
      images:product_images(*),
      variants:product_variants(*)
    `
    )
    .eq("is_active", true)
    .or(
      `name.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`
    )
    .order("avg_rating", { ascending: false })
    .limit(ITEMS_PER_PAGE * 2);

  if (error) {
    console.error("Search error:", error);
    return [];
  }

  return (data ?? []) as Product[];
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";

  const products = await searchProducts(query);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Search" },
        ]}
        className="mb-6"
      />

      <div className="mb-8">
        {query ? (
          <>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Search Results
            </h1>
            <p className="mt-2 text-sm text-muted">
              <span className="font-medium text-foreground">
                {products.length}
              </span>{" "}
              result{products.length !== 1 ? "s" : ""} for{" "}
              <span className="font-medium text-foreground">
                &ldquo;{query}&rdquo;
              </span>
            </p>
          </>
        ) : (
          <>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Search
            </h1>
            <p className="mt-2 text-sm text-muted">
              Enter a search term to find products.
            </p>
          </>
        )}
      </div>

      {query ? (
        <ProductGrid
          products={products}
          emptyMessage={`No results for "${query}"`}
          emptyDescription="Try using different keywords or browse our categories to find what you're looking for."
        />
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-2 mb-4">
            <Search className="h-8 w-8 text-muted" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            Start searching
          </h3>
          <p className="text-sm text-muted max-w-sm">
            Use the search bar to find products by name, description, or
            category.
          </p>
        </div>
      )}
    </div>
  );
}
