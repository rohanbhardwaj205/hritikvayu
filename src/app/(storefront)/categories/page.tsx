import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { FolderOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import type { Category } from "@/types";

export const metadata: Metadata = {
  title: "Shop by Category",
  description:
    "Explore our men's clothing categories - Jeans, Cargos, Sweatshirts, Hoodies, Shirts, and T-Shirts.",
};

async function fetchCategories(): Promise<
  (Category & { product_count: number })[]
> {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .is("parent_id", null)
    .order("sort_order", { ascending: true });

  if (!categories || categories.length === 0) return [];

  // Fetch product counts per category
  const categoriesWithCounts = await Promise.all(
    (categories as Category[]).map(async (cat) => {
      const { count } = await supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("category_id", cat.id)
        .eq("is_active", true);

      return { ...cat, product_count: count ?? 0 };
    })
  );

  return categoriesWithCounts;
}

export default async function CategoriesPage() {
  const categories = await fetchCategories();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Categories" },
        ]}
        className="mb-6"
      />

      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">
          Shop by Category
        </h1>
        <p className="mt-2 text-sm text-muted">
          Explore our men&apos;s clothing categories &mdash; Jeans, Cargos, Sweatshirts,
          Hoodies, Shirts, and T-Shirts.
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-2 mb-4">
            <FolderOpen className="h-8 w-8 text-muted" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            No categories yet
          </h3>
          <p className="text-sm text-muted max-w-sm">
            Categories will appear here once they are added to the store.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group relative overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:shadow-lg hover:border-border-hover"
            >
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden bg-surface">
                {category.image_url ? (
                  <Image
                    src={category.image_url}
                    alt={category.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                    <FolderOpen className="h-12 w-12 text-primary/40" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="mt-1 text-xs text-muted line-clamp-2">
                    {category.description}
                  </p>
                )}
                <p className="mt-2 text-xs font-medium text-primary">
                  {category.product_count} product
                  {category.product_count !== 1 ? "s" : ""}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
