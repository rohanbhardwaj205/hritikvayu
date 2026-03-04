"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PriceTag } from "@/components/ui/PriceTag";
import type { Product } from "@/types";
import { useCartStore } from "@/stores/cartStore";

interface StickyMobileBarProps {
  product: Product;
}

export function StickyMobileBar({ product }: StickyMobileBarProps) {
  const [visible, setVisible] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const openDrawer = useCartStore((s) => s.openDrawer);

  const defaultVariant = product.variants?.[0];
  const primaryImage = product.images?.find((img) => img.is_primary) ?? product.images?.[0];
  const isOutOfStock = product.variants && product.variants.length > 0
    ? product.variants.every((v) => v.stock <= 0)
    : false;

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 600);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleAdd = () => {
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
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-white/95 backdrop-blur-md px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] lg:hidden"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{product.name}</p>
              <PriceTag
                price={product.base_price}
                comparePrice={product.compare_price ?? undefined}
                size="sm"
              />
            </div>
            <Button
              size="lg"
              disabled={isOutOfStock}
              onClick={handleAdd}
              className="shrink-0 gap-2"
            >
              <ShoppingBag className="h-4 w-4" />
              {isOutOfStock ? "Sold Out" : "Add to Cart"}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
