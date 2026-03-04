"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Phone,
  CreditCard,
  XCircle,
  Loader2,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { OrderTimeline } from "@/components/account/OrderTimeline";
import { useToast } from "@/providers/ToastProvider";
import type { Order, OrderStatus } from "@/types";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const fetchOrder = useCallback(async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data.data);
      } else {
        addToast("Order not found", "error");
        router.push("/account/orders");
      }
    } catch {
      addToast("Failed to load order", "error");
    } finally {
      setLoading(false);
    }
  }, [orderId, addToast, router]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleCancel = async () => {
    if (!order) return;

    const confirmed = window.confirm(
      "Are you sure you want to cancel this order? This action cannot be undone."
    );
    if (!confirmed) return;

    setCancelling(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Cancelled by customer" }),
      });

      if (res.ok) {
        addToast("Order cancelled successfully", "success");
        fetchOrder();
      } else {
        const data = await res.json();
        addToast(data.error || "Failed to cancel order", "error");
      }
    } catch {
      addToast("Something went wrong", "error");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="lg" className="text-primary" />
      </div>
    );
  }

  if (!order) return null;

  const formattedDate = new Date(order.created_at).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors mb-3"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Link>
          <h1 className="text-2xl font-bold text-foreground font-display">
            Order #{order.order_number}
          </h1>
          <p className="text-sm text-muted mt-1">Placed on {formattedDate}</p>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status={order.status as OrderStatus} />
          {order.status === "pending" && (
            <Button
              variant="danger"
              size="sm"
              onClick={handleCancel}
              loading={cancelling}
              disabled={cancelling}
            >
              <XCircle className="h-4 w-4" />
              Cancel Order
            </Button>
          )}
        </div>
      </div>

      {/* Timeline */}
      <Card>
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
          Order Status
        </h2>
        <OrderTimeline order={order} />
      </Card>

      {/* Order Items */}
      <Card>
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
          Items ({order.items?.length ?? 0})
        </h2>
        <div className="divide-y divide-border">
          {order.items?.map((item) => (
            <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
              <div className="relative h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden border border-border bg-surface">
                <div className="flex items-center justify-center h-full">
                  <span className="text-xs font-medium text-muted">
                    {item.product_name.slice(0, 2).toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground line-clamp-1">
                  {item.product_name}
                </p>
                {item.variant_label && (
                  <p className="text-xs text-muted mt-0.5">
                    {item.variant_label}
                  </p>
                )}
                <p className="text-xs text-muted mt-0.5">
                  Qty: {item.quantity} x {formatPrice(item.unit_price)}
                </p>
              </div>

              <p className="text-sm font-bold text-foreground flex-shrink-0">
                {formatPrice(item.total_price)}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Shipping Address */}
        <Card>
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Shipping Address
          </h2>
          <div className="text-sm text-foreground">
            <p className="font-semibold">{order.shipping_name}</p>
            <p className="text-muted mt-1 leading-relaxed">
              {order.shipping_line1}
              {order.shipping_line2 && (
                <>
                  <br />
                  {order.shipping_line2}
                </>
              )}
              <br />
              {order.shipping_city}, {order.shipping_state} -{" "}
              {order.shipping_pincode}
              <br />
              {order.shipping_country}
            </p>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-muted">
              <Phone className="h-3 w-3" />
              {order.shipping_phone}
            </div>
          </div>
        </Card>

        {/* Payment Details */}
        <Card>
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" />
            Payment Details
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Payment Method</span>
              <span className="text-foreground capitalize">
                {order.payment_method}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Payment Status</span>
              <Badge
                variant={
                  order.payment_status === "paid"
                    ? "success"
                    : order.payment_status === "failed"
                      ? "error"
                      : "warning"
                }
              >
                {order.payment_status}
              </Badge>
            </div>
            {order.razorpay_payment_id && (
              <div className="flex justify-between">
                <span className="text-muted">Payment ID</span>
                <span className="text-foreground font-mono text-xs">
                  {order.razorpay_payment_id}
                </span>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Total Breakdown */}
      <Card>
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">
          Order Summary
        </h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Subtotal</span>
            <span className="text-foreground">{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Shipping</span>
            <span
              className={
                order.shipping_cost === 0 ? "text-success" : "text-foreground"
              }
            >
              {order.shipping_cost === 0
                ? "Free"
                : formatPrice(order.shipping_cost)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Tax</span>
            <span className="text-foreground">
              {formatPrice(order.tax_amount)}
            </span>
          </div>
          {order.discount_amount > 0 && (
            <div className="flex justify-between">
              <span className="text-success">
                Discount
                {order.coupon_code && ` (${order.coupon_code})`}
              </span>
              <span className="text-success">
                -{formatPrice(order.discount_amount)}
              </span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t border-border">
            <span className="text-base font-bold text-foreground">Total</span>
            <span className="text-lg font-bold text-foreground">
              {formatPrice(order.total)}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
