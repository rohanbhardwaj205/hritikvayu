import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ITEMS_PER_PAGE } from "@/constants/config";
import { ProductCatalogClient } from "./ProductCatalogClient";
import type { Product, Category, ProductFilters as ProductFiltersType } from "@/types";

export const metadata: Metadata = {
  title: "Shop Men's Clothing",
  description:
    "Browse our collection of premium men's jeans, cargos, hoodies, sweatshirts, shirts and t-shirts.",
};

interface ProductsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

async function fetchProducts(filters: ProductFiltersType) {
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select(
      `
      *,
      category:categories(*),
      images:product_images(*),
      variants:product_variants(*)
    `,
      { count: "exact" }
    )
    .eq("is_active", true);

  // Apply filters
  if (filters.category) {
    // Join through categories by slug
    query = query.eq("category.slug", filters.category);
  }

  if (filters.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,tags.cs.{${filters.search}}`
    );
  }

  if (filters.minPrice !== undefined) {
    query = query.gte("base_price", filters.minPrice * 100);
  }

  if (filters.maxPrice !== undefined) {
    query = query.lte("base_price", filters.maxPrice * 100);
  }

  if (filters.featured) {
    query = query.eq("is_featured", true);
  }

  // Apply sort
  switch (filters.sort) {
    case "price_asc":
      query = query.order("base_price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("base_price", { ascending: false });
      break;
    case "popular":
      query = query.order("review_count", { ascending: false });
      break;
    case "rating":
      query = query.order("avg_rating", { ascending: false });
      break;
    case "newest":
    default:
      query = query.order("created_at", { ascending: false });
      break;
  }

  // Pagination
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? ITEMS_PER_PAGE;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, count, error } = await query;

  if (error) {
    console.error("Error fetching products:", error);
    return { products: [] as Product[], total: 0 };
  }

  return {
    products: (data ?? []) as Product[],
    total: count ?? 0,
  };
}

async function fetchCategories(): Promise<Category[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  return (data ?? []) as Category[];
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;

  const filters: ProductFiltersType = {
    category: typeof params.category === "string" ? params.category : undefined,
    search: typeof params.search === "string" ? params.search : undefined,
    sort: (typeof params.sort === "string" ? params.sort : "newest") as ProductFiltersType["sort"],
    minPrice: typeof params.minPrice === "string" ? Number(params.minPrice) : undefined,
    maxPrice: typeof params.maxPrice === "string" ? Number(params.maxPrice) : undefined,
    page: typeof params.page === "string" ? Number(params.page) : 1,
    pageSize: ITEMS_PER_PAGE,
  };

  const [{ products, total }, categories] = await Promise.all([
    fetchProducts(filters),
    fetchCategories(),
  ]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Shop" },
        ]}
        className="mb-6"
      />

      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">
          Shop Men&apos;s Clothing
        </h1>
        <p className="mt-2 text-sm text-muted">
          Browse our collection of premium men&apos;s jeans, cargos, hoodies, sweatshirts, shirts and t-shirts.
        </p>
      </div>

      <ProductCatalogClient
        products={products}
        categories={categories}
        totalPages={totalPages}
        currentPage={filters.page ?? 1}
        totalCount={total}
      />
    </div>
  );
}
