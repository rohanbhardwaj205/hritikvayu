"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, Package, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { formatPrice } from "@/lib/utils";
import type { Order } from "@/types";

function ConfettiParticle({ index }: { index: number }) {
  const style = useMemo(() => {
    const colors = [
      "#0A0A0A",
      "#3B82F6",
      "#1E3A5F",
      "#6B7280",
      "#2563EB",
      "#111827",
      "#60A5FA",
    ];
    return {
      left: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 0.6}s`,
      backgroundColor: colors[index % colors.length],
    };
  }, [index]);

  return (
    <motion.div
      className="absolute top-0 w-2 h-2 rounded-full"
      style={style}
      initial={{ y: -20, opacity: 1, rotate: 0 }}
      animate={{
        y: [0, 300, 600],
        opacity: [1, 1, 0],
        rotate: [0, 180, 360],
        x: [0, (Math.random() - 0.5) * 200],
      }}
      transition={{
        duration: 2.5 + Math.random(),
        ease: "easeOut",
        delay: Math.random() * 0.5,
      }}
    />
  );
}

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(true);

  const fetchOrder = useCallback(async () => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/orders/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data.data);
      }
    } catch {
      // Order details are optional for success page
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" className="text-primary" />
      </div>
    );
  }

  return (
    <main className="relative mx-auto max-w-lg px-4 py-16 sm:px-6 text-center overflow-hidden">
      {/* Confetti */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => (
            <ConfettiParticle key={i} index={i} />
          ))}
        </div>
      )}

      {/* Success Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
        className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/10"
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            damping: 10,
            stiffness: 200,
            delay: 0.4,
          }}
        >
          <CheckCircle className="h-10 w-10 text-success" />
        </motion.div>
      </motion.div>

      {/* Heading */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-2xl font-bold text-foreground font-display mb-2"
      >
        Order Placed Successfully!
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-muted mb-8"
      >
        Thank you for shopping with Vastrayug. We&apos;ve received your order
        and will begin processing it shortly.
      </motion.p>

      {/* Order Details Card */}
      {order && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="rounded-xl border border-border bg-card p-6 mb-8 text-left"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Order Number</span>
              <span className="text-sm font-semibold text-foreground font-mono">
                {order.order_number}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Total</span>
              <span className="text-sm font-semibold text-foreground">
                {formatPrice(order.total)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Payment Status</span>
              <span className="text-sm font-semibold text-success capitalize">
                {order.payment_status}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Delivering to</span>
              <span className="text-sm text-foreground text-right">
                {order.shipping_city}, {order.shipping_state}
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-3"
      >
        {order && (
          <Link href={`/account/orders/${order.id}`}>
            <Button variant="primary" size="lg">
              <Package className="h-4 w-4" />
              View Order
            </Button>
          </Link>
        )}

        <Link href="/products">
          <Button variant="outline" size="lg">
            <ShoppingBag className="h-4 w-4" />
            Continue Shopping
          </Button>
        </Link>
      </motion.div>

      {/* Email note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-xs text-muted mt-8"
      >
        A confirmation email has been sent to your registered email address with
        the order details.
      </motion.p>
    </main>
  );
}
