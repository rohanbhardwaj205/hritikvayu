"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  Pencil,
  Trash2,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Rating } from "@/components/ui/Rating";
import { Spinner } from "@/components/ui/Spinner";
import { Pagination } from "@/components/ui/Pagination";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/providers/ToastProvider";
import type { Review } from "@/types";

interface ReviewWithProduct extends Review {
  product?: {
    name: string;
    slug: string;
    images?: { url: string }[];
  };
}

const PAGE_SIZE = 10;

export default function ReviewsPage() {
  const { addToast } = useToast();
  const [reviews, setReviews] = useState<ReviewWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Edit modal
  const [editModal, setEditModal] = useState(false);
  const [editingReview, setEditingReview] = useState<ReviewWithProduct | null>(
    null
  );
  const [editRating, setEditRating] = useState(5);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: PAGE_SIZE.toString(),
      });
      const res = await fetch(`/api/reviews/me?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.data ?? []);
        setTotalPages(data.pagination?.totalPages ?? 1);
      }
    } catch {
      addToast("Failed to load reviews", "error");
    } finally {
      setLoading(false);
    }
  }, [currentPage, addToast]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const openEditModal = (review: ReviewWithProduct) => {
    setEditingReview(review);
    setEditRating(review.rating);
    setEditTitle(review.title ?? "");
    setEditBody(review.body ?? "");
    setEditModal(true);
  };

  const handleUpdate = async () => {
    if (!editingReview) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/reviews/${editingReview.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: editRating,
          title: editTitle.trim() || null,
          body: editBody.trim() || null,
        }),
      });

      if (res.ok) {
        addToast("Review updated", "success");
        setEditModal(false);
        setEditingReview(null);
        fetchReviews();
      } else {
        const data = await res.json();
        addToast(data.error || "Failed to update review", "error");
      }
    } catch {
      addToast("Something went wrong", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this review?"
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/reviews/${id}`, { method: "DELETE" });
      if (res.ok) {
        addToast("Review deleted", "success");
        fetchReviews();
      } else {
        addToast("Failed to delete review", "error");
      }
    } catch {
      addToast("Something went wrong", "error");
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground font-display">
          My Reviews
        </h1>
        <p className="text-sm text-muted mt-1">
          Reviews you have written for purchased products.
        </p>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner size="lg" className="text-primary" />
        </div>
      ) : reviews.length > 0 ? (
        <>
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id} className="flex gap-4">
                {/* Product Image */}
                <div className="relative h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden border border-border bg-surface">
                  {review.product?.images?.[0]?.url ? (
                    <Image
                      src={review.product.images[0].url}
                      alt={review.product?.name ?? "Product"}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Star className="h-6 w-6 text-muted" />
                    </div>
                  )}
                </div>

                {/* Review Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      {review.product && (
                        <Link
                          href={`/products/${review.product.slug}`}
                          className="text-sm font-semibold text-foreground hover:text-primary transition-colors line-clamp-1"
                        >
                          {review.product.name}
                        </Link>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <Rating
                          value={review.rating}
                          size="sm"
                          readonly
                        />
                        <span className="text-xs text-muted">
                          {formatDate(review.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => openEditModal(review)}
                        className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-primary/5 transition-colors cursor-pointer"
                        aria-label="Edit review"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(review.id)}
                        className="p-1.5 rounded-lg text-muted hover:text-error hover:bg-error/5 transition-colors cursor-pointer"
                        aria-label="Delete review"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {review.title && (
                    <p className="text-sm font-medium text-foreground mt-2">
                      {review.title}
                    </p>
                  )}
                  {review.body && (
                    <p className="text-sm text-muted mt-1 leading-relaxed line-clamp-3">
                      {review.body}
                    </p>
                  )}

                  {review.is_verified && (
                    <span className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-success">
                      Verified Purchase
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            className="mt-8"
          />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex items-center justify-center h-16 w-16 rounded-full bg-surface-2 mb-4">
            <MessageSquare className="h-8 w-8 text-muted" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            No reviews yet
          </h3>
          <p className="text-sm text-muted max-w-sm">
            After purchasing and receiving products, you can share your experience
            by writing a review.
          </p>
        </div>
      )}

      {/* Edit Review Modal */}
      <Modal
        isOpen={editModal}
        onClose={() => {
          setEditModal(false);
          setEditingReview(null);
        }}
        title="Edit Review"
        size="md"
      >
        <div className="space-y-4">
          {editingReview?.product && (
            <p className="text-sm text-muted">
              Reviewing: <span className="font-medium text-foreground">{editingReview.product.name}</span>
            </p>
          )}

          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              Rating
            </label>
            <Rating
              value={editRating}
              onChange={setEditRating}
              size="lg"
            />
          </div>

          <Input
            label="Title (Optional)"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Summarize your experience"
          />

          <Textarea
            label="Review (Optional)"
            value={editBody}
            onChange={(e) => setEditBody(e.target.value)}
            placeholder="Share your experience with this product..."
            rows={4}
          />

          <div className="flex items-center gap-3 pt-2">
            <Button
              variant="primary"
              onClick={handleUpdate}
              loading={saving}
              disabled={saving}
            >
              Update Review
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setEditModal(false);
                setEditingReview(null);
              }}
              disabled={saving}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
