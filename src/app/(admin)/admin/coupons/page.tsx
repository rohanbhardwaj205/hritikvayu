"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2, Ticket } from "lucide-react";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatPrice } from "@/lib/utils";
import type { Coupon } from "@/types";

export default function AdminCouponsPage() {
  const router = useRouter();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        pageSize: "10",
      });
      const res = await fetch(`/api/coupons?${params}`);
      if (res.ok) {
        const json = await res.json();
        setCoupons(json.data || []);
        setTotalPages(json.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch coupons:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/coupons/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchCoupons();
      }
    } catch (error) {
      console.error("Delete coupon error:", error);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const columns: Column<Record<string, unknown>>[] = [
    {
      key: "code",
      label: "Code",
      sortable: true,
      render: (item) => {
        const coupon = item as unknown as Coupon;
        return (
          <div className="flex items-center gap-2">
            <Ticket className="h-4 w-4 text-admin-muted" />
            <code className="rounded bg-admin-bg px-2 py-0.5 text-sm font-bold text-primary-light">
              {coupon.code}
            </code>
          </div>
        );
      },
    },
    {
      key: "discount_type",
      label: "Type",
      render: (item) => {
        const coupon = item as unknown as Coupon;
        return (
          <Badge variant="outline">
            {coupon.discount_type === "percentage" ? "%" : "Fixed"}
          </Badge>
        );
      },
    },
    {
      key: "discount_value",
      label: "Value",
      render: (item) => {
        const coupon = item as unknown as Coupon;
        return (
          <span className="font-medium text-admin-text">
            {coupon.discount_type === "percentage"
              ? `${coupon.discount_value}%`
              : formatPrice(coupon.discount_value)}
          </span>
        );
      },
    },
    {
      key: "min_order_value",
      label: "Min Order",
      render: (item) => {
        const coupon = item as unknown as Coupon;
        return (
          <span className="text-admin-muted">
            {coupon.min_order_value
              ? formatPrice(coupon.min_order_value)
              : "--"}
          </span>
        );
      },
    },
    {
      key: "used_count",
      label: "Used / Limit",
      render: (item) => {
        const coupon = item as unknown as Coupon;
        return (
          <span className="text-admin-muted">
            {coupon.used_count}
            {coupon.usage_limit ? ` / ${coupon.usage_limit}` : " / --"}
          </span>
        );
      },
    },
    {
      key: "valid_until",
      label: "Valid Until",
      sortable: true,
      render: (item) => {
        const coupon = item as unknown as Coupon;
        if (!coupon.valid_until) {
          return <span className="text-admin-muted">No expiry</span>;
        }
        const date = new Date(coupon.valid_until);
        const expired = date < new Date();
        return (
          <span
            className={expired ? "text-red-400" : "text-admin-muted"}
          >
            {date.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        );
      },
    },
    {
      key: "is_active",
      label: "Active",
      render: (item) => {
        const coupon = item as unknown as Coupon;
        return coupon.is_active ? (
          <Badge variant="success">Active</Badge>
        ) : (
          <Badge variant="error">Inactive</Badge>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (item) => {
        const coupon = item as unknown as Coupon;
        return (
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/admin/coupons/new?edit=${coupon.id}`);
              }}
              className="rounded-md p-1.5 text-admin-muted transition-colors hover:bg-admin-bg hover:text-admin-text"
              title="Edit coupon"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDeleteTarget(coupon);
              }}
              className="rounded-md p-1.5 text-admin-muted transition-colors hover:bg-red-500/10 hover:text-red-400"
              title="Delete coupon"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-admin-text">Coupons</h1>
          <p className="mt-1 text-sm text-admin-muted">
            Manage discount coupons
          </p>
        </div>
        <Link href="/admin/coupons/new">
          <Button>
            <Plus className="h-4 w-4" />
            Create Coupon
          </Button>
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={coupons as unknown as Record<string, unknown>[]}
        loading={loading}
        emptyMessage="No coupons found"
        rowKey={(item) => (item as unknown as Coupon).id}
        className="!border-admin-border [&_thead_tr]:!bg-admin-bg [&_thead_tr]:!border-admin-border [&_tbody]:!divide-admin-border [&_tbody_tr]:!bg-admin-surface [&_th]:!text-admin-muted [&_td]:!text-admin-text"
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Coupon"
        description={`Are you sure you want to delete coupon "${deleteTarget?.code}"?`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
