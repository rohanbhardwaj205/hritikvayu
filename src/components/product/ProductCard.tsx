"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ShoppingBag, Eye } from "lucide-react";
import { cn, truncate } from "@/lib/utils";
import { fadeUp } from "@/lib/animations";
import { useCartStore } from "@/stores/cartStore";
import { Badge } from "@/components/ui/Badge";
import { Rating } from "@/components/ui/Rating";
import { PriceTag } from "@/components/ui/PriceTag";
import { Button } from "@/components/ui/Button";
import { WishlistButton } from "./WishlistButton";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const openDrawer = useCartStore((s) => s.openDrawer);

  const primaryImage =
    product.images?.find((img) => img.is_primary) ?? product.images?.[0];
  const secondaryImage = product.images?.find((img) => !img.is_primary);

  const hasMultipleVariants =
    product.variants && product.variants.length > 1;

  const defaultVariant = product.variants?.[0];
  const isOutOfStock =
    product.variants && product.variants.length > 0
      ? product.variants.every((v) => v.stock <= 0)
      : false;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!defaultVariant || isOutOfStock) return;

    const variantLabel = [defaultVariant.size, defaultVariant.color]
      .filter(Boolean)
      .join(" / ");

    addItem({
      productId: product.id,
      variantId: defaultVariant.id,
      productName: product.name,
      variantLabel: variantLabel || null,
      imageUrl: primaryImage?.url ?? "",
      unitPrice: defaultVariant.price_override ?? product.base_price,
      quantity: 1,
      maxStock: defaultVariant.stock,
      slug: product.slug,
    });

    openDrawer();
  };

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      className={cn("group", className)}
    >
      <Link
        href={`/products/${product.slug}`}
        className="block"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-surface">
          {/* Primary Image */}
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt_text ?? product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={cn(
                "object-cover transition-transform duration-500",
                isHovered && secondaryImage
                  ? "scale-110 opacity-0"
                  : "scale-100"
              )}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <ShoppingBag className="h-12 w-12 text-muted-light" />
            </div>
          )}

          {/* Secondary Image (shown on hover) */}
          {secondaryImage && (
            <Image
              src={secondaryImage.url}
              alt={secondaryImage.alt_text ?? product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={cn(
                "absolute inset-0 object-cover transition-all duration-500",
                isHovered
                  ? "scale-105 opacity-100"
                  : "scale-100 opacity-0"
              )}
            />
          )}

          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Category Badge */}
          {product.category && (
            <div className="absolute top-3 left-3">
              <Badge
                variant="default"
                size="sm"
                className="bg-white/90 backdrop-blur-sm text-foreground shadow-sm"
              >
                {product.category.name}
              </Badge>
            </div>
          )}

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <span className="rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-foreground">
                Out of Stock
              </span>
            </div>
          )}

          {/* Wishlist Button */}
          <div className="absolute top-3 right-3 z-10">
            <WishlistButton product={product} size="sm" />
          </div>

          {/* Quick Actions (visible on hover) */}
          <div
            className={cn(
              "absolute bottom-3 left-3 right-3 transition-all duration-300",
              isHovered
                ? "translate-y-0 opacity-100"
                : "translate-y-2 opacity-0"
            )}
          >
            {!isOutOfStock && (
              <>
                {hasMultipleVariants ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    fullWidth
                    className="bg-white/95 backdrop-blur-sm shadow-md hover:bg-white"
                  >
                    <Eye className="h-4 w-4" />
                    View Options
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    className="shadow-md"
                    onClick={handleQuickAdd}
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Add to Cart
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="mt-3 space-y-1.5 px-1">
          <h3 className="text-sm font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {product.description && (
            <p className="text-xs text-muted line-clamp-1">
              {truncate(product.description, 60)}
            </p>
          )}

          {product.review_count > 0 && (
            <div className="flex items-center gap-1.5">
              <Rating value={product.avg_rating} size="sm" readonly />
              <span className="text-xs text-muted">
                ({product.review_count})
              </span>
            </div>
          )}

          <PriceTag
            price={product.base_price}
            comparePrice={product.compare_price ?? undefined}
            size="sm"
          />
        </div>
      </Link>
    </motion.div>
  );
}
