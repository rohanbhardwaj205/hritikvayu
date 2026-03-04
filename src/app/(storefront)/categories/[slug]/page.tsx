import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ITEMS_PER_PAGE } from "@/constants/config";
import { ProductCatalogClient } from "../../products/ProductCatalogClient";
import type { Product, Category, ProductFilters } from "@/types";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

async function fetchCategory(slug: string): Promise<Category | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !data) return null;
  return data as Category;
}

async function fetchCategoryProducts(
  categoryId: string,
  filters: ProductFilters
) {
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
    .eq("is_active", true)
    .eq("category_id", categoryId);

  if (filters.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
    );
  }

  if (filters.minPrice !== undefined) {
    query = query.gte("base_price", filters.minPrice * 100);
  }

  if (filters.maxPrice !== undefined) {
    query = query.lte("base_price", filters.maxPrice * 100);
  }

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

  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? ITEMS_PER_PAGE;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, count, error } = await query;

  if (error) {
    console.error("Error fetching category products:", error);
    return { products: [] as Product[], total: 0 };
  }

  return {
    products: (data ?? []) as Product[],
    total: count ?? 0,
  };
}

async function fetchAllCategories(): Promise<Category[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  return (data ?? []) as Category[];
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await fetchCategory(slug);

  if (!category) {
    return { title: "Category Not Found" };
  }

  return {
    title: category.name,
    description:
      category.description ??
      `Shop ${category.name} at Vastrayug. Premium Indian clothing with traditional craftsmanship.`,
    openGraph: {
      title: `${category.name} - Vastrayug`,
      description: category.description ?? undefined,
      images: category.image_url ? [{ url: category.image_url }] : undefined,
    },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;
  const category = await fetchCategory(slug);

  if (!category) {
    notFound();
  }

  const resolvedSearchParams = await searchParams;

  const filters: ProductFilters = {
    sort: (typeof resolvedSearchParams.sort === "string"
      ? resolvedSearchParams.sort
      : "newest") as ProductFilters["sort"],
    minPrice:
      typeof resolvedSearchParams.minPrice === "string"
        ? Number(resolvedSearchParams.minPrice)
        : undefined,
    maxPrice:
      typeof resolvedSearchParams.maxPrice === "string"
        ? Number(resolvedSearchParams.maxPrice)
        : undefined,
    search:
      typeof resolvedSearchParams.search === "string"
        ? resolvedSearchParams.search
        : undefined,
    page:
      typeof resolvedSearchParams.page === "string"
        ? Number(resolvedSearchParams.page)
        : 1,
    pageSize: ITEMS_PER_PAGE,
  };

  const [{ products, total }, allCategories] = await Promise.all([
    fetchCategoryProducts(category.id, filters),
    fetchAllCategories(),
  ]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Categories", href: "/categories" },
          { label: category.name },
        ]}
        className="mb-6"
      />

      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">
          {category.name}
        </h1>
        {category.description && (
          <p className="mt-2 text-sm text-muted">{category.description}</p>
        )}
      </div>

      <ProductCatalogClient
        products={products}
        categories={allCategories}
        totalPages={totalPages}
        currentPage={filters.page ?? 1}
        totalCount={total}
      />
    </div>
  );
}
