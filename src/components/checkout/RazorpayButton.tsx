"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/providers/ToastProvider";
import type { Address } from "@/types";

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  handler: (response: RazorpayResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: () => void) => void;
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayButtonProps {
  address: Address;
  couponCode?: string | null;
  className?: string;
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function RazorpayButton({
  address,
  couponCode,
  className,
}: RazorpayButtonProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const user = useAuthStore((s) => s.user);
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const [processing, setProcessing] = useState(false);

  const handlePayment = useCallback(async () => {
    setProcessing(true);

    try {
      // 1. Load Razorpay script
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        addToast("Failed to load payment gateway. Please try again.", "error");
        setProcessing(false);
        return;
      }

      // 2. Create order on backend
      const orderRes = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
          })),
          addressId: address.id,
          couponCode: couponCode ?? null,
        }),
      });

      if (!orderRes.ok) {
        const errorData = await orderRes.json();
        addToast(errorData.error || "Failed to create order", "error");
        setProcessing(false);
        return;
      }

      const orderData = await orderRes.json();
      const { razorpay_order_id, amount, currency, order_id } = orderData.data;

      // 3. Open Razorpay checkout
      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount,
        currency: currency || "INR",
        name: "Vastrayug",
        description: "Order Payment",
        order_id: razorpay_order_id,
        prefill: {
          name: user?.full_name || address.full_name,
          email: user?.email || "",
          contact: address.phone,
        },
        theme: {
          color: "#8B4513",
        },
        handler: async (response: RazorpayResponse) => {
          // 4. Verify payment
          try {
            const verifyRes = await fetch("/api/checkout/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                order_id,
              }),
            });

            if (verifyRes.ok) {
              clearCart();
              addToast("Payment successful! Your order has been placed.", "success");
              router.push(`/checkout/success?order_id=${order_id}`);
            } else {
              const errData = await verifyRes.json();
              addToast(
                errData.error || "Payment verification failed. Contact support.",
                "error"
              );
            }
          } catch {
            addToast(
              "Payment verification error. Please contact support.",
              "error"
            );
          } finally {
            setProcessing(false);
          }
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
            addToast("Payment cancelled", "warning");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => {
        setProcessing(false);
        addToast("Payment failed. Please try again.", "error");
      });
      rzp.open();
    } catch {
      addToast("Something went wrong. Please try again.", "error");
      setProcessing(false);
    }
  }, [items, address, couponCode, user, clearCart, router, addToast]);

  return (
    <Button
      variant="primary"
      size="lg"
      fullWidth
      onClick={handlePayment}
      loading={processing}
      disabled={processing}
      className={cn("relative", className)}
    >
      {processing ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Processing Payment...
        </>
      ) : (
        <>
          <CreditCard className="h-4 w-4" />
          Pay with Razorpay
        </>
      )}
    </Button>
  );
}
