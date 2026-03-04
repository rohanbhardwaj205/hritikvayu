"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Edit, Trash2, ExternalLink, Calendar, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  PromotionForm,
  type PromotionFormData,
} from "@/components/admin/PromotionForm";
import type { Promotion } from "@/types";

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editPromotion, setEditPromotion] = useState<Promotion | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Promotion | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPromotions = useCallback(async () => {
    try {
      const res = await fetch("/api/promotions");
      if (res.ok) {
        const json = await res.json();
        setPromotions(json.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch promotions:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  const handleSave = async (data: PromotionFormData) => {
    const url = editPromotion
      ? `/api/promotions/${editPromotion.id}`
      : "/api/promotions";
    const method = editPromotion ? "PUT" : "POST";

    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("subtitle", data.subtitle);
    formData.append("link_url", data.link_url);
    formData.append("sort_order", String(data.sort_order));
    formData.append("is_active", String(data.is_active));
    if (data.starts_at) formData.append("starts_at", data.starts_at);
    if (data.ends_at) formData.append("ends_at", data.ends_at);
    if (data.image) formData.append("image", data.image);

    const res = await fetch(url, { method, body: formData });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to save promotion");
    }

    setEditPromotion(null);
    await fetchPromotions();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/promotions/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchPromotions();
      }
    } catch (error) {
      console.error("Delete promotion error:", error);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-admin-text">Promotions</h1>
          <p className="mt-1 text-sm text-admin-muted">
            Manage promotional banners and campaigns
          </p>
        </div>
        <Button
          onClick={() => {
            setEditPromotion(null);
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Add Promotion
        </Button>
      </div>

      {/* Promotions Grid */}
      {loading ? (
        <div className="py-12 text-center text-sm text-admin-muted">
          Loading promotions...
        </div>
      ) : promotions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-admin-border py-12 text-center">
          <p className="text-sm text-admin-muted">
            No promotions yet. Create your first promotion.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {promotions.map((promo) => {
            const now = new Date();
            const isExpired = promo.ends_at && new Date(promo.ends_at) < now;
            const isScheduled =
              promo.starts_at && new Date(promo.starts_at) > now;

            return (
              <div
                key={promo.id}
                className="overflow-hidden rounded-xl border border-admin-border bg-admin-surface"
              >
                {/* Image */}
                <div className="relative aspect-[16/9] bg-admin-bg">
                  {promo.image_url ? (
                    <img
                      src={promo.image_url}
                      alt={promo.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <ImageIcon className="h-10 w-10 text-admin-muted" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-1">
                    {promo.is_active ? (
                      <Badge variant="success" size="sm">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="error" size="sm">
                        Inactive
                      </Badge>
                    )}
                    {isExpired && (
                      <Badge variant="error" size="sm">
                        Expired
                      </Badge>
                    )}
                    {isScheduled && (
                      <Badge variant="info" size="sm">
                        Scheduled
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-admin-text">
                    {promo.title}
                  </h3>
                  {promo.subtitle && (
                    <p className="mt-0.5 text-xs text-admin-muted">
                      {promo.subtitle}
                    </p>
                  )}

                  {(promo.starts_at || promo.ends_at) && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-admin-muted">
                      <Calendar className="h-3 w-3" />
                      {promo.starts_at &&
                        new Date(promo.starts_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      {promo.starts_at && promo.ends_at && " - "}
                      {promo.ends_at &&
                        new Date(promo.ends_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                    </div>
                  )}

                  {promo.link_url && (
                    <div className="mt-1 flex items-center gap-1 text-xs text-primary-light">
                      <ExternalLink className="h-3 w-3" />
                      {promo.link_url}
                    </div>
                  )}

                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditPromotion(promo);
                        setFormOpen(true);
                      }}
                      className="rounded-md p-1.5 text-admin-muted transition-colors hover:bg-admin-bg hover:text-admin-text"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(promo)}
                      className="rounded-md p-1.5 text-admin-muted transition-colors hover:bg-red-500/10 hover:text-red-400"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <span className="ml-auto text-xs text-admin-muted">
                      #{promo.sort_order}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Promotion Form Modal */}
      <PromotionForm
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditPromotion(null);
        }}
        onSave={handleSave}
        promotion={editPromotion}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Promotion"
        description={`Are you sure you want to delete "${deleteTarget?.title}"?`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
