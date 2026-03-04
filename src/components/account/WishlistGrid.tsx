"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Trash2, Heart } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { useWishlistStore, type WishlistStoreItem } from "@/stores/wishlistStore";
import { useCartStore } from "@/stores/cartStore";
import { useToast } from "@/providers/ToastProvider";

interface WishlistGridProps {
  className?: string;
}

export function WishlistGrid({ className }: WishlistGridProps) {
  const items = useWishlistStore((s) => s.items);
  const removeItem = useWishlistStore((s) => s.removeItem);
  const addToCart = useCartStore((s) => s.addItem);
  const openDrawer = useCartStore((s) => s.openDrawer);
  const { addToast } = useToast();

  const handleAddToCart = (item: WishlistStoreItem) => {
    addToCart({
      productId: item.productId,
      variantId: null,
      productName: item.productName,
      variantLabel: null,
      imageUrl: item.imageUrl,
      unitPrice: item.price,
      quantity: 1,
      maxStock: 99,
      slug: item.slug,
    });
    removeItem(item.productId);
    addToast(`${item.productName} moved to cart`, "success");
    openDrawer();
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-surface-2 mb-4">
          <Heart className="h-8 w-8 text-muted" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          Your wishlist is empty
        </h3>
        <p className="text-sm text-muted max-w-sm mb-6">
          Save items you love to your wishlist and come back to them later.
        </p>
        <Link href="/products">
          <Button variant="primary">Browse Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      <AnimatePresence mode="popLayout">
        {items.map((item) => (
          <motion.div
            key={item.productId}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="rounded-xl border border-border bg-card overflow-hidden group transition-shadow hover:shadow-md"
          >
            {/* Image */}
            <Link
              href={`/products/${item.slug}`}
              className="relative block aspect-[4/5] bg-surface overflow-hidden"
            >
              <Image
                src={item.imageUrl}
                alt={item.productName}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </Link>

            {/* Info */}
            <div className="p-4 space-y-3">
              <div>
                <Link
                  href={`/products/${item.slug}`}
                  className="text-sm font-semibold text-foreground hover:text-primary transition-colors line-clamp-1"
                >
                  {item.productName}
                </Link>
                <p className="text-sm font-bold text-foreground mt-1">
                  {formatPrice(item.price)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleAddToCart(item)}
                >
                  <ShoppingCart className="h-3.5 w-3.5" />
                  Add to Cart
                </Button>
                <button
                  onClick={() => {
                    removeItem(item.productId);
                    addToast("Removed from wishlist", "info");
                  }}
                  className="p-2 rounded-lg text-muted hover:text-error hover:bg-error/5 transition-colors cursor-pointer border border-border"
                  aria-label="Remove from wishlist"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
