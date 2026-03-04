"use client";

import Image from "next/image";
import { cn, formatPrice } from "@/lib/utils";
import { useCartStore } from "@/stores/cartStore";
import type { AppliedCoupon } from "@/components/cart/CouponInput";

const FREE_SHIPPING_THRESHOLD = 99900;
const SHIPPING_COST = 4900;
const GST_RATE = 0.18;

interface OrderSummaryProps {
  appliedCoupon?: AppliedCoupon | null;
  className?: string;
}

export function OrderSummary({ appliedCoupon, className }: OrderSummaryProps) {
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const discount = appliedCoupon?.discount_amount ?? 0;
  const taxableAmount = subtotal - discount;
  const gst = Math.round(taxableAmount * GST_RATE);
  const total = taxableAmount + shipping + gst;

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-5 space-y-4",
        className
      )}
    >
      <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
        Order Summary
      </h3>

      {/* Items */}
      <div className="space-y-3 max-h-60 overflow-y-auto">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            <div className="relative h-10 w-10 flex-shrink-0 rounded-lg overflow-hidden border border-border bg-surface">
              <Image
                src={item.imageUrl}
                alt={item.productName}
                fill
                className="object-cover"
                sizes="40px"
              />
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white">
                {item.quantity}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground line-clamp-1">
                {item.productName}
              </p>
              {item.variantLabel && (
                <p className="text-xs text-muted">{item.variantLabel}</p>
              )}
            </div>
            <p className="text-sm font-medium text-foreground flex-shrink-0">
              {formatPrice(item.unitPrice * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      {/* Breakdown */}
      <div className="border-t border-border pt-3 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted">Subtotal</span>
          <span className="text-foreground">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted">Shipping</span>
          <span className={shipping === 0 ? "text-success" : "text-foreground"}>
            {shipping === 0 ? "Free" : formatPrice(shipping)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted">GST (18%)</span>
          <span className="text-foreground">{formatPrice(gst)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-success">
              Discount ({appliedCoupon?.code})
            </span>
            <span className="text-success">-{formatPrice(discount)}</span>
          </div>
        )}
      </div>

      {/* Total */}
      <div className="border-t border-border pt-3">
        <div className="flex justify-between">
          <span className="text-base font-bold text-foreground">Total</span>
          <span className="text-lg font-bold text-foreground">
            {formatPrice(total)}
          </span>
        </div>
      </div>
    </div>
  );
}
