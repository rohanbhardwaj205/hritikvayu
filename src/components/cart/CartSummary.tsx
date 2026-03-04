"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ShieldCheck, Truck, ArrowRight } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useCartStore } from "@/stores/cartStore";
import { Button } from "@/components/ui/Button";
import { CouponInput, type AppliedCoupon } from "./CouponInput";

const FREE_SHIPPING_THRESHOLD = 99900; // Rs. 999 in paise
const SHIPPING_COST = 4900; // Rs. 49 in paise
const GST_RATE = 0.18; // 18%

interface CartSummaryProps {
  className?: string;
}

export function CartSummary({ className }: CartSummaryProps) {
  const subtotal = useCartStore((s) => s.subtotal());
  const totalItems = useCartStore((s) => s.totalItems());
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(
    null
  );

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const discount = appliedCoupon?.discount_amount ?? 0;
  const taxableAmount = subtotal - discount;
  const gst = Math.round(taxableAmount * GST_RATE);
  const orderTotal = taxableAmount + shipping + gst;

  const freeShippingRemaining = useMemo(() => {
    if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
    return FREE_SHIPPING_THRESHOLD - subtotal;
  }, [subtotal]);

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-6 space-y-5",
        className
      )}
    >
      <h2 className="text-lg font-semibold text-foreground font-display">
        Order Summary
      </h2>

      {/* Free shipping progress */}
      {freeShippingRemaining > 0 && (
        <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
          <div className="flex items-center gap-2 text-xs text-primary font-medium mb-2">
            <Truck className="h-3.5 w-3.5" />
            Add {formatPrice(freeShippingRemaining)} more for free shipping
          </div>
          <div className="h-1.5 w-full rounded-full bg-primary/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{
                width: `${Math.min(
                  (subtotal / FREE_SHIPPING_THRESHOLD) * 100,
                  100
                )}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Line items */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">
            Subtotal ({totalItems} {totalItems === 1 ? "item" : "items"})
          </span>
          <span className="font-medium text-foreground">
            {formatPrice(subtotal)}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Shipping</span>
          <span
            className={cn(
              "font-medium",
              shipping === 0 ? "text-success" : "text-foreground"
            )}
          >
            {shipping === 0 ? "Free" : formatPrice(shipping)}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">GST (18%)</span>
          <span className="font-medium text-foreground">
            {formatPrice(gst)}
          </span>
        </div>

        {discount > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-success">Coupon Discount</span>
            <span className="font-medium text-success">
              -{formatPrice(discount)}
            </span>
          </div>
        )}
      </div>

      {/* Coupon */}
      <div className="border-t border-border pt-4">
        <CouponInput
          subtotal={subtotal}
          appliedCoupon={appliedCoupon}
          onApply={setAppliedCoupon}
          onRemove={() => setAppliedCoupon(null)}
        />
      </div>

      {/* Total */}
      <div className="border-t border-border pt-4">
        <div className="flex items-center justify-between">
          <span className="text-base font-bold text-foreground">
            Order Total
          </span>
          <span className="text-lg font-bold text-foreground">
            {formatPrice(orderTotal)}
          </span>
        </div>
      </div>

      {/* CTA */}
      <Link href="/checkout" className="block">
        <Button variant="primary" size="lg" fullWidth>
          Proceed to Checkout
          <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>

      <Link
        href="/products"
        className="block text-center text-sm text-muted hover:text-primary transition-colors"
      >
        Continue Shopping
      </Link>

      {/* Trust badges */}
      <div className="flex items-center justify-center gap-2 pt-2 border-t border-border">
        <ShieldCheck className="h-4 w-4 text-success" />
        <span className="text-xs text-muted">Secure checkout with Razorpay</span>
      </div>
    </div>
  );
}
