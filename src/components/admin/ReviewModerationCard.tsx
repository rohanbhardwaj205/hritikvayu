"use client";

import { useState } from "react";
import { Star, CheckCircle, XCircle, Trash2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { cn } from "@/lib/utils";
import type { Review } from "@/types";

interface ReviewModerationCardProps {
  review: Review & { product_name?: string; customer_name?: string };
  onApprove: (reviewId: string) => Promise<void>;
  onReject: (reviewId: string) => Promise<void>;
  onDelete: (reviewId: string) => Promise<void>;
}

export function ReviewModerationCard({
  review,
  onApprove,
  onReject,
  onDelete,
}: ReviewModerationCardProps) {
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const handleAction = async (
    action: (id: string) => Promise<void>
  ) => {
    setLoading(true);
    try {
      await action(review.id);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onDelete(review.id);
    } finally {
      setLoading(false);
      setDeleteConfirm(false);
    }
  };

  return (
    <div className="rounded-xl border border-admin-border bg-admin-surface p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-admin-text">
            {review.product_name || "Product"}
          </p>
          <p className="mt-0.5 text-xs text-admin-muted">
            by {review.customer_name || review.profile?.full_name || "Customer"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {review.is_verified && (
            <Badge variant="info" size="sm">
              <ShieldCheck className="mr-1 h-3 w-3" />
              Verified
            </Badge>
          )}
          {review.is_approved ? (
            <Badge variant="success" size="sm">Approved</Badge>
          ) : (
            <Badge variant="warning" size="sm">Pending</Badge>
          )}
        </div>
      </div>

      {/* Rating */}
      <div className="mt-3 flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              "h-4 w-4",
              i < review.rating
                ? "fill-amber-400 text-amber-400"
                : "text-admin-border"
            )}
          />
        ))}
        <span className="ml-1.5 text-sm text-admin-muted">
          {review.rating}/5
        </span>
      </div>

      {/* Title */}
      {review.title && (
        <p className="mt-3 text-sm font-medium text-admin-text">
          {review.title}
        </p>
      )}

      {/* Body */}
      {review.body && (
        <p className="mt-2 text-sm leading-relaxed text-admin-muted">
          {review.body}
        </p>
      )}

      {/* Date */}
      <p className="mt-3 text-xs text-admin-muted">
        {new Date(review.created_at).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>

      {/* Actions */}
      <div className="mt-4 flex items-center gap-2 border-t border-admin-border pt-4">
        {!review.is_approved && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleAction(onApprove)}
            loading={loading}
          >
            <CheckCircle className="h-3.5 w-3.5" />
            Approve
          </Button>
        )}
        {review.is_approved && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction(onReject)}
            loading={loading}
          >
            <XCircle className="h-3.5 w-3.5" />
            Reject
          </Button>
        )}
        {!review.is_approved && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction(onReject)}
            loading={loading}
          >
            <XCircle className="h-3.5 w-3.5" />
            Reject
          </Button>
        )}
        <Button
          variant="danger"
          size="sm"
          onClick={() => setDeleteConfirm(true)}
          loading={loading}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </Button>
      </div>

      <ConfirmDialog
        isOpen={deleteConfirm}
        onClose={() => setDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Review"
        description="Are you sure you want to permanently delete this review? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        loading={loading}
      />
    </div>
  );
}
