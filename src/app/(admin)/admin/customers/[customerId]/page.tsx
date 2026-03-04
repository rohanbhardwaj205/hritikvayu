"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Ban,
  CheckCircle,
} from "lucide-react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Spinner } from "@/components/ui/Spinner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatPrice, getInitials } from "@/lib/utils";
import type { Profile, Order } from "@/types";

interface CustomerDetail extends Profile {
  order_count: number;
  total_spent: number;
  orders: Order[];
}

export default function AdminCustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.customerId as string;

  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [banConfirm, setBanConfirm] = useState(false);
  const [banning, setBanning] = useState(false);

  const fetchCustomer = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/customers/${customerId}`);
      if (!res.ok) {
        setError("Customer not found");
        return;
      }
      const json = await res.json();
      setCustomer(json.data);
    } catch (err) {
      console.error("Failed to fetch customer:", err);
      setError("Failed to load customer");
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    fetchCustomer();
  }, [fetchCustomer]);

  const handleToggleBan = async () => {
    if (!customer) return;
    setBanning(true);
    try {
      const res = await fetch(
        `/api/admin/customers/${customerId}/ban`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_banned: !customer.is_banned }),
        }
      );
      if (res.ok) {
        await fetchCustomer();
      }
    } catch (error) {
      console.error("Toggle ban error:", error);
    } finally {
      setBanning(false);
      setBanConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" className="text-primary-light" />
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg font-medium text-admin-text">
          {error || "Customer not found"}
        </p>
        <Button
          variant="ghost"
          className="mt-4"
          onClick={() => router.push("/admin/customers")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Customers
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Admin", href: "/admin" },
          { label: "Customers", href: "/admin/customers" },
          { label: customer.full_name },
        ]}
        className="[&_a]:text-admin-muted [&_a:hover]:text-primary-light [&_span]:text-admin-text"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <div className="rounded-xl border border-admin-border bg-admin-surface p-6">
          <div className="flex flex-col items-center text-center">
            {customer.avatar_url ? (
              <img
                src={customer.avatar_url}
                alt={customer.full_name}
                className="h-20 w-20 rounded-full object-cover ring-4 ring-admin-border"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary ring-4 ring-admin-border">
                {getInitials(customer.full_name)}
              </div>
            )}
            <h2 className="mt-4 text-lg font-semibold text-admin-text">
              {customer.full_name}
            </h2>
            <div className="mt-1">
              {customer.is_banned ? (
                <Badge variant="error">Banned</Badge>
              ) : (
                <Badge variant="success">Active</Badge>
              )}
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-admin-muted" />
              <span className="text-admin-text">{customer.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-admin-muted" />
              <span className="text-admin-text">
                {customer.phone || "Not provided"}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-admin-muted" />
              <span className="text-admin-text">
                Joined{" "}
                {new Date(customer.created_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 rounded-lg bg-admin-bg p-4">
            <div className="text-center">
              <p className="text-lg font-bold text-admin-text">
                {customer.order_count}
              </p>
              <p className="text-xs text-admin-muted">Orders</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-admin-text">
                {formatPrice(customer.total_spent)}
              </p>
              <p className="text-xs text-admin-muted">Total Spent</p>
            </div>
          </div>

          <div className="mt-4">
            <Button
              variant={customer.is_banned ? "primary" : "danger"}
              fullWidth
              onClick={() => setBanConfirm(true)}
            >
              {customer.is_banned ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Unban Customer
                </>
              ) : (
                <>
                  <Ban className="h-4 w-4" />
                  Ban Customer
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Order History */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-admin-border bg-admin-surface">
            <div className="border-b border-admin-border px-5 py-4">
              <h3 className="text-base font-semibold text-admin-text">
                Order History
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-admin-border">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-admin-muted">
                      Order #
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-admin-muted">
                      Date
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-admin-muted">
                      Status
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-admin-muted">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-admin-border">
                  {customer.orders?.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-5 py-12 text-center text-sm text-admin-muted"
                      >
                        No orders yet
                      </td>
                    </tr>
                  ) : (
                    customer.orders?.map((order) => (
                      <tr
                        key={order.id}
                        className="cursor-pointer transition-colors hover:bg-admin-bg/50"
                        onClick={() =>
                          router.push(`/admin/orders/${order.id}`)
                        }
                      >
                        <td className="px-5 py-3 text-sm font-medium text-primary-light">
                          {order.order_number}
                        </td>
                        <td className="px-5 py-3 text-sm text-admin-muted">
                          {new Date(order.created_at).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-5 py-3 text-right text-sm font-medium text-admin-text">
                          {formatPrice(order.total)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Ban Confirm Dialog */}
      <ConfirmDialog
        isOpen={banConfirm}
        onClose={() => setBanConfirm(false)}
        onConfirm={handleToggleBan}
        title={customer.is_banned ? "Unban Customer" : "Ban Customer"}
        description={
          customer.is_banned
            ? `Are you sure you want to unban "${customer.full_name}"?`
            : `Are you sure you want to ban "${customer.full_name}"? They will not be able to log in or place orders.`
        }
        confirmLabel={customer.is_banned ? "Unban" : "Ban"}
        variant={customer.is_banned ? "default" : "danger"}
        loading={banning}
      />
    </div>
  );
}
