"use client";

import {
  CheckCircle,
  Clock,
  Package,
  Truck,
  Home,
  XCircle,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Order } from "@/types";
import type { OrderStatus } from "@/types/enums";

interface TimelineStep {
  key: OrderStatus;
  label: string;
  icon: typeof CheckCircle;
  timestamp?: string | null;
}

interface OrderTimelineProps {
  order: Order;
  className?: string;
}

const statusOrder: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
];

function getSteps(order: Order): TimelineStep[] {
  if (order.status === "cancelled") {
    return [
      {
        key: "pending",
        label: "Order Placed",
        icon: Clock,
        timestamp: order.created_at,
      },
      {
        key: "cancelled",
        label: "Cancelled",
        icon: XCircle,
        timestamp: order.cancelled_at,
      },
    ];
  }

  return [
    {
      key: "pending",
      label: "Order Placed",
      icon: Clock,
      timestamp: order.created_at,
    },
    {
      key: "confirmed",
      label: "Confirmed",
      icon: CheckCircle,
      timestamp:
        statusOrder.indexOf(order.status) >= 1 ? order.updated_at : null,
    },
    {
      key: "processing",
      label: "Processing",
      icon: Package,
      timestamp:
        statusOrder.indexOf(order.status) >= 2 ? order.updated_at : null,
    },
    {
      key: "shipped",
      label: "Shipped",
      icon: Truck,
      timestamp: order.shipped_at,
    },
    {
      key: "delivered",
      label: "Delivered",
      icon: Home,
      timestamp: order.delivered_at,
    },
  ];
}

function formatTimestamp(ts: string): string {
  return new Date(ts).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function OrderTimeline({ order, className }: OrderTimelineProps) {
  const steps = getSteps(order);
  const currentStatusIdx = statusOrder.indexOf(order.status);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="relative">
        {steps.map((step, index) => {
          const stepIdx = statusOrder.indexOf(step.key);
          const isCompleted =
            step.key === "cancelled"
              ? true
              : stepIdx <= currentStatusIdx;
          const isCurrent =
            step.key === order.status;
          const isCancelled = step.key === "cancelled";

          return (
            <div key={step.key} className="relative flex gap-4 pb-8 last:pb-0">
              {/* Vertical line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "absolute left-[15px] top-8 w-0.5 h-[calc(100%-2rem)]",
                    isCompleted && !isCancelled
                      ? "bg-primary"
                      : isCancelled
                        ? "bg-error"
                        : "bg-border"
                  )}
                />
              )}

              {/* Icon */}
              <div
                className={cn(
                  "relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2",
                  isCancelled
                    ? "border-error bg-error/10 text-error"
                    : isCompleted
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-card text-muted"
                )}
              >
                <step.icon className="h-4 w-4" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pt-0.5">
                <p
                  className={cn(
                    "text-sm font-semibold",
                    isCancelled
                      ? "text-error"
                      : isCompleted
                        ? "text-foreground"
                        : "text-muted"
                  )}
                >
                  {step.label}
                  {isCurrent && !isCancelled && (
                    <span className="ml-2 inline-flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                  )}
                </p>
                {step.timestamp ? (
                  <p className="text-xs text-muted mt-0.5">
                    {formatTimestamp(step.timestamp)}
                  </p>
                ) : (
                  <p className="text-xs text-muted-light mt-0.5">Pending</p>
                )}

                {/* Tracking link for shipped step */}
                {step.key === "shipped" &&
                  isCompleted &&
                  order.tracking_url && (
                    <a
                      href={order.tracking_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-1.5 text-xs font-medium text-primary hover:underline"
                    >
                      Track Shipment
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}

                {/* Cancel reason */}
                {isCancelled && order.cancel_reason && (
                  <p className="text-xs text-muted mt-1">
                    Reason: {order.cancel_reason}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
