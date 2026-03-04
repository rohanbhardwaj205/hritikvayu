"use client";

import { cn } from "@/lib/utils";

type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

interface StatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  pending: {
    label: "Pending",
    className: "bg-warning/10 text-yellow-700",
  },
  confirmed: {
    label: "Confirmed",
    className: "bg-info/10 text-info",
  },
  processing: {
    label: "Processing",
    className: "bg-info/10 text-info",
  },
  shipped: {
    label: "Shipped",
    className: "bg-purple-100 text-purple-700",
  },
  delivered: {
    label: "Delivered",
    className: "bg-success/10 text-success",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-error/10 text-error",
  },
  refunded: {
    label: "Refunded",
    className: "bg-orange-100 text-orange-700",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}

export type { StatusBadgeProps, OrderStatus };
