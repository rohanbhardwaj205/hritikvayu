"use client";

import { Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useWishlistStore } from "@/stores/wishlistStore";
import type { Product } from "@/types";

interface WishlistButtonProps {
  product: Product;
  className?: string;
  size?: "sm" | "md";
}

export function WishlistButton({
  product,
  className,
  size = "md",
}: WishlistButtonProps) {
  const addItem = useWishlistStore((s) => s.addItem);
  const removeItem = useWishlistStore((s) => s.removeItem);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist(product.id));

  const primaryImage = product.images?.find((img) => img.is_primary) ?? product.images?.[0];

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isInWishlist) {
      removeItem(product.id);
    } else {
      addItem({
        productId: product.id,
        productName: product.name,
        imageUrl: primaryImage?.url ?? "",
        price: product.base_price,
        slug: product.slug,
      });
    }
  };

  const sizeClasses = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const iconClasses = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <button
      onClick={handleToggle}
      className={cn(
        "relative flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer",
        "bg-white/90 backdrop-blur-sm shadow-sm hover:bg-white hover:shadow-md",
        sizeClasses,
        className
      )}
      aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isInWishlist ? (
          <motion.div
            key="filled"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
          >
            <Heart
              className={cn(iconClasses, "text-red-500 fill-red-500")}
            />
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
          >
            <Heart className={cn(iconClasses, "text-foreground/70")} />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}
