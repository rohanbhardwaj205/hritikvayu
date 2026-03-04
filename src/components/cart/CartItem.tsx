"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useCartStore, type CartStoreItem } from "@/stores/cartStore";
import { QuantitySelector } from "@/components/ui/QuantitySelector";

interface CartItemProps {
  item: CartStoreItem;
  className?: string;
}

export function CartItem({ item, className }: CartItemProps) {
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);

  const lineTotal = item.unitPrice * item.quantity;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className={cn(
        "flex gap-4 rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-sm",
        className
      )}
    >
      {/* Product Image */}
      <Link
        href={`/products/${item.slug}`}
        className="relative h-[60px] w-[60px] flex-shrink-0 overflow-hidden rounded-lg border border-border bg-surface"
      >
        <Image
          src={item.imageUrl}
          alt={item.productName}
          fill
          className="object-cover"
          sizes="60px"
        />
      </Link>

      {/* Product Info */}
      <div className="flex flex-1 flex-col gap-2 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              href={`/products/${item.slug}`}
              className="text-sm font-semibold text-foreground hover:text-primary transition-colors line-clamp-1"
            >
              {item.productName}
            </Link>
            {item.variantLabel && (
              <p className="text-xs text-muted mt-0.5">{item.variantLabel}</p>
            )}
            <p className="text-xs text-muted mt-0.5">
              {formatPrice(item.unitPrice)} each
            </p>
          </div>

          {/* Line Total (desktop) */}
          <p className="hidden sm:block text-sm font-bold text-foreground whitespace-nowrap">
            {formatPrice(lineTotal)}
          </p>
        </div>

        {/* Quantity + Remove */}
        <div className="flex items-center justify-between gap-3">
          <QuantitySelector
            value={item.quantity}
            onChange={(qty) => updateQuantity(item.id, qty)}
            min={1}
            max={item.maxStock}
          />

          <div className="flex items-center gap-3">
            {/* Line Total (mobile) */}
            <p className="sm:hidden text-sm font-bold text-foreground">
              {formatPrice(lineTotal)}
            </p>

            <button
              onClick={() => removeItem(item.id)}
              className="p-1.5 rounded-lg text-muted hover:text-error hover:bg-error/5 transition-colors cursor-pointer"
              aria-label={`Remove ${item.productName} from cart`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
