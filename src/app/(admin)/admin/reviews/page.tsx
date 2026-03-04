"use client";

import { useState, useEffect, useCallback } from "react";
import { CheckCircle, XCircle, Filter } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ReviewModerationCard } from "@/components/admin/ReviewModerationCard";
import { Pagination } from "@/components/ui/Pagination";
import { cn } from "@/lib/utils";
import type { Review } from "@/types";

type ReviewFilter = "pending" | "approved" | "rejected";

const filterTabs: Array<{ label: string; value: ReviewFilter }> = [
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

interface ReviewWithDetails extends Review {
  product_name?: string;
  customer_name?: string;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ReviewFilter>("pending");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        pageSize: "10",
        filter,
      });
      const res = await fetch(`/api/admin/reviews?${params}`);
      if (res.ok) {
        const json = await res.json();
        setReviews(json.data || []);
        setTotalPages(json.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filter]);

  useEffect(() => {
    fetchReviews();
    setSelectedIds(new Set());
  }, [fetchReviews]);

  const handleApprove = async (reviewId: string) => {
    const res = await fetch(`/api/admin/reviews/${reviewId}/approve`, {
      method: "PUT",
    });
    if (res.ok) {
      await fetchReviews();
    }
  };

  const handleReject = async (reviewId: string) => {
    const res = await fetch(`/api/admin/reviews/${reviewId}/reject`, {
      method: "PUT",
    });
    if (res.ok) {
      await fetchReviews();
    }
  };

  const handleDelete = async (reviewId: string) => {
    const res = await fetch(`/api/admin/reviews/${reviewId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      await fetchReviews();
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.size === 0) return;
    setBulkLoading(true);
    try {
      await Promise.all(
        Array.from(selectedIds).map((id) =>
          fetch(`/api/admin/reviews/${id}/approve`, { method: "PUT" })
        )
      );
      setSelectedIds(new Set());
      await fetchReviews();
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkReject = async () => {
    if (selectedIds.size === 0) return;
    setBulkLoading(true);
    try {
      await Promise.all(
        Array.from(selectedIds).map((id) =>
          fetch(`/api/admin/reviews/${id}/reject`, { method: "PUT" })
        )
      );
      setSelectedIds(new Set());
      await fetchReviews();
    } finally {
      setBulkLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === reviews.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(reviews.map((r) => r.id)));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-admin-text">
          Review Moderation
        </h1>
        <p className="mt-1 text-sm text-admin-muted">
          Approve, reject, or delete customer reviews
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-1 rounded-lg bg-admin-bg p-1">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setFilter(tab.value);
                setCurrentPage(1);
              }}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                filter === tab.value
                  ? "bg-admin-surface text-admin-text"
                  : "text-admin-muted hover:text-admin-text"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Bulk Actions */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-admin-muted">
              {selectedIds.size} selected
            </span>
            {filter === "pending" && (
              <>
                <Button
                  size="sm"
                  onClick={handleBulkApprove}
                  loading={bulkLoading}
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  Approve All
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleBulkReject}
                  loading={bulkLoading}
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Reject All
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Select All */}
      {reviews.length > 0 && (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={selectedIds.size === reviews.length && reviews.length > 0}
            onChange={toggleSelectAll}
            className="h-4 w-4 rounded border-admin-border text-primary focus:ring-primary/30"
          />
          <span className="text-sm text-admin-muted">Select all</span>
        </label>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="py-12 text-center text-sm text-admin-muted">
          Loading reviews...
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-xl border border-dashed border-admin-border py-12 text-center">
          <p className="text-sm text-admin-muted">
            No {filter} reviews found
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={selectedIds.has(review.id)}
                onChange={() => toggleSelect(review.id)}
                className="mt-5 h-4 w-4 rounded border-admin-border text-primary focus:ring-primary/30"
              />
              <div className="flex-1">
                <ReviewModerationCard
                  review={review}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onDelete={handleDelete}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
