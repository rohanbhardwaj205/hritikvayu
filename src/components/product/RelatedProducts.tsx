import { createClient } from "@/lib/supabase/server";
import { RelatedProductsCarousel } from "./RelatedProductsCarousel";
import type { Product } from "@/types";

interface RelatedProductsProps {
  productId: string;
  categoryId: string | null;
  className?: string;
}

async function fetchRelatedProducts(
  productId: string,
  categoryId: string | null
): Promise<Product[]> {
  const supabase = await createClient();

  let query = supabase
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
    .neq("id", productId)
    .order("avg_rating", { ascending: false })
    .limit(8);

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  const { data } = await query;

  return (data as Product[]) ?? [];
}

export async function RelatedProducts({
  productId,
  categoryId,
  className,
}: RelatedProductsProps) {
  const products = await fetchRelatedProducts(productId, categoryId);

  if (products.length === 0) return null;

  return (
    <section className={className}>
      <h2 className="font-display text-2xl font-bold text-foreground mb-6">
        You May Also Like
      </h2>
      <RelatedProductsCarousel products={products} />
    </section>
  );
}
