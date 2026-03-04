"use client";

import { MapPin, Phone, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { OrderSummary } from "./OrderSummary";
import { RazorpayButton } from "./RazorpayButton";
import type { Address } from "@/types";

interface PaymentStepProps {
  address: Address;
  couponCode?: string | null;
  onBack: () => void;
  className?: string;
}

export function PaymentStep({
  address,
  couponCode,
  onBack,
  className,
}: PaymentStepProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground font-display">
          Review & Pay
        </h2>
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
          Change Address
        </Button>
      </div>

      {/* Selected Address Card */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">
            Delivering to
          </span>
          <Badge variant="info" size="sm">
            {address.label}
          </Badge>
        </div>
        <p className="text-sm text-foreground font-medium">
          {address.full_name}
        </p>
        <p className="text-sm text-muted mt-1 leading-relaxed">
          {address.address_line1}
          {address.address_line2 && `, ${address.address_line2}`}
          <br />
          {address.city}, {address.state} - {address.pincode}
        </p>
        <div className="flex items-center gap-1.5 mt-2 text-xs text-muted">
          <Phone className="h-3 w-3" />
          {address.phone}
        </div>
      </div>

      {/* Order Summary */}
      <OrderSummary />

      {/* Payment */}
      <div className="space-y-3">
        <RazorpayButton address={address} couponCode={couponCode} />

        <p className="text-xs text-center text-muted">
          By placing this order, you agree to our{" "}
          <a href="/terms" className="text-primary hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy-policy" className="text-primary hover:underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}
