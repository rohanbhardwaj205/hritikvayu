"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Package } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { Order, OrderStatus } from "@/types";

interface OrderCardProps {
  order: Order;
  className?: string;
}

export function OrderCard({ order, className }: OrderCardProps) {
  const formattedDate = new Date(order.created_at).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const itemCount = order.items?.length ?? 0;
  const firstItemImage = order.items?.[0]
    ? `/api/placeholder/80/80`
    : null;

  return (
    <Link
      href={`/account/orders/${order.id}`}
      className={cn(
        "block rounded-xl border border-border bg-card p-5 transition-all hover:shadow-md hover:border-border-hover group",
        className
      )}
    >
      {/* Top Row */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Package className="h-4 w-4 text-muted flex-shrink-0" />
            <span className="text-sm font-semibold text-foreground font-mono">
              {order.order_number}
            </span>
          </div>
          <p className="text-xs text-muted">{formattedDate}</p>
        </div>

        <StatusBadge status={order.status as OrderStatus} />
      </div>

      {/* Items Preview */}
      <div className="flex items-center gap-3 mb-3">
        {order.items && order.items.length > 0 ? (
          <div className="flex -space-x-2">
            {order.items.slice(0, 3).map((item, idx) => (
              <div
                key={item.id}
                className="h-10 w-10 rounded-lg border-2 border-card bg-surface overflow-hidden flex items-center justify-center"
                style={{ zIndex: 3 - idx }}
              >
                <span className="text-[10px] font-medium text-muted">
                  {item.product_name.slice(0, 2).toUpperCase()}
                </span>
              </div>
            ))}
            {itemCount > 3 && (
              <div className="h-10 w-10 rounded-lg border-2 border-card bg-surface-2 flex items-center justify-center">
                <span className="text-[10px] font-medium text-muted">
                  +{itemCount - 3}
                </span>
              </div>
            )}
          </div>
        ) : null}

        <div className="flex-1 min-w-0">
          {order.items && order.items.length > 0 && (
            <p className="text-sm text-foreground line-clamp-1">
              {order.items[0].product_name}
              {itemCount > 1 && (
                <span className="text-muted">
                  {" "}
                  and {itemCount - 1} more {itemCount - 1 === 1 ? "item" : "items"}
                </span>
              )}
            </p>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <span className="text-base font-bold text-foreground">
          {formatPrice(order.total)}
        </span>
        <span className="flex items-center gap-1 text-sm text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          View Details
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}
