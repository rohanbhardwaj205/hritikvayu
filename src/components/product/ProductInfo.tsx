"use client";

import { useState, useMemo } from "react";
import {
  Heart,
  ShoppingBag,
  Truck,
  Shield,
  RotateCcw,
  Share2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import { Button } from "@/components/ui/Button";
import { PriceTag } from "@/components/ui/PriceTag";
import { Rating } from "@/components/ui/Rating";
import { QuantitySelector } from "@/components/ui/QuantitySelector";
import { VariantSelector } from "./VariantSelector";
import { LOW_STOCK_THRESHOLD } from "@/constants/config";
import type { Product, ProductVariant } from "@/types";

interface ProductInfoProps {
  product: Product;
  className?: string;
}

type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

function getStockStatus(variant: ProductVariant | null): StockStatus {
  if (!variant || variant.stock <= 0) return "out_of_stock";
  if (variant.stock <= (variant.low_stock_threshold || LOW_STOCK_THRESHOLD))
    return "low_stock";
  return "in_stock";
}

const stockConfig: Record<
  StockStatus,
  { label: string; icon: typeof CheckCircle2; className: string }
> = {
  in_stock: {
    label: "In Stock",
    icon: CheckCircle2,
    className: "text-success",
  },
  low_stock: {
    label: "Low Stock",
    icon: AlertTriangle,
    className: "text-warning",
  },
  out_of_stock: {
    label: "Out of Stock",
    icon: XCircle,
    className: "text-error",
  },
};

export function ProductInfo({ product, className }: ProductInfoProps) {
  const variants = product.variants ?? [];
  const hasVariants = variants.length > 0;

  const [selectedVariant, setSelectedVariant] =
    useState<ProductVariant | null>(
      variants.find((v) => v.stock > 0 && v.is_active) ?? variants[0] ?? null
    );
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const openDrawer = useCartStore((s) => s.openDrawer);

  const wishlistAddItem = useWishlistStore((s) => s.addItem);
  const wishlistRemoveItem = useWishlistStore((s) => s.removeItem);
  const isInWishlist = useWishlistStore((s) =>
    s.isInWishlist(product.id)
  );

  const primaryImage =
    product.images?.find((img) => img.is_primary) ?? product.images?.[0];

  const currentPrice = useMemo(() => {
    if (selectedVariant?.price_override) return selectedVariant.price_override;
    return product.base_price;
  }, [selectedVariant, product.base_price]);

  const stockStatus = getStockStatus(selectedVariant);
  const { label: stockLabel, icon: StockIcon, className: stockClass } =
    stockConfig[stockStatus];

  const handleAddToCart = () => {
    if (!selectedVariant || stockStatus === "out_of_stock") return;

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

    openDrawer();

    setTimeout(() => setAddingToCart(false), 600);
  };

  const handleWishlistToggle = () => {
    if (isInWishlist) {
      wishlistRemoveItem(product.id);
    } else {
      wishlistAddItem({
        productId: product.id,
        productName: product.name,
        imageUrl: primaryImage?.url ?? "",
        price: product.base_price,
        slug: product.slug,
      });
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/products/${product.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description ?? `Check out ${product.name} on Vastrayug`,
          url,
        });
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Product Name */}
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
          {product.name}
        </h1>

        {/* Rating */}
        {product.review_count > 0 && (
          <div className="mt-2 flex items-center gap-2">
            <Rating value={product.avg_rating} size="sm" readonly />
            <a
              href="#reviews"
              className="text-sm text-muted hover:text-primary transition-colors"
            >
              {product.review_count} review
              {product.review_count !== 1 ? "s" : ""}
            </a>
          </div>
        )}
      </div>

      {/* Price */}
      <PriceTag
        price={currentPrice}
        comparePrice={product.compare_price ?? undefined}
        size="lg"
      />

      {/* Short Description */}
      {product.description && (
        <p className="text-sm leading-relaxed text-muted">
          {product.description}
        </p>
      )}

      {/* Variant Selector */}
      {hasVariants && (
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

      {/* Quantity & Add to Cart */}
      <div className="space-y-4 pt-2">
        {/* Quantity */}
        <div>
          <label className="text-sm font-semibold text-foreground mb-2 block">
            Quantity
          </label>
          <QuantitySelector
            value={quantity}
            onChange={setQuantity}
            min={1}
            max={selectedVariant?.stock ?? 1}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={stockStatus === "out_of_stock" || !selectedVariant}
            loading={addingToCart}
            onClick={handleAddToCart}
          >
            <ShoppingBag className="h-5 w-5" />
            {stockStatus === "out_of_stock" ? "Out of Stock" : "Add to Cart"}
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={handleWishlistToggle}
            className={cn(
              "shrink-0 px-4",
              isInWishlist && "border-red-200 bg-red-50 text-red-500 hover:bg-red-100"
            )}
            aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={cn(
                "h-5 w-5",
                isInWishlist && "fill-red-500 text-red-500"
              )}
            />
          </Button>
        </div>
      </div>

      {/* Stock Status */}
      <div className="flex items-center gap-2">
        <StockIcon className={cn("h-4 w-4", stockClass)} />
        <span className={cn("text-sm font-medium", stockClass)}>
          {stockLabel}
          {stockStatus === "low_stock" && selectedVariant && (
            <span className="ml-1 font-normal">
              - Only {selectedVariant.stock} left
            </span>
          )}
        </span>
      </div>

      {/* Delivery & Policy Info */}
      <div className="space-y-3 rounded-xl border border-border bg-surface/50 p-4">
        <div className="flex items-center gap-3">
          <Truck className="h-4 w-4 text-muted shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">
              Free Delivery
            </p>
            <p className="text-xs text-muted">
              On orders above Rs 999. Estimated delivery in 5-7 business days.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <RotateCcw className="h-4 w-4 text-muted shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">
              Easy Returns
            </p>
            <p className="text-xs text-muted">
              14-day hassle-free return policy.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Shield className="h-4 w-4 text-muted shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">
              Secure Payment
            </p>
            <p className="text-xs text-muted">
              100% secure payment via Razorpay.
            </p>
          </div>
        </div>
      </div>

      {/* Share */}
      <button
        onClick={handleShare}
        className="flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors cursor-pointer"
      >
        <Share2 className="h-4 w-4" />
        Share this product
      </button>
    </div>
  );
}
