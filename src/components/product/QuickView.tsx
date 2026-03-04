"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, ExternalLink } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useCartStore } from "@/stores/cartStore";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { PriceTag } from "@/components/ui/PriceTag";
import { Rating } from "@/components/ui/Rating";
import { QuantitySelector } from "@/components/ui/QuantitySelector";
import { VariantSelector } from "./VariantSelector";
import type { Product, ProductVariant } from "@/types";

interface QuickViewProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickView({ product, isOpen, onClose }: QuickViewProps) {
  if (!product) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <QuickViewContent product={product} onClose={onClose} />
    </Modal>
  );
}

function QuickViewContent({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const variants = product.variants ?? [];
  const [selectedVariant, setSelectedVariant] =
    useState<ProductVariant | null>(
      variants.find((v) => v.stock > 0 && v.is_active) ?? variants[0] ?? null
    );
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const openDrawer = useCartStore((s) => s.openDrawer);

  const primaryImage =
    product.images?.find((img) => img.is_primary) ?? product.images?.[0];

  const currentPrice = useMemo(() => {
    if (selectedVariant?.price_override) return selectedVariant.price_override;
    return product.base_price;
  }, [selectedVariant, product.base_price]);

  const isOutOfStock = selectedVariant ? selectedVariant.stock <= 0 : true;

  const handleAddToCart = () => {
    if (!selectedVariant || isOutOfStock) return;

    setAddingToCart(true);

    const variantLabel = [selectedVariant.size, selectedVariant.color]
      .filter(Boolean)
      .join(" / ");

    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      productName: product.name,
      variantLabel: variantLabel || null,
      imageUrl: primaryImage?.url ?? "",
      unitPrice: currentPrice,
      quantity,
      maxStock: selectedVariant.stock,
      slug: product.slug,
    });

    onClose();
    openDrawer();
    setTimeout(() => setAddingToCart(false), 600);
  };

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden rounded-xl bg-surface">
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt_text ?? product.name}
            fill
            sizes="(max-width: 640px) 100vw, 300px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ShoppingBag className="h-12 w-12 text-muted-light" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          <h3 className="font-display text-xl font-bold text-foreground">
            {product.name}
          </h3>

          {product.review_count > 0 && (
            <div className="flex items-center gap-1.5">
              <Rating value={product.avg_rating} size="sm" readonly />
              <span className="text-xs text-muted">
                ({product.review_count})
              </span>
            </div>
          )}

          <PriceTag
            price={currentPrice}
            comparePrice={product.compare_price ?? undefined}
            size="md"
          />

          {product.description && (
            <p className="text-sm text-muted line-clamp-3">
              {product.description}
            </p>
          )}

          {/* Variant Selector */}
          {variants.length > 0 && (
            <VariantSelector
              variants={variants}
              selectedVariant={selectedVariant}
              onSelect={(v) => {
                setSelectedVariant(v);
                setQuantity(1);
              }}
              basePrice={product.base_price}
            />
          )}

          {/* Quantity */}
          {!isOutOfStock && (
            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">
                Quantity
              </label>
              <QuantitySelector
                value={quantity}
                onChange={setQuantity}
                min={1}
                max={selectedVariant?.stock ?? 1}
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-2">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={isOutOfStock}
            loading={addingToCart}
            onClick={handleAddToCart}
          >
            <ShoppingBag className="h-5 w-5" />
            {isOutOfStock ? "Out of Stock" : "Add to Cart"}
          </Button>

          <Link
            href={`/products/${product.slug}`}
            onClick={onClose}
            className="flex items-center justify-center gap-1.5 text-sm font-medium text-primary hover:text-primary-hover transition-colors"
          >
            View Full Details
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
