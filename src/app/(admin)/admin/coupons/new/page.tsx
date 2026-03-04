"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { CouponForm } from "@/components/admin/CouponForm";
import { Spinner } from "@/components/ui/Spinner";
import type { Coupon } from "@/types";

export default function NewCouponPage() {
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [coupon, setCoupon] = useState<Coupon | undefined>(undefined);
  const [loading, setLoading] = useState(!!editId);

  useEffect(() => {
    if (!editId) return;

    async function fetchCoupon() {
      try {
        const res = await fetch(`/api/coupons/${editId}`);
        if (res.ok) {
          const json = await res.json();
          setCoupon(json.data);
        }
      } catch (error) {
        console.error("Failed to fetch coupon:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCoupon();
  }, [editId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" className="text-primary-light" />
      </div>
    );
  }

  const mode = editId && coupon ? "edit" : "create";

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Admin", href: "/admin" },
          { label: "Coupons", href: "/admin/coupons" },
          { label: mode === "edit" ? "Edit Coupon" : "New Coupon" },
        ]}
        className="[&_a]:text-admin-muted [&_a:hover]:text-primary-light [&_span]:text-admin-text"
      />

      <div>
        <h1 className="text-2xl font-bold text-admin-text">
          {mode === "edit" ? "Edit Coupon" : "Create Coupon"}
        </h1>
        <p className="mt-1 text-sm text-admin-muted">
          {mode === "edit"
            ? `Editing coupon: ${coupon?.code}`
            : "Create a new discount coupon"}
        </p>
      </div>

      <CouponForm coupon={coupon} mode={mode} />
    </div>
  );
}
