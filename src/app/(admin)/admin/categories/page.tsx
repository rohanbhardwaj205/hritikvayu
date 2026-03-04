"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  FolderTree,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  CategoryForm,
  type CategoryFormData,
} from "@/components/admin/CategoryForm";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories?tree=true");
      if (res.ok) {
        const json = await res.json();
        setCategories(json.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const flatCategories = (() => {
    const flat: Category[] = [];
    const flatten = (cats: Category[]) => {
      for (const cat of cats) {
        flat.push(cat);
        if (cat.children?.length) flatten(cat.children);
      }
    };
    flatten(categories);
    return flat;
  })();

  const handleSave = async (data: CategoryFormData) => {
    const url = editCategory
      ? `/api/categories/${editCategory.id}`
      : "/api/categories";
    const method = editCategory ? "PUT" : "POST";

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("slug", data.slug);
    formData.append("description", data.description);
    formData.append("parent_id", data.parent_id || "");
    formData.append("sort_order", String(data.sort_order));
    formData.append("is_active", String(data.is_active));
    if (data.image) {
      formData.append("image", data.image);
    }

    const res = await fetch(url, { method, body: formData });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to save category");
    }

    setEditCategory(null);
    await fetchCategories();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/categories/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchCategories();
      }
    } catch (error) {
      console.error("Delete category error:", error);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const renderCategoryRow = (category: Category, depth: number = 0) => {
    return (
      <div key={category.id}>
        <div
          className={cn(
            "flex items-center gap-3 border-b border-admin-border px-5 py-3 transition-colors hover:bg-admin-bg/50",
            depth > 0 && "bg-admin-bg/30"
          )}
          style={{ paddingLeft: `${20 + depth * 24}px` }}
        >
          {depth > 0 && (
            <ChevronRight className="h-3.5 w-3.5 text-admin-muted" />
          )}

          {category.image_url && (
            <img
              src={category.image_url}
              alt={category.name}
              className="h-8 w-8 rounded-lg object-cover"
            />
          )}

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-admin-text">
              {category.name}
            </p>
            <p className="text-xs text-admin-muted">{category.slug}</p>
          </div>

          <span className="text-xs text-admin-muted">
            #{category.sort_order}
          </span>

          {category.is_active ? (
            <Badge variant="success" size="sm">
              Active
            </Badge>
          ) : (
            <Badge variant="error" size="sm">
              Inactive
            </Badge>
          )}

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setEditCategory(category);
                setFormOpen(true);
              }}
              className="rounded-md p-1.5 text-admin-muted transition-colors hover:bg-admin-surface hover:text-admin-text"
              title="Edit category"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => setDeleteTarget(category)}
              className="rounded-md p-1.5 text-admin-muted transition-colors hover:bg-red-500/10 hover:text-red-400"
              title="Delete category"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Children */}
        {category.children?.map((child) =>
          renderCategoryRow(child, depth + 1)
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-admin-text">Categories</h1>
          <p className="mt-1 text-sm text-admin-muted">
            Manage your product categories
          </p>
        </div>
        <Button
          onClick={() => {
            setEditCategory(null);
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Category Tree */}
      <div className="rounded-xl border border-admin-border bg-admin-surface">
        <div className="flex items-center gap-2 border-b border-admin-border px-5 py-3">
          <FolderTree className="h-4 w-4 text-admin-muted" />
          <span className="text-xs font-semibold uppercase tracking-wider text-admin-muted">
            Category / Slug
          </span>
          <span className="ml-auto text-xs font-semibold uppercase tracking-wider text-admin-muted">
            Order | Status | Actions
          </span>
        </div>

        {loading ? (
          <div className="px-5 py-12 text-center text-sm text-admin-muted">
            Loading categories...
          </div>
        ) : categories.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-admin-muted">
            No categories yet. Create your first category.
          </div>
        ) : (
          categories.map((cat) => renderCategoryRow(cat))
        )}
      </div>

      {/* Category Form Modal */}
      <CategoryForm
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditCategory(null);
        }}
        onSave={handleSave}
        category={editCategory}
        categories={flatCategories}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? Subcategories will become top-level.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
