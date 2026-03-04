"use client";

import { useState } from "react";
import { Search, AlertTriangle, Check, X } from "lucide-react";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { cn } from "@/lib/utils";

interface InventoryItem {
  id: string;
  product_id: string;
  product_name: string;
  sku: string;
  size: string | null;
  color: string | null;
  color_hex: string | null;
  stock: number;
  low_stock_threshold: number;
}

interface InventoryTableProps {
  items: InventoryItem[];
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onStockUpdate: (variantId: string, newStock: number) => Promise<void>;
  showLowStockOnly: boolean;
  onToggleLowStock: (val: boolean) => void;
}

function StockStatus({
  stock,
  threshold,
}: {
  stock: number;
  threshold: number;
}) {
  if (stock === 0) {
    return <Badge variant="error">Out of Stock</Badge>;
  }
  if (stock <= threshold) {
    return <Badge variant="warning">Low Stock</Badge>;
  }
  return <Badge variant="success">In Stock</Badge>;
}

export function InventoryTable({
  items,
  totalPages,
  currentPage,
  onPageChange,
  onStockUpdate,
  showLowStockOnly,
  onToggleLowStock,
}: InventoryTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);

  const startEdit = (item: InventoryItem) => {
    setEditingId(item.id);
    setEditValue(String(item.stock));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const saveEdit = async (variantId: string) => {
    const newStock = parseInt(editValue, 10);
    if (isNaN(newStock) || newStock < 0) return;

    setSaving(true);
    try {
      await onStockUpdate(variantId, newStock);
    } finally {
      setSaving(false);
      setEditingId(null);
      setEditValue("");
    }
  };

  const columns: Column<Record<string, unknown>>[] = [
    {
      key: "product_name",
      label: "Product",
      render: (item) => {
        const inv = item as unknown as InventoryItem;
        return (
          <span className="font-medium text-admin-text">
            {inv.product_name}
          </span>
        );
      },
    },
    {
      key: "sku",
      label: "SKU",
      render: (item) => {
        const inv = item as unknown as InventoryItem;
        return (
          <code className="rounded bg-admin-bg px-2 py-0.5 text-xs text-admin-muted">
            {inv.sku}
          </code>
        );
      },
    },
    {
      key: "size",
      label: "Size",
      render: (item) => {
        const inv = item as unknown as InventoryItem;
        return (
          <span className="text-admin-text">{inv.size || "--"}</span>
        );
      },
    },
    {
      key: "color",
      label: "Color",
      render: (item) => {
        const inv = item as unknown as InventoryItem;
        if (!inv.color) return <span className="text-admin-muted">--</span>;
        return (
          <div className="flex items-center gap-2">
            {inv.color_hex && (
              <span
                className="inline-block h-4 w-4 rounded-full border border-admin-border"
                style={{ backgroundColor: inv.color_hex }}
              />
            )}
            <span className="text-admin-text">{inv.color}</span>
          </div>
        );
      },
    },
    {
      key: "stock",
      label: "Stock",
      sortable: true,
      render: (item) => {
        const inv = item as unknown as InventoryItem;

        if (editingId === inv.id) {
          return (
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                min="0"
                className="h-7 w-16 rounded border border-admin-border bg-admin-bg px-2 text-sm text-admin-text focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveEdit(inv.id);
                  if (e.key === "Escape") cancelEdit();
                }}
              />
              <button
                onClick={() => saveEdit(inv.id)}
                disabled={saving}
                className="rounded p-1 text-emerald-400 hover:bg-emerald-400/10"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={cancelEdit}
                className="rounded p-1 text-admin-muted hover:bg-admin-bg"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        }

        return (
          <button
            onClick={() => startEdit(inv)}
            className={cn(
              "rounded px-2 py-0.5 text-sm font-medium transition-colors hover:bg-admin-bg",
              inv.stock === 0
                ? "text-red-400"
                : inv.stock <= inv.low_stock_threshold
                  ? "text-yellow-400"
                  : "text-emerald-400"
            )}
            title="Click to edit stock"
          >
            {inv.stock}
          </button>
        );
      },
    },
    {
      key: "low_stock_threshold",
      label: "Threshold",
      render: (item) => {
        const inv = item as unknown as InventoryItem;
        return (
          <span className="text-admin-muted">{inv.low_stock_threshold}</span>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      render: (item) => {
        const inv = item as unknown as InventoryItem;
        return (
          <StockStatus
            stock={inv.stock}
            threshold={inv.low_stock_threshold}
          />
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showLowStockOnly}
            onChange={(e) => onToggleLowStock(e.target.checked)}
            className="h-4 w-4 rounded border-admin-border text-primary focus:ring-primary/30"
          />
          <span className="flex items-center gap-1.5 text-sm text-admin-text">
            <AlertTriangle className="h-3.5 w-3.5 text-yellow-400" />
            Low stock only
          </span>
        </label>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={items as unknown as Record<string, unknown>[]}
        emptyMessage="No inventory items found"
        rowKey={(item) => (item as unknown as InventoryItem).id}
        className="!border-admin-border [&_thead_tr]:!bg-admin-bg [&_thead_tr]:!border-admin-border [&_tbody]:!divide-admin-border [&_tbody_tr]:!bg-admin-surface [&_th]:!text-admin-muted [&_td]:!text-admin-text"
      />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
}
