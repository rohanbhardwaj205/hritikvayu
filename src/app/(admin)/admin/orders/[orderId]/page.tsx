"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Package, MapPin, CreditCard, User } from "lucide-react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { OrderStatusUpdater } from "@/components/admin/OrderStatusUpdater";
import { formatPrice } from "@/lib/utils";
import type { Order } from "@/types";

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`);
      if (!res.ok) {
        setError("Order not found");
        return;
      }
      const json = await res.json();
      setOrder(json.data);
    } catch (err) {
      console.error("Failed to fetch order:", err);
      setError("Failed to load order");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" className="text-primary-light" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg font-medium text-admin-text">
          {error || "Order not found"}
        </p>
        <Button
          variant="ghost"
          className="mt-4"
          onClick={() => router.push("/admin/orders")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Button>
      </div>
    );
  }

  const paymentVariant =
    order.payment_status === "paid"
      ? "success"
      : order.payment_status === "failed"
        ? "error"
        : order.payment_status === "refunded"
          ? "warning"
          : "default";

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Admin", href: "/admin" },
          { label: "Orders", href: "/admin/orders" },
          { label: order.order_number },
        ]}
        className="[&_a]:text-admin-muted [&_a:hover]:text-primary-light [&_span]:text-admin-text"
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-admin-text">
            Order {order.order_number}
          </h1>
          <p className="mt-1 text-sm text-admin-muted">
            Placed on{" "}
            {new Date(order.created_at).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={order.status} />
          <Badge variant={paymentVariant as "success" | "error" | "warning" | "default"}>
            {order.payment_status}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Order Items */}
          <div className="rounded-xl border border-admin-border bg-admin-surface">
            <div className="flex items-center gap-2 border-b border-admin-border px-5 py-4">
              <Package className="h-4.5 w-4.5 text-admin-muted" />
              <h3 className="text-base font-semibold text-admin-text">
                Order Items
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-admin-border">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-admin-muted">
                      Product
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-admin-muted">
                      Variant
                    </th>
                    <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-admin-muted">
                      Qty
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-admin-muted">
                      Unit Price
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-admin-muted">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-admin-border">
                  {order.items?.map((item) => (
                    <tr key={item.id}>
                      <td className="px-5 py-3 text-sm font-medium text-admin-text">
                        {item.product_name}
                      </td>
                      <td className="px-5 py-3 text-sm text-admin-muted">
                        {item.variant_label || "--"}
                        {item.sku && (
                          <span className="ml-2 text-xs opacity-60">
                            ({item.sku})
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-center text-sm text-admin-text">
                        {item.quantity}
                      </td>
                      <td className="px-5 py-3 text-right text-sm text-admin-muted">
                        {formatPrice(item.unit_price)}
                      </td>
                      <td className="px-5 py-3 text-right text-sm font-medium text-admin-text">
                        {formatPrice(item.total_price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Order Totals */}
            <div className="border-t border-admin-border px-5 py-4">
              <div className="ml-auto max-w-xs space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-admin-muted">Subtotal</span>
                  <span className="text-admin-text">
                    {formatPrice(order.subtotal)}
                  </span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-admin-muted">
                      Discount
                      {order.coupon_code && (
                        <span className="ml-1 text-xs">
                          ({order.coupon_code})
                        </span>
                      )}
                    </span>
                    <span className="text-emerald-400">
                      -{formatPrice(order.discount_amount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-admin-muted">Shipping</span>
                  <span className="text-admin-text">
                    {order.shipping_cost === 0
                      ? "Free"
                      : formatPrice(order.shipping_cost)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-admin-muted">Tax</span>
                  <span className="text-admin-text">
                    {formatPrice(order.tax_amount)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-admin-border pt-2 text-base font-semibold">
                  <span className="text-admin-text">Total</span>
                  <span className="text-admin-text">
                    {formatPrice(order.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Notes */}
          {order.notes && (
            <div className="rounded-xl border border-admin-border bg-admin-surface p-5">
              <h3 className="mb-2 text-base font-semibold text-admin-text">
                Admin Notes
              </h3>
              <p className="text-sm text-admin-muted whitespace-pre-wrap">
                {order.notes}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="rounded-xl border border-admin-border bg-admin-surface p-5">
            <div className="flex items-center gap-2 mb-3">
              <User className="h-4.5 w-4.5 text-admin-muted" />
              <h3 className="text-base font-semibold text-admin-text">
                Customer
              </h3>
            </div>
            <div className="space-y-1 text-sm">
              <p className="font-medium text-admin-text">
                {order.shipping_name}
              </p>
              <p className="text-admin-muted">{order.shipping_phone}</p>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="rounded-xl border border-admin-border bg-admin-surface p-5">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-4.5 w-4.5 text-admin-muted" />
              <h3 className="text-base font-semibold text-admin-text">
                Shipping Address
              </h3>
            </div>
            <div className="space-y-0.5 text-sm text-admin-muted">
              <p>{order.shipping_line1}</p>
              {order.shipping_line2 && <p>{order.shipping_line2}</p>}
              <p>
                {order.shipping_city}, {order.shipping_state}{" "}
                {order.shipping_pincode}
              </p>
              <p>{order.shipping_country}</p>
            </div>
          </div>

          {/* Payment Info */}
          <div className="rounded-xl border border-admin-border bg-admin-surface p-5">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="h-4.5 w-4.5 text-admin-muted" />
              <h3 className="text-base font-semibold text-admin-text">
                Payment
              </h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-admin-muted">Method</span>
                <span className="text-admin-text capitalize">
                  {order.payment_method}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-admin-muted">Status</span>
                <Badge variant={paymentVariant as "success" | "error" | "warning" | "default"}>
                  {order.payment_status}
                </Badge>
              </div>
              {order.razorpay_payment_id && (
                <div className="flex justify-between">
                  <span className="text-admin-muted">Payment ID</span>
                  <code className="text-xs text-admin-muted">
                    {order.razorpay_payment_id}
                  </code>
                </div>
              )}
            </div>
          </div>

          {/* Status Updater */}
          <OrderStatusUpdater
            orderId={order.id}
            currentStatus={order.status}
            currentTrackingNumber={order.tracking_number}
            currentTrackingUrl={order.tracking_url}
            currentNotes={order.notes}
            onUpdate={fetchOrder}
          />
        </div>
      </div>
    </div>
  );
}
