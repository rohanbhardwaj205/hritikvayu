"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Eye, Ban, CheckCircle } from "lucide-react";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatPrice, getInitials } from "@/lib/utils";
import type { Profile } from "@/types";

interface CustomerWithStats extends Profile {
  order_count: number;
  total_spent: number;
}

interface CustomerTableProps {
  customers: CustomerWithStats[];
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onSearch: (query: string) => void;
  onToggleBan: (customerId: string, ban: boolean) => Promise<void>;
  searchQuery: string;
}

export function CustomerTable({
  customers,
  totalPages,
  currentPage,
  onPageChange,
  onSearch,
  onToggleBan,
  searchQuery,
}: CustomerTableProps) {
  const router = useRouter();
  const [banTarget, setBanTarget] = useState<{
    id: string;
    name: string;
    ban: boolean;
  } | null>(null);
  const [banning, setBanning] = useState(false);

  const handleBanConfirm = async () => {
    if (!banTarget) return;
    setBanning(true);
    try {
      await onToggleBan(banTarget.id, banTarget.ban);
    } finally {
      setBanning(false);
      setBanTarget(null);
    }
  };

  const columns: Column<Record<string, unknown>>[] = [
    {
      key: "full_name",
      label: "Customer",
      render: (item) => {
        const customer = item as unknown as CustomerWithStats;
        return (
          <div className="flex items-center gap-3">
            {customer.avatar_url ? (
              <img
                src={customer.avatar_url}
                alt={customer.full_name}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {getInitials(customer.full_name)}
              </div>
            )}
            <span className="font-medium text-admin-text">
              {customer.full_name}
            </span>
          </div>
        );
      },
    },
    {
      key: "email",
      label: "Email",
      render: (item) => {
        const customer = item as unknown as CustomerWithStats;
        return (
          <span className="text-admin-muted">{customer.email}</span>
        );
      },
    },
    {
      key: "phone",
      label: "Phone",
      render: (item) => {
        const customer = item as unknown as CustomerWithStats;
        return (
          <span className="text-admin-muted">
            {customer.phone || "--"}
          </span>
        );
      },
    },
    {
      key: "order_count",
      label: "Orders",
      sortable: true,
      render: (item) => {
        const customer = item as unknown as CustomerWithStats;
        return (
          <span className="text-admin-text">{customer.order_count}</span>
        );
      },
    },
    {
      key: "total_spent",
      label: "Total Spent",
      sortable: true,
      render: (item) => {
        const customer = item as unknown as CustomerWithStats;
        return (
          <span className="font-medium text-admin-text">
            {formatPrice(customer.total_spent)}
          </span>
        );
      },
    },
    {
      key: "created_at",
      label: "Joined",
      sortable: true,
      render: (item) => {
        const customer = item as unknown as CustomerWithStats;
        return (
          <span className="text-admin-muted">
            {new Date(customer.created_at).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        );
      },
    },
    {
      key: "is_banned",
      label: "Status",
      render: (item) => {
        const customer = item as unknown as CustomerWithStats;
        return customer.is_banned ? (
          <Badge variant="error">Banned</Badge>
        ) : (
          <Badge variant="success">Active</Badge>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (item) => {
        const customer = item as unknown as CustomerWithStats;
        return (
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/admin/customers/${customer.id}`);
              }}
              className="rounded-md p-1.5 text-admin-muted transition-colors hover:bg-admin-bg hover:text-admin-text"
              title="View customer"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setBanTarget({
                  id: customer.id,
                  name: customer.full_name,
                  ban: !customer.is_banned,
                });
              }}
              className={`rounded-md p-1.5 transition-colors ${
                customer.is_banned
                  ? "text-emerald-400 hover:bg-emerald-400/10"
                  : "text-red-400 hover:bg-red-400/10"
              }`}
              title={customer.is_banned ? "Unban" : "Ban"}
            >
              {customer.is_banned ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <Ban className="h-4 w-4" />
              )}
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-muted" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search customers..."
          className="h-10 w-full rounded-lg border border-admin-border bg-admin-bg pl-10 pr-4 text-sm text-admin-text placeholder:text-admin-muted focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 sm:w-80"
        />
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={customers as unknown as Record<string, unknown>[]}
        emptyMessage="No customers found"
        rowKey={(item) => (item as unknown as CustomerWithStats).id}
        className="!border-admin-border [&_thead_tr]:!bg-admin-bg [&_thead_tr]:!border-admin-border [&_tbody]:!divide-admin-border [&_tbody_tr]:!bg-admin-surface [&_th]:!text-admin-muted [&_td]:!text-admin-text"
      />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />

      {/* Ban Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!banTarget}
        onClose={() => setBanTarget(null)}
        onConfirm={handleBanConfirm}
        title={banTarget?.ban ? "Ban Customer" : "Unban Customer"}
        description={
          banTarget?.ban
            ? `Are you sure you want to ban "${banTarget?.name}"? They will not be able to log in or place orders.`
            : `Are you sure you want to unban "${banTarget?.name}"? They will be able to log in and place orders again.`
        }
        confirmLabel={banTarget?.ban ? "Ban" : "Unban"}
        variant={banTarget?.ban ? "danger" : "default"}
        loading={banning}
      />
    </div>
  );
}
