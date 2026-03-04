"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { OrderStatus } from "@/types";

interface OrderStatusUpdaterProps {
  orderId: string;
  currentStatus: OrderStatus;
  currentTrackingNumber: string | null;
  currentTrackingUrl: string | null;
  currentNotes: string | null;
  onUpdate: () => void;
}

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded", label: "Refunded" },
];

export function OrderStatusUpdater({
  orderId,
  currentStatus,
  currentTrackingNumber,
  currentTrackingUrl,
  currentNotes,
  onUpdate,
}: OrderStatusUpdaterProps) {
  const [status, setStatus] = useState(currentStatus);
  const [trackingNumber, setTrackingNumber] = useState(
    currentTrackingNumber || ""
  );
  const [trackingUrl, setTrackingUrl] = useState(currentTrackingUrl || "");
  const [notes, setNotes] = useState(currentNotes || "");
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const hasChanges =
    status !== currentStatus ||
    trackingNumber !== (currentTrackingNumber || "") ||
    trackingUrl !== (currentTrackingUrl || "") ||
    notes !== (currentNotes || "");

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          tracking_number: trackingNumber || null,
          tracking_url: trackingUrl || null,
          notes: notes || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update order");
      }

      onUpdate();
    } catch (error) {
      console.error("Update order status error:", error);
    } finally {
      setSaving(false);
      setConfirmOpen(false);
    }
  };

  return (
    <div className="rounded-xl border border-admin-border bg-admin-surface p-5">
      <h3 className="mb-4 text-base font-semibold text-admin-text">
        Update Order Status
      </h3>

      <div className="space-y-4">
        <Select
          label="Order Status"
          value={status}
          onChange={(e) => setStatus(e.target.value as OrderStatus)}
          options={statusOptions}
          className="!bg-admin-bg !text-admin-text !border-admin-border"
        />

        <Input
          label="Tracking Number"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          placeholder="Enter tracking number"
          className="!bg-admin-bg !text-admin-text !border-admin-border"
        />

        <Input
          label="Tracking URL"
          value={trackingUrl}
          onChange={(e) => setTrackingUrl(e.target.value)}
          placeholder="https://tracking.example.com/..."
          className="!bg-admin-bg !text-admin-text !border-admin-border"
        />

        <Textarea
          label="Admin Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Internal notes about this order..."
          rows={3}
          className="!bg-admin-bg !text-admin-text !border-admin-border"
        />

        <Button
          onClick={() => setConfirmOpen(true)}
          disabled={!hasChanges}
          loading={saving}
          className="w-full sm:w-auto"
        >
          <Save className="h-4 w-4" />
          Update Order
        </Button>
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleUpdate}
        title="Confirm Status Change"
        description={`Are you sure you want to change the order status from "${currentStatus}" to "${status}"?`}
        confirmLabel="Update"
        loading={saving}
      />
    </div>
  );
}
