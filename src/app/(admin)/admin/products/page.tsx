"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search, Edit, Trash2, ImageIcon } from "lucide-react";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatPrice } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";
import type { Product } from "@/types";

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        pageSize: "10",
      });
      if (debouncedSearch) params.set("search", debouncedSearch);

      const res = await fetch(`/api/products?${params}`);
      if (res.ok) {
        const json = await res.json();
        setProducts(json.data);
        setTotalPages(json.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/products/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchProducts();
      }
    } catch (error) {
      console.error("Delete product error:", error);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const getTotalStock = (product: Product) => {
    return (
      product.variants?.reduce((sum, v) => sum + v.stock, 0) || 0
    );
  };

  const columns: Column<Record<string, unknown>>[] = [
    {
      key: "image",
      label: "Image",
      className: "w-16",
      render: (item) => {
        const product = item as unknown as Product;
        const primaryImage = product.images?.find((img) => img.is_primary) ||
          product.images?.[0];
        return primaryImage ? (
          <img
            src={primaryImage.url}
            alt={product.name}
            className="h-10 w-10 rounded-lg object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-admin-bg">
            <ImageIcon className="h-5 w-5 text-admin-muted" />
          </div>
        );
      },
    },
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (item) => {
        const product = item as unknown as Product;
        return (
          <div>
            <p className="font-medium text-admin-text">{product.name}</p>
            <p className="text-xs text-admin-muted">{product.slug}</p>
          </div>
        );
      },
    },
    {
      key: "category",
      label: "Category",
      render: (item) => {
        const product = item as unknown as Product;
        return (
          <span className="text-admin-muted">
            {product.category?.name || "--"}
          </span>
        );
      },
    },
    {
      key: "base_price",
      label: "Price",
      sortable: true,
      render: (item) => {
        const product = item as unknown as Product;
        return (
          <span className="font-medium text-admin-text">
            {formatPrice(product.base_price)}
          </span>
        );
      },
    },
    {
      key: "stock",
      label: "Stock",
      render: (item) => {
        const product = item as unknown as Product;
        const stock = getTotalStock(product);
        return (
          <span
            className={
              stock === 0
                ? "text-red-400"
                : stock < 10
                  ? "text-yellow-400"
                  : "text-emerald-400"
            }
          >
            {stock}
          </span>
        );
      },
    },
    {
      key: "is_active",
      label: "Status",
      render: (item) => {
        const product = item as unknown as Product;
        return product.is_active ? (
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
        const product = item as unknown as Product;
        return (
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/admin/products/${product.id}/edit`);
              }}
              className="rounded-md p-1.5 text-admin-muted transition-colors hover:bg-admin-bg hover:text-admin-text"
              title="Edit product"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDeleteTarget(product);
              }}
              className="rounded-md p-1.5 text-admin-muted transition-colors hover:bg-red-500/10 hover:text-red-400"
              title="Delete product"
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
          <h1 className="text-2xl font-bold text-admin-text">Products</h1>
          <p className="mt-1 text-sm text-admin-muted">
            Manage your product catalog
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-muted" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Search products..."
          className="h-10 w-full rounded-lg border border-admin-border bg-admin-surface pl-10 pr-4 text-sm text-admin-text placeholder:text-admin-muted focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 sm:w-80"
        />
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={products as unknown as Record<string, unknown>[]}
        loading={loading}
        emptyMessage="No products found"
        rowKey={(item) => (item as unknown as Product).id}
        className="!border-admin-border [&_thead_tr]:!bg-admin-bg [&_thead_tr]:!border-admin-border [&_tbody]:!divide-admin-border [&_tbody_tr]:!bg-admin-surface [&_th]:!text-admin-muted [&_td]:!text-admin-text"
      />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
