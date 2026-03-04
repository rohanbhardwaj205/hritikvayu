"use client";

import { useState, useCallback } from "react";
import { Tag, X, Loader2, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export interface AppliedCoupon {
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  discount_amount: number;
}

interface CouponInputProps {
  subtotal: number;
  appliedCoupon: AppliedCoupon | null;
  onApply: (coupon: AppliedCoupon) => void;
  onRemove: () => void;
  className?: string;
}

export function CouponInput({
  subtotal,
  appliedCoupon,
  onApply,
  onRemove,
  className,
}: CouponInputProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleApply = useCallback(async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setError("Please enter a coupon code");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: trimmed, subtotal }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid coupon code");
        return;
      }

      onApply({
        code: trimmed,
        discount_type: data.data.discount_type,
        discount_value: data.data.discount_value,
        discount_amount: data.data.discount_amount,
      });
      setCode("");
      setError(null);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [code, subtotal, onApply]);

  if (appliedCoupon) {
    return (
      <div
        className={cn(
          "flex items-center justify-between gap-3 rounded-lg border border-success/30 bg-success/5 px-3 py-2.5",
          className
        )}
      >
        <div className="flex items-center gap-2 min-w-0">
          <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-success">
              {appliedCoupon.code}
            </p>
            <p className="text-xs text-success/80">
              You save {formatPrice(appliedCoupon.discount_amount)}
            </p>
          </div>
        </div>
        <button
          onClick={onRemove}
          className="p-1 rounded text-muted hover:text-error transition-colors cursor-pointer flex-shrink-0"
          aria-label="Remove coupon"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex gap-2">
        <Input
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            if (error) setError(null);
          }}
          placeholder="Enter coupon code"
          leftIcon={<Tag className="h-4 w-4" />}
          className="flex-1 uppercase"
          onKeyDown={(e) => e.key === "Enter" && handleApply()}
          variant={error ? "error" : "default"}
        />
        <Button
          variant="outline"
          size="md"
          onClick={handleApply}
          loading={loading}
          disabled={loading || !code.trim()}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
        </Button>
      </div>
      {error && (
        <p className="text-xs text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
