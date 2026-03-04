"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Eye } from "lucide-react";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { formatPrice } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types";

const statusTabs: Array<{ label: string; value: OrderStatus | "all" }> = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Processing", value: "processing" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Refunded", value: "refunded" },
];

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        pageSize: "10",
      });
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (statusFilter !== "all") params.set("status", statusFilter);

      const res = await fetch(`/api/admin/orders?${params}`);
      if (res.ok) {
        const json = await res.json();
        setOrders(json.data);
        setTotalPages(json.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const columns: Column<Record<string, unknown>>[] = [
    {
      key: "order_number",
      label: "Order #",
      sortable: true,
      render: (item) => {
        const order = item as unknown as Order;
        return (
          <span className="font-medium text-primary-light">
            {order.order_number}
          </span>
        );
      },
    },
    {
      key: "shipping_name",
      label: "Customer",
      render: (item) => {
        const order = item as unknown as Order;
        return (
          <span className="text-admin-text">{order.shipping_name}</span>
        );
      },
    },
    {
      key: "created_at",
      label: "Date",
      sortable: true,
      render: (item) => {
        const order = item as unknown as Order;
        return (
          <span className="text-admin-muted">
            {new Date(order.created_at).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        );
      },
    },
    {
      key: "items",
      label: "Items",
      render: (item) => {
        const order = item as unknown as Order;
        return (
          <span className="text-admin-muted">
            {order.items?.length || 0} items
          </span>
        );
      },
    },
    {
      key: "total",
      label: "Total",
      sortable: true,
      render: (item) => {
        const order = item as unknown as Order;
        return (
          <span className="font-medium text-admin-text">
            {formatPrice(order.total)}
          </span>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      render: (item) => {
        const order = item as unknown as Order;
        return <StatusBadge status={order.status} />;
      },
    },
    {
      key: "payment_status",
      label: "Payment",
      render: (item) => {
        const order = item as unknown as Order;
        const variant =
          order.payment_status === "paid"
            ? "success"
            : order.payment_status === "failed"
              ? "error"
              : order.payment_status === "refunded"
                ? "warning"
                : "default";
        return (
          <Badge variant={variant as "success" | "error" | "warning" | "default"}>
            {order.payment_status}
          </Badge>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (item) => {
        const order = item as unknown as Order;
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/admin/orders/${order.id}`);
            }}
            className="rounded-md p-1.5 text-admin-muted transition-colors hover:bg-admin-bg hover:text-admin-text"
            title="View order"
          >
            <Eye className="h-4 w-4" />
          </button>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-admin-text">Orders</h1>
        <p className="mt-1 text-sm text-admin-muted">
          Manage customer orders
        </p>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-1 rounded-lg bg-admin-bg p-1">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setStatusFilter(tab.value);
              setCurrentPage(1);
            }}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              statusFilter === tab.value
                ? "bg-admin-surface text-admin-text"
                : "text-admin-muted hover:text-admin-text"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-muted" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Search by order number..."
          className="h-10 w-full rounded-lg border border-admin-border bg-admin-surface pl-10 pr-4 text-sm text-admin-text placeholder:text-admin-muted focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 sm:w-80"
        />
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={orders as unknown as Record<string, unknown>[]}
        loading={loading}
        emptyMessage="No orders found"
        rowKey={(item) => (item as unknown as Order).id}
        onRowClick={(item) =>
          router.push(`/admin/orders/${(item as unknown as Order).id}`)
        }
        className="!border-admin-border [&_thead_tr]:!bg-admin-bg [&_thead_tr]:!border-admin-border [&_tbody]:!divide-admin-border [&_tbody_tr]:!bg-admin-surface [&_th]:!text-admin-muted [&_td]:!text-admin-text"
      />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
