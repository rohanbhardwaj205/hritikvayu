import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInfo } from "@/components/product/ProductInfo";
import { ProductReviews } from "@/components/product/ProductReviews";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { SizeGuideModal } from "@/components/product/SizeGuideModal";
import { StickyMobileBar } from "@/components/product/StickyMobileBar";
import type { Product, Review } from "@/types";

export const revalidate = 120;

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

async function fetchProductBySlug(slug: string): Promise<Product | null> {
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
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !data) return null;

  return data as Product;
}

async function fetchProductReviews(productId: string): Promise<Review[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("reviews")
    .select(
      `
      *,
      profile:profiles(full_name, avatar_url)
    `
    )
    .eq("product_id", productId)
    .eq("is_approved", true)
    .order("created_at", { ascending: false });

  return (data ?? []) as Review[];
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);

  if (!product) {
    return { title: "Product Not Found" };
  }

  const primaryImage = product.images?.find((img) => img.is_primary) ?? product.images?.[0];

  return {
    title: product.meta_title ?? product.name,
    description:
      product.meta_description ??
      product.description ??
      `Shop ${product.name} at Vastrayug. Premium Indian clothing with traditional craftsmanship.`,
    openGraph: {
      title: product.name,
      description: product.description ?? undefined,
      images: primaryImage ? [{ url: primaryImage.url }] : undefined,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description ?? undefined,
      images: primaryImage ? [primaryImage.url] : undefined,
    },
  };
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const reviews = await fetchProductReviews(product.id);
  const images = product.images ?? [];

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/products" },
    ...(product.category
      ? [
          {
            label: product.category.name,
            href: `/categories/${product.category.slug}`,
          },
        ]
      : []),
    { label: product.name },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb items={breadcrumbItems} className="mb-6" />

      {/* Product Detail: Two Column */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Left: Gallery */}
        <ProductGallery images={images} productName={product.name} />

        {/* Right: Info */}
        <div>
          <ProductInfo product={product} />
          <div className="mt-4">
            <SizeGuideModal />
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-16 border-t border-border pt-12">
        <ProductReviews
          reviews={reviews}
          productId={product.id}
          averageRating={product.avg_rating}
          totalCount={product.review_count}
        />
      </div>

      {/* Related Products */}
      <div className="mt-16 border-t border-border pt-12">
        <RelatedProducts
          productId={product.id}
          categoryId={product.category_id}
        />
      </div>

      {/* Sticky Mobile Add-to-Cart Bar */}
      <StickyMobileBar product={product} />
    </div>
  );
}
